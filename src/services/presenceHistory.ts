import type { User } from "../data/mockUsers";

export interface PresenceHistoryEntry {
  timestamp: string;
  office: number;
  remote: number;
  client: number;
  offline: number;
}

export interface WeeklyHistoryRow {
  dayLabel: string;
  office: number;
}

export interface MonthlyHistoryRow {
  weekLabel: string;
  office: number;
}

const STORAGE_KEY = "presence_history_store";

function loadHistory(): PresenceHistoryEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as PresenceHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: PresenceHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getCounts(users: User[]) {
  return {
    office: users.filter((u) => u.status === "office").length,
    remote: users.filter((u) => u.status === "remote").length,
    client: users.filter((u) => u.status === "client").length,
    offline: users.filter((u) => u.status === "offline").length
  };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getMonday(date: Date): Date {
  const current = startOfDay(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function trimToLast30Days(entries: PresenceHistoryEntry[]): PresenceHistoryEntry[] {
  const cutoff = startOfDay(addDays(new Date(), -29));

  return entries.filter((entry) => new Date(entry.timestamp) >= cutoff);
}

export function getWeekNumber(date: Date): number {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;

  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  return Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function ensurePresenceHistory(users: User[]): void {
  const existing = loadHistory();

  if (existing.length > 0) {
    saveHistory(trimToLast30Days(existing));
    return;
  }

  const today = startOfDay(new Date());
  const entries: PresenceHistoryEntry[] = [];

  for (let i = 29; i >= 0; i -= 1) {
    const day = addDays(today, -i);
    const counts = getCounts(users);

    entries.push({
      timestamp: new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        9,
        0,
        0,
        0
      ).toISOString(),
      ...counts
    });
  }

  saveHistory(entries);
}

export function recordPresenceHistory(users: User[], at: Date = new Date()): void {
  const entries = loadHistory();
  const counts = getCounts(users);

  const latest = entries[entries.length - 1];

  if (latest) {
    const latestDate = new Date(latest.timestamp);
    const sameDay = sameCalendarDay(latestDate, at);
    const sameCounts =
      latest.office === counts.office &&
      latest.remote === counts.remote &&
      latest.client === counts.client &&
      latest.offline === counts.offline;

    if (sameDay && sameCounts) {
      return;
    }
  }

  const next = trimToLast30Days([
    ...entries,
    {
      timestamp: at.toISOString(),
      ...counts
    }
  ]);

  saveHistory(next);
}

export function getWeeklyOfficeHistory(now: Date = new Date()): WeeklyHistoryRow[] {
  const entries = loadHistory();
  const monday = getMonday(now);
  const today = startOfDay(now);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return labels.map((label, index) => {
    const day = addDays(monday, index);

    if (day > today) {
      return {
        dayLabel: label,
        office: 0
      };
    }

    const sameDayEntries = entries.filter((entry) =>
      sameCalendarDay(new Date(entry.timestamp), day)
    );

    const latest = sameDayEntries[sameDayEntries.length - 1];

    return {
      dayLabel: label,
      office: latest ? latest.office : 0
    };
  });
}

export function getMonthlyOfficeHistory(now: Date = new Date()): MonthlyHistoryRow[] {
  const entries = loadHistory();
  const currentMonday = getMonday(now);

  return [3, 2, 1, 0].map((weeksBack) => {
    const weekStart = addDays(currentMonday, -7 * weeksBack);
    const weekEnd = addDays(weekStart, 7);

    const weekEntries = entries.filter((entry) => {
      const date = new Date(entry.timestamp);
      return date >= weekStart && date < weekEnd;
    });

    const latest = weekEntries[weekEntries.length - 1];

    return {
      weekLabel: `Week ${getWeekNumber(weekStart)}`,
      office: latest ? latest.office : 0
    };
  });
}

export function getPresenceHistoryLast30Days(): PresenceHistoryEntry[] {
  return trimToLast30Days(loadHistory());
}