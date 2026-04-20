import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { User } from "../../../data/mockUsers";
import {
  getPresenceHistoryLast30Days,
  getWeekNumber,
  type PresenceHistoryEntry
} from "../../../services/presenceHistory";
import { buildBarChartImage } from "./pdfChartBuilder";
import { addSogetiLogo } from "./pdfBranding";

const COLORS = {
  ink: [28, 32, 43] as [number, number, number],
  muted: [98, 108, 122] as [number, number, number],
  border: [225, 223, 221] as [number, number, number],
  shell: [36, 38, 47] as [number, number, number],
  brand: [98, 100, 167] as [number, number, number],
  brandSoft: [236, 237, 251] as [number, number, number],
  panel: [248, 249, 252] as [number, number, number],
  success: [16, 124, 65] as [number, number, number]
};

type StatusTotals = {
  office: number;
  remote: number;
  client: number;
  offline: number;
};

type WeekdayAverage = {
  day: string;
  office: number;
  remote: number;
  client: number;
  offline: number;
};

function formatDateLabel(value: string): string {
  const date = new Date(value);

  return date.toLocaleDateString("sv-SE", {
    month: "short",
    day: "2-digit"
  });
}

function getCurrentStatusTotals(users: User[]): StatusTotals {
  return {
    office: users.filter((u) => u.status === "office").length,
    remote: users.filter((u) => u.status === "remote").length,
    client: users.filter((u) => u.status === "client").length,
    offline: users.filter((u) => u.status === "offline").length
  };
}

function getAverageTotals(entries: PresenceHistoryEntry[]): StatusTotals {
  if (entries.length === 0) {
    return {
      office: 0,
      remote: 0,
      client: 0,
      offline: 0
    };
  }

  const totals = entries.reduce(
    (acc, entry) => ({
      office: acc.office + entry.office,
      remote: acc.remote + entry.remote,
      client: acc.client + entry.client,
      offline: acc.offline + entry.offline
    }),
    {
      office: 0,
      remote: 0,
      client: 0,
      offline: 0
    }
  );

  return {
    office: Math.round(totals.office / entries.length),
    remote: Math.round(totals.remote / entries.length),
    client: Math.round(totals.client / entries.length),
    offline: Math.round(totals.offline / entries.length)
  };
}

function getPeakAndLowestDays(entries: PresenceHistoryEntry[]) {
  if (entries.length === 0) {
    return {
      peakDay: "N/A",
      peakOffice: 0,
      lowestDay: "N/A",
      lowestOffice: 0
    };
  }

  const peak = entries.reduce((best, entry) =>
    entry.office > best.office ? entry : best
  );

  const lowest = entries.reduce((best, entry) =>
    entry.office < best.office ? entry : best
  );

  return {
    peakDay: formatDateLabel(peak.timestamp),
    peakOffice: peak.office,
    lowestDay: formatDateLabel(lowest.timestamp),
    lowestOffice: lowest.office
  };
}

function getWeekdayAverages(entries: PresenceHistoryEntry[]): WeekdayAverage[] {
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const grouped = weekdays.map((day) => ({
    day,
    office: 0,
    remote: 0,
    client: 0,
    offline: 0,
    count: 0
  }));

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dayIndex = (date.getDay() + 6) % 7;

    if (dayIndex > 4) {
      return;
    }

    const target = grouped[dayIndex];
    target.office += entry.office;
    target.remote += entry.remote;
    target.client += entry.client;
    target.offline += entry.offline;
    target.count += 1;
  });

  return grouped.map((item) => ({
    day: item.day,
    office: item.count ? Math.round(item.office / item.count) : 0,
    remote: item.count ? Math.round(item.remote / item.count) : 0,
    client: item.count ? Math.round(item.client / item.count) : 0,
    offline: item.count ? Math.round(item.offline / item.count) : 0
  }));
}

function getRoleSummary(users: User[]) {
  return {
    admins: users.filter((user) => user.role === "admin").length,
    users: users.filter((user) => user.role !== "admin").length
  };
}

function getWeeklyChange(history: PresenceHistoryEntry[]): number {
  return history.length >= 14
    ? history[history.length - 1].office - history[history.length - 8].office
    : 0;
}

