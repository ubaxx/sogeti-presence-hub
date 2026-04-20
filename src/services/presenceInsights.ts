import type { User } from "../data/mockUsers";
import {
  getPresenceHistoryLast30Days,
  type PresenceHistoryEntry
} from "./presenceHistory";

export type PresenceInsights = {
  officeNow: number;
  occupancyRate: number;
  averageOfficeLast7: number;
  averageOfficeLast30: number;
  averageRemoteLast7: number;
  peakDayLabel: string;
  peakOffice: number;
  weeklyChange: number;
  reportWindowLabel: string;
  lastUpdatedLabel: string;
};

export type PresenceInsightWindow = 7 | 30;

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatDayLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("sv-SE", {
    month: "short",
    day: "2-digit"
  });
}

function getPeak(entries: PresenceHistoryEntry[]) {
  if (entries.length === 0) {
    return {
      peakDayLabel: "No data",
      peakOffice: 0
    };
  }

  const peak = entries.reduce((best, current) =>
    current.office > best.office ? current : best
  );

  return {
    peakDayLabel: formatDayLabel(peak.timestamp),
    peakOffice: peak.office
  };
}

export function getPresenceInsights(
  users: User[],
  window: PresenceInsightWindow = 30
): PresenceInsights {
  const history = getPresenceHistoryLast30Days();
  const filteredHistory = history.slice(-window);
  const last7 = history.slice(-7);
  const previous7 = history.slice(-14, -7);

  const officeNow = users.filter((user) => user.status === "office").length;
  const occupancyRate = users.length
    ? Math.round((officeNow / users.length) * 100)
    : 0;

  const averageOfficeLast7 = average(last7.map((entry) => entry.office));
  const averageOfficeLast30 = average(filteredHistory.map((entry) => entry.office));
  const averageRemoteLast7 = average(
    filteredHistory.map((entry) => entry.remote)
  );

  const currentWeekAverage = average(last7.map((entry) => entry.office));
  const previousWeekAverage = average(previous7.map((entry) => entry.office));
  const weeklyChange = currentWeekAverage - previousWeekAverage;

  const { peakDayLabel, peakOffice } = getPeak(filteredHistory);
  const latestEntry = filteredHistory[filteredHistory.length - 1] ?? history[history.length - 1];

  return {
    officeNow,
    occupancyRate,
    averageOfficeLast7,
    averageOfficeLast30,
    averageRemoteLast7,
    peakDayLabel,
    peakOffice,
    weeklyChange,
    reportWindowLabel:
      filteredHistory.length > 0 ? `Last ${window} days` : "No history yet",
    lastUpdatedLabel: latestEntry
      ? new Date(latestEntry.timestamp).toLocaleString()
      : "No history yet"
  };
}
