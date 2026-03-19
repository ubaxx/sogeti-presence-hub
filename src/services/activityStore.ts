export interface Activity {
  id: string;
  text: string;
  time: string;
}

const STORAGE_KEY = "activity_store";

let activities: Activity[] = load();
const listeners = new Set<() => void>();

function load(): Activity[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeActivity(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActivities(): Activity[] {
  return activities;
}

export function addActivity(text: string) {
  const newItem: Activity = {
    id: crypto.randomUUID(),
    text,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  activities = [newItem, ...activities].slice(0, 10);
  save();
  emit(); // 🔥 CRITICAL FIX
}