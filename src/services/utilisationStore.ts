import type { User } from "../types/User";

export type UtilisationEntry = {
  dateKey: string;
  label: string;
  office: number;
  remote: number;
  client: number;
  offline: number;
};

const UTILISATION_KEY = "presence_utilisation_30d";

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}

function parseStore(): Record<string, UtilisationEntry> {
  const raw = localStorage.getItem(UTILISATION_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, UtilisationEntry>;
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, UtilisationEntry>): void {
  localStorage.setItem(UTILISATION_KEY, JSON.stringify(store));
}

export function recordUtilisation(users: User[]): void {
  const today = new Date();
  const dateKey = getDateKey(today);

  const office = users.filter((u) => u.status === "office").length;
  const remote = users.filter((u) => u.status === "remote").length;
  const client = users.filter((u) => u.status === "client").length;
  const offline = users.filter((u) => u.status === "offline").length;

  const store = parseStore();

  store[dateKey] = {
    dateKey,
    label: getLabel(today),
    office,
    remote,
    client,
    offline
  };

  const entries = Object.entries(store)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30);

  saveStore(Object.fromEntries(entries));
}

export function getUtilisationLast30Days(): UtilisationEntry[] {
  const store = parseStore();
  const result: UtilisationEntry[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateKey = getDateKey(date);

    result.push(
      store[dateKey] ?? {
        dateKey,
        label: getLabel(date),
        office: 0,
        remote: 0,
        client: 0,
        offline: 0
      }
    );
  }

  return result;
}