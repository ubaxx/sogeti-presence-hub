import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { User } from "../../../data/mockUsers";
import { addSogetiLogo } from "./pdfBranding";

const COLORS = {
  alert: [196, 49, 75] as [number, number, number],
  alertSoft: [250, 245, 246] as [number, number, number],
  brand: [98, 100, 167] as [number, number, number],
  shell: [36, 38, 47] as [number, number, number],
  panel: [250, 245, 246] as [number, number, number],
  border: [225, 223, 221] as [number, number, number],
  ink: [28, 32, 43] as [number, number, number],
  muted: [98, 108, 122] as [number, number, number],
  success: [16, 124, 65] as [number, number, number]
};

function getStatusSummary(users: User[]) {
  return {
    office: users.filter((u) => u.status === "office").length,
    remote: users.filter((u) => u.status === "remote").length,
    client: users.filter((u) => u.status === "client").length,
    offline: users.filter((u) => u.status === "offline").length
  };
}

function addEmergencyHeader(
  doc: jsPDF,
  generatedAt: Date,
  reportId: string
): void {
  doc.setFillColor(COLORS.alert[0], COLORS.alert[1], COLORS.alert[2]);
  doc.rect(0, 0, 210, 32, "F");
  doc.setFillColor(COLORS.brand[0], COLORS.brand[1], COLORS.brand[2]);
  doc.rect(0, 32, 210, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text("Emergency Evacuation Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated ${generatedAt.toLocaleString()}  |  ${reportId}`, 14, 24);
}

function addSnapshotPanel(
  doc: jsPDF,
  recipients: number,
  occupancyRate: number,
  statusSummary: ReturnType<typeof getStatusSummary>,
  y: number
): number {
  doc.setFillColor(COLORS.alertSoft[0], COLORS.alertSoft[1], COLORS.alertSoft[2]);
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.roundedRect(14, y, 182, 30, 5, 5, "FD");

  doc.setFontSize(9);
  doc.setTextColor(COLORS.alert[0], COLORS.alert[1], COLORS.alert[2]);
  doc.text("EMERGENCY SNAPSHOT", 18, y + 8);

  doc.setFontSize(15);
  doc.setTextColor(COLORS.ink[0], COLORS.ink[1], COLORS.ink[2]);
  doc.text(`${recipients} people currently in office`, 18, y + 18);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(
    `Occupancy ${occupancyRate}%  |  Remote ${statusSummary.remote}  |  Client ${statusSummary.client}  |  Offline ${statusSummary.offline}`,
    18,
    y + 25
  );

  return y + 36;
}

function addEmergencyFooter(
  doc: jsPDF,
  pageCount: number,
  generatedAt: Date
): void {
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.line(14, 286, 196, 286);
    doc.setFontSize(9);
    doc.setTextColor(COLORS.alert[0], COLORS.alert[1], COLORS.alert[2]);
    doc.text("Sogeti Emergency Report", 14, 291);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text("Emergency coordination only", 105, 291, { align: "center" });
    doc.text(generatedAt.toLocaleString(), 156, 291, { align: "center" });
    doc.text(`Page ${page} of ${pageCount}`, 196, 291, { align: "right" });
  }
}

export async function exportEmergencyPDF(users: User[]) {
  const doc = new jsPDF();
  const inOffice = users.filter((u) => u.status === "office");
  const statusSummary = getStatusSummary(users);
  const generatedAt = new Date();
  const reportId = `Alert ID ER-${generatedAt.getFullYear()}${String(
    generatedAt.getMonth() + 1
  ).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}-${String(
    generatedAt.getHours()
  ).padStart(2, "0")}${String(generatedAt.getMinutes()).padStart(2, "0")}`;
  const occupancyRate = users.length
    ? Math.round((inOffice.length / users.length) * 100)
    : 0;

  addEmergencyHeader(doc, generatedAt, reportId);
  await addSogetiLogo(doc, 150, 8, 42, 12);

  let y = 42;
  y = addSnapshotPanel(doc, inOffice.length, occupancyRate, statusSummary, y);

  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: COLORS.ink
    },
    headStyles: {
      fillColor: COLORS.alert,
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [251, 248, 249]
    },
    head: [["Name", "Initials", "Role", "Status"]],
    body: inOffice.map((user) => [
      user.name,
      user.initials,
      user.role,
      user.status
    ]),
    margin: { left: 14, right: 14 }
  });

  const finalY =
    ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? 110) + 8;

  autoTable(doc, {
    startY: finalY,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: COLORS.ink
    },
    body: [
      [
        "Operational note",
        `Use this report for emergency coordination only. ${inOffice.length} people are currently registered on site, representing ${occupancyRate}% of the tracked population. This snapshot reflects the latest available office presence status at export time.`
      ],
      [
        "Alert confirmation",
        `A Teams emergency notification should be directed to all listed on-site individuals. Reconcile this report with local floor marshals if any occupancy changes occurred after ${generatedAt.toLocaleTimeString()}.`
      ]
    ],
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 140 }
    },
    margin: { left: 14, right: 14 }
  });

  addEmergencyFooter(doc, doc.getNumberOfPages(), generatedAt);
  doc.save("emergency-report.pdf");
}
