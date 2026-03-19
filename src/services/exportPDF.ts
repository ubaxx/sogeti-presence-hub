import jsPDF from "jspdf";
import type { User } from "../data/mockUsers";
import { getPresenceLogs } from "./presenceLogService";

type DayStats = {
  date: string;
  office: number;
};

// =====================
// GET DAILY DATA
// =====================
function getDailyStats(): DayStats[] {
  const logs = getPresenceLogs();
  const map = new Map<string, number>();

  logs.forEach((l) => {
    if (l.status !== "office") return;

    map.set(l.date, (map.get(l.date) || 0) + 1);
  });

  return Array.from(map.entries()).map(([date, office]) => ({
    date,
    office
  }));
}

// =====================
// WEEKLY (AVG PER DAY)
// =====================
function getWeeklyStats(stats: DayStats[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};

  days.forEach((d) => {
    totals[d] = 0;
    counts[d] = 0;
  });

  stats.forEach((s) => {
    const date = new Date(s.date);
    const day = days[(date.getDay() + 6) % 7];

    totals[day] += s.office;
    counts[day]++;
  });

  const avg: Record<string, number> = {};

  days.forEach((d) => {
    avg[d] = counts[d] ? Math.round(totals[d] / counts[d]) : 0;
  });

  return avg;
}

// =====================
// ANALYTICS
// =====================
function calculateAnalytics() {
  const stats = getDailyStats();

  if (stats.length === 0) {
    return {
      peakDay: "N/A",
      peakValue: 0,
      lowestDay: "N/A",
      lowestValue: 0,
      average: 0,
      totalDays: 0,
      weekly: {}
    };
  }

  let peak = stats[0];
  let lowest = stats[0];
  let total = 0;

  stats.forEach((s) => {
    total += s.office;

    if (s.office > peak.office) peak = s;
    if (s.office < lowest.office) lowest = s;
  });

  return {
    peakDay: peak.date,
    peakValue: peak.office,
    lowestDay: lowest.date,
    lowestValue: lowest.office,
    average: Math.round(total / stats.length),
    totalDays: stats.length,
    weekly: getWeeklyStats(stats)
  };
}

// =====================
// EXPORT PDF
// =====================
export function exportPresencePDF(
  users: User[],
  chartCanvas?: HTMLCanvasElement
) {
  const doc = new jsPDF();
  const today = new Date().toLocaleString();

  // =====================
  // HEADER
  // =====================
  doc.setFontSize(18);
  doc.text("Office Presence Report (Manager View)", 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated: ${today}`, 14, 22);

  // =====================
  // CURRENT STATUS
  // =====================
  const office = users.filter((u) => u.status === "office").length;
  const remote = users.filter((u) => u.status === "remote").length;
  const client = users.filter((u) => u.status === "client").length;
  const offline = users.filter((u) => u.status === "offline").length;

  doc.setFontSize(13);
  doc.text("Current Status", 14, 35);

  doc.setFontSize(11);
  doc.text(`Office: ${office}`, 14, 45);
  doc.text(`Remote: ${remote}`, 14, 52);
  doc.text(`Client: ${client}`, 14, 59);
  doc.text(`Offline: ${offline}`, 14, 66);

  // Divider
  doc.line(14, 72, 200, 72);

  // =====================
  // ANALYTICS
  // =====================
  const analytics = calculateAnalytics();

  let y = 85;

  doc.setFontSize(13);
  doc.text("Last 30 Days Summary", 14, y);

  doc.setFontSize(11);

  y += 10;
  doc.text(`Average office attendance: ${analytics.average}`, 14, y);

  y += 7;
  doc.text(
    `Peak day: ${analytics.peakDay} (${analytics.peakValue})`,
    14,
    y
  );

  y += 7;
  doc.text(
    `Lowest day: ${analytics.lowestDay} (${analytics.lowestValue})`,
    14,
    y
  );

  // =====================
  // CHART (REAL IMAGE)
  // =====================
  if (chartCanvas) {
    const img = chartCanvas.toDataURL("image/png");

    doc.addImage(img, "PNG", 110, 80, 80, 60);
  }

  // =====================
  // WEEKLY PATTERN
  // =====================
  y += 20;

  doc.setFontSize(13);
  doc.text("Weekly Pattern (avg per day)", 14, y);

  doc.setFontSize(11);

  y += 10;

  Object.entries(analytics.weekly).forEach(([day, value]) => {
    doc.text(`${day}: ${value}`, 14, y);
    y += 6;
  });

  // =====================
  // SAVE
  // =====================
  doc.save("presence-report.pdf");
}