function buildKeyFindings(
  averageTotals: StatusTotals,
  peakDay: string,
  peakOffice: number,
  lowestDay: string,
  occupancyRate: number,
  weeklyChange: number
): string[] {
  return [
    `Average office attendance is ${averageTotals.office} across the last 30 days.`,
    `${peakDay} was the busiest recorded day with ${peakOffice} people on site.`,
    `${lowestDay} was the lightest day for office use in the current report window.`,
    `Current on-site occupancy is ${occupancyRate}% of the tracked population.`,
    weeklyChange === 0
      ? "Office attendance is stable compared with the previous week."
      : `Office attendance is ${weeklyChange > 0 ? "up" : "down"} ${Math.abs(weeklyChange)} compared with the previous week.`
  ];
}

function addSectionTitle(doc: jsPDF, title: string, subtitle: string, y: number): number {
  doc.setFontSize(14);
  doc.setTextColor(COLORS.ink[0], COLORS.ink[1], COLORS.ink[2]);
  doc.text(title, 14, y);
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(subtitle, 14, y + 6);
  doc.setDrawColor(COLORS.brand[0], COLORS.brand[1], COLORS.brand[2]);
  doc.setLineWidth(0.6);
  doc.line(14, y + 9, 48, y + 9);
  return y + 15;
}

function addExecutiveHeader(
  doc: jsPDF,
  generatedAt: Date,
  reportId: string
): void {
  doc.setFillColor(COLORS.shell[0], COLORS.shell[1], COLORS.shell[2]);
  doc.rect(0, 0, 210, 36, "F");
  doc.setFillColor(COLORS.brand[0], COLORS.brand[1], COLORS.brand[2]);
  doc.rect(0, 36, 210, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Presence Hub Manager Report", 14, 15);
  doc.setFontSize(10);
  doc.text("Sogeti x Microsoft Teams", 14, 22);
  doc.text(
    `Generated ${generatedAt.toLocaleString()}  |  Week ${getWeekNumber(generatedAt)}  |  ${reportId}`,
    14,
    29
  );
}

function addStatusSummaryCards(
  doc: jsPDF,
  totals: StatusTotals,
  startY: number
): number {
  const cards = [
    { label: "Office now", value: totals.office, fill: [232, 245, 236] as const },
    { label: "Remote now", value: totals.remote, fill: [255, 244, 229] as const },
    { label: "Client now", value: totals.client, fill: [229, 241, 251] as const },
    { label: "Offline now", value: totals.offline, fill: [243, 244, 246] as const }
  ];

  let x = 14;

  cards.forEach((card) => {
    doc.setFillColor(card.fill[0], card.fill[1], card.fill[2]);
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.roundedRect(x, startY, 42, 26, 4, 4, "FD");

    doc.setTextColor(COLORS.ink[0], COLORS.ink[1], COLORS.ink[2]);
    doc.setFontSize(9);
    doc.text(card.label, x + 4, startY + 8);
    doc.setFontSize(17);
    doc.text(String(card.value), x + 4, startY + 19);

    x += 46;
  });

  return startY + 32;
}

function addKeyFindingsPanel(doc: jsPDF, findings: string[], y: number): number {
  const panelHeight = 42;

  doc.setFillColor(COLORS.brandSoft[0], COLORS.brandSoft[1], COLORS.brandSoft[2]);
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.roundedRect(14, y, 182, panelHeight, 5, 5, "FD");

  doc.setFontSize(9);
  doc.setTextColor(COLORS.brand[0], COLORS.brand[1], COLORS.brand[2]);
  doc.text("KEY FINDINGS", 18, y + 8);

  doc.setFontSize(10);
  doc.setTextColor(COLORS.ink[0], COLORS.ink[1], COLORS.ink[2]);

  findings.slice(0, 3).forEach((finding, index) => {
    doc.text(`• ${finding}`, 18, y + 16 + index * 8, { maxWidth: 172 });
  });

  return y + panelHeight + 8;
}

function addChartPanel(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  subtitle: string,
  caption: string,
  image?: string
) {
  doc.setFillColor(COLORS.panel[0], COLORS.panel[1], COLORS.panel[2]);
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.ink[0], COLORS.ink[1], COLORS.ink[2]);
  doc.text(title, x + 4, y + 7);
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(subtitle, x + 4, y + 12);

  if (image) {
    doc.addImage(image, "PNG", x + 4, y + 16, w - 8, h - 24);
  }

  doc.setFontSize(7);
  doc.text(caption, x + 4, y + h - 3, { maxWidth: w - 8 });
}

