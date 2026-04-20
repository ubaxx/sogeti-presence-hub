import type { User } from "../../data/mockUsers";

export type AdminActionItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export function formatAdminDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta} vs previous week`;
  }

  if (delta < 0) {
    return `${delta} vs previous week`;
  }

  return "No change vs previous week";
}

export function getAdminDeltaClass(delta: number): string {
  if (delta > 0) {
    return "positive";
  }

  if (delta < 0) {
    return "negative";
  }

  return "neutral";
}

export function createAdminActionItem(
  title: string,
  detail: string
): AdminActionItem {
  return {
    id: crypto.randomUUID(),
    title,
    detail,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

export function getMonthlyInsight(monthly: Array<{ weekLabel: string; office: number }>) {
  if (monthly.length === 0) {
    return {
      peakWeekLabel: "No data",
      peakWeekValue: 0,
      lowWeekLabel: "No data",
      lowWeekValue: 0,
      delta: 0
    };
  }

  const peakWeek = monthly.reduce((best, current) =>
    current.office > best.office ? current : best
  );
  const lowWeek = monthly.reduce((best, current) =>
    current.office < best.office ? current : best
  );
  const previous = monthly[monthly.length - 2];
  const latest = monthly[monthly.length - 1];

  return {
    peakWeekLabel: peakWeek.weekLabel,
    peakWeekValue: peakWeek.office,
    lowWeekLabel: lowWeek.weekLabel,
    lowWeekValue: lowWeek.office,
    delta: previous ? latest.office - previous.office : 0
  };
}

export function buildStatusDistribution(users: User[]) {
  return [
    { name: "Office", value: users.filter((u) => u.status === "office").length, key: "office" as const, color: "#4ade80" },
    { name: "Remote", value: users.filter((u) => u.status === "remote").length, key: "remote" as const, color: "#fb923c" },
    { name: "Client", value: users.filter((u) => u.status === "client").length, key: "client" as const, color: "#60a5fa" },
    { name: "Offline", value: users.filter((u) => u.status === "offline").length, key: "offline" as const, color: "#9ca3af" }
  ];
}
