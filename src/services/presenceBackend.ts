import type { User } from "../data/mockUsers";

const STORAGE_KEY = "presence_backend_snapshots";

export async function savePresenceSnapshot(users: User[]): Promise<void> {
  const snapshots = loadSnapshots();

  snapshots.push({
    timestamp: new Date().toISOString(),
    users
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots.slice(-50)));
}

function loadSnapshots(): Array<{ timestamp: string; users: User[] }> {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Array<{ timestamp: string; users: User[] }>;
  } catch {
    return [];
  }
}