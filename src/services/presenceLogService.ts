import type { UserStatus } from "../types/User";

export type PresenceLog = {
  userId: string;
  name: string;
  status: UserStatus;
  timestamp: number;
  date: string;
};

const STORAGE_KEY = "presence_logs";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function addPresenceLog(log: PresenceLog): void {

  const existing = getPresenceLogs();

  const updated = [log, ...existing].slice(0, 1000);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

}

export function getPresenceLogs(): PresenceLog[] {

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data) as PresenceLog[];
  } catch {
    return [];
  }

}

export function logStatusChange(
  userId: string,
  name: string,
  status: UserStatus
) {

  addPresenceLog({
    userId,
    name,
    status,
    timestamp: Date.now(),
    date: getToday()
  });

}