function addFooter(
  doc: jsPDF,
  pageCount: number,
  generatedAt: Date,
  reportLabel: string
): void {
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.line(14, 286, 196, 286);
    doc.setFontSize(9);
    doc.setTextColor(COLORS.brand[0], COLORS.brand[1], COLORS.brand[2]);
    doc.text("Sogeti Presence Hub", 14, 291);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(reportLabel, 86, 291, { align: "center" });
    doc.text(generatedAt.toLocaleString(), 146, 291, { align: "center" });
    doc.text(`Page ${page} of ${pageCount}`, 196, 291, { align: "right" });
  }
}

export async function exportPresencePDF(users: User[]) {
  const doc = new jsPDF();
  const generatedAt = new Date();
  const reportId = `Report ID PH-${generatedAt.getFullYear()}${String(
    generatedAt.getMonth() + 1
  ).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}-${String(
    generatedAt.getHours()
  ).padStart(2, "0")}${String(generatedAt.getMinutes()).padStart(2, "0")}`;
  const history = getPresenceHistoryLast30Days();
  const currentTotals = getCurrentStatusTotals(users);
  const averageTotals = getAverageTotals(history);
  const weekdayAverages = getWeekdayAverages(history);
  const { peakDay, peakOffice, lowestDay, lowestOffice } =
    getPeakAndLowestDays(history);
  const roleSummary = getRoleSummary(users);
  const occupancyRate = users.length
    ? Math.round((currentTotals.office / users.length) * 100)
    : 0;
  const weeklyChange = getWeeklyChange(history);
  const keyFindings = buildKeyFindings(
    averageTotals,
    peakDay,
    peakOffice,
    lowestDay,
    occupancyRate,
    weeklyChange
  );

  addExecutiveHeader(doc, generatedAt, reportId);
  await addSogetiLogo(doc, 148, 8, 46, 14);

  let y = 46;
  y = addSectionTitle(
    doc,
    "Executive Summary",
    "Anonymous workplace occupancy trends for the last 30 days",
    y
  );
  y = addKeyFindingsPanel(doc, keyFindings, y);
  y = addStatusSummaryCards(doc, currentTotals, y);

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: COLORS.ink
    },
    headStyles: {
      fillColor: COLORS.brand,
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: COLORS.panel
    },
    body: [
      ["Average office / day", String(averageTotals.office)],
      ["Average remote / day", String(averageTotals.remote)],
      ["Occupancy rate today", `${occupancyRate}%`],
      ["Peak day", `${peakDay} (${peakOffice})`],
      ["Lowest day", `${lowestDay} (${lowestOffice})`],
      [
        "Week-over-week office change",
        `${weeklyChange > 0 ? "+" : ""}${weeklyChange}`
      ]
    ],
    margin: { left: 14, right: 14 }
  });

  y =
    ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? y + 40) + 10;
  y = addSectionTitle(
    doc,
    "Attendance Visuals",
    "Print-friendly charts with quick interpretation",
    y
  );

  const weekdayChart = buildBarChartImage(
    weekdayAverages.map((item) => item.office),
    weekdayAverages.map((item) => item.day),
    {
      title: "Weekday office average",
      subtitle: "Average number of employees on site",
      highlightIndex: weekdayAverages.findIndex(
        (item) =>
          item.office === Math.max(...weekdayAverages.map((weekday) => weekday.office), 0)
      )
    }
  );

  const trendChart = buildBarChartImage(
    history.slice(-7).map((entry) => entry.office),
    history.slice(-7).map((entry) => formatDateLabel(entry.timestamp)),
    {
      title: "Latest 7-day trend",
      subtitle: "Most recent office attendance snapshots",
      highlightIndex: history.slice(-7).findIndex(
        (entry) =>
          entry.office === Math.max(...history.slice(-7).map((item) => item.office), 0)
      )
    }
  );

  addChartPanel(
    doc,
    14,
    y,
    84,
    52,
    "Weekday office average",
    "Mon-Fri rolling average",
    "Use this view to identify the most reliable office-heavy weekday.",
    weekdayChart
  );
  addChartPanel(
    doc,
    108,
    y,
    88,
    52,
    "Latest 7-day trend",
    "Most recent office snapshots",
    "Recent movement shows whether office attendance is stabilising or shifting.",
    trendChart
  );

  y += 58;

  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: {
      fontSize: 9,
      textColor: COLORS.ink,
      cellPadding: 4
    },
    headStyles: {
      fillColor: COLORS.shell,
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: COLORS.panel
    },
    head: [["Weekday", "Office avg", "Remote avg", "Client avg", "Offline avg"]],
    body: weekdayAverages.map((item) => [
      item.day,
      String(item.office),
      String(item.remote),
      String(item.client),
      String(item.offline)
    ]),
    margin: { left: 14, right: 14 }
  });

  doc.addPage();
  let pageTwoY = 18;
  pageTwoY = addSectionTitle(
    doc,
    "Detailed Breakdown",
    "Operational metrics and anonymised workforce mix",
    pageTwoY
  );

  autoTable(doc, {
    startY: pageTwoY,
    theme: "striped",
    styles: {
      fontSize: 9,
      textColor: COLORS.ink,
      cellPadding: 4
    },
    headStyles: {
      fillColor: COLORS.brand,
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: COLORS.panel
    },
    head: [["Metric", "Value"]],
    body: [
      ["Users tracked", String(users.length)],
      ["Admins", String(roleSummary.admins)],
      ["Standard users", String(roleSummary.users)],
      ["Report window", `${history.length} recorded daily snapshots`],
      ["Current office users", String(currentTotals.office)],
      ["Current remote users", String(currentTotals.remote)],
      ["Current client users", String(currentTotals.client)],
      ["Current offline users", String(currentTotals.offline)]
    ],
    margin: { left: 14, right: 14 }
  });

  const afterMetricsY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? 70;

  autoTable(doc, {
    startY: afterMetricsY + 8,
    theme: "striped",
    styles: {
      fontSize: 9,
      textColor: COLORS.ink,
      cellPadding: 4
    },
    headStyles: {
      fillColor: COLORS.shell,
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: COLORS.panel
    },
    head: [["Population mix", "Value"]],
    body: [
      ["Admin share", `${users.length ? Math.round((roleSummary.admins / users.length) * 100) : 0}%`],
      ["Office share today", `${occupancyRate}%`],
      [
        "Remote share today",
        `${users.length ? Math.round((currentTotals.remote / users.length) * 100) : 0}%`
      ],
      [
        "Client share today",
        `${users.length ? Math.round((currentTotals.client / users.length) * 100) : 0}%`
      ],
      [
        "Offline share today",
        `${users.length ? Math.round((currentTotals.offline / users.length) * 100) : 0}%`
      ]
    ],
    margin: { left: 14, right: 14 }
  });

  const afterPopulationY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? 130;

  autoTable(doc, {
    startY: afterPopulationY + 8,
    theme: "striped",
    styles: {
      fontSize: 9,
      textColor: COLORS.ink,
      cellPadding: 4
    },
    headStyles: {
      fillColor: COLORS.brand,
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: COLORS.panel
    },
    head: [["Interpretation", "Value"]],
    body: [
      ["30-day average office attendance", String(averageTotals.office)],
      ["30-day average remote attendance", String(averageTotals.remote)],
      ["Most occupied day", `${peakDay} (${peakOffice})`],
      ["Least occupied day", `${lowestDay} (${lowestOffice})`],
      ["Week-over-week office change", `${weeklyChange > 0 ? "+" : ""}${weeklyChange}`]
    ],
    margin: { left: 14, right: 14 }
  });

  const afterInsightsY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? 130;

  autoTable(doc, {
    startY: afterInsightsY + 8,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: COLORS.ink
    },
    body: [
      [
        "Management interpretation",
        `Office usage is currently ${weeklyChange >= 0 ? "stable to improving" : "softening"} relative to the prior week. ${peakDay} remains the best reference point for planning peak in-office demand, while the current occupancy rate of ${occupancyRate}% suggests ${occupancyRate >= 50 ? "meaningful on-site demand" : "available office headroom"} across the observed population.`
      ]
    ],
    columnStyles: {
      0: { cellWidth: 46, fontStyle: "bold" },
      1: { cellWidth: 136 }
    },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc, doc.getNumberOfPages(), generatedAt, "Manager report");
  doc.save("presence-report.pdf");
}
