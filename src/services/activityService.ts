import type { Activity } from "../types/Activity";

const STORAGE_KEY = "activity_feed";

export function addActivity(activity: Activity): void {
  const existing = getActivities();
  const updated = [activity, ...existing].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getActivities(): Activity[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data) as Activity[];
  } catch {
    return [];
  }
}

export function subscribeToActivity(
  callback: (activities: Activity[]) => void
): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        callback(JSON.parse(event.newValue) as Activity[]);
      } catch {
        callback([]);
      }
    }
  };

  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("storage", handler);
  };
}