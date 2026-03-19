import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { User } from "../data/mockUsers";

export function exportEmergencyPDF(users: User[]) {
  const doc = new jsPDF();

  const inOffice = users.filter((u) => u.status === "office");

  doc.setFontSize(18);
  doc.text("Emergency Evacuation List", 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

  doc.setFontSize(12);
  doc.text(`People in office: ${inOffice.length}`, 14, 40);

  autoTable(doc, {
    startY: 50,
    head: [["Name"]],
    body: inOffice.map((u) => [u.name]),
  });

  doc.save("emergency-report.pdf");
}