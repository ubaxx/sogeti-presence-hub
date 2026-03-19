import type { User } from "../types/types";

export function exportToCSV(users: User[]) {
  const headers = ["Name", "Group", "Status", "Last Updated"];

  const rows = users.map((u) => [
    u.name,
    u.group,
    u.status,
    new Date(u.lastUpdated).toLocaleString(),
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

  downloadFile(csvContent, "presence-report.csv");
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
}