import { useSyncExternalStore } from "react";
import { mockUsers } from "../data/mockUsers";
import type { User, UserStatus } from "../data/mockUsers";

import { addActivity } from "../services/activityStore";
import { getCurrentUser } from "../services/authService";
import { savePresenceSnapshot } from "../services/presenceBackend";

import {
  ensurePresenceHistory,
  recordPresenceHistory
} from "../services/presenceHistory";

const STORAGE_KEY = "presence_users_store";

let usersStore: User[] = loadUsers();
const listeners = new Set<() => void>();

// =====================
// LOAD
// =====================
function loadUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
    ensurePresenceHistory(mockUsers);
    void savePresenceSnapshot(mockUsers);
    return [...mockUsers];
  }

  try {
    const parsed = JSON.parse(raw) as User[];
    ensurePresenceHistory(parsed);
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
    ensurePresenceHistory(mockUsers);
    void savePresenceSnapshot(mockUsers);
    return [...mockUsers];
  }
}

// =====================
// SAVE
// =====================
function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usersStore));
}

// =====================
// STORE
// =====================
function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return usersStore;
}

// =====================
// LABEL
// =====================
function formatStatusLabel(status: UserStatus) {
  switch (status) {
    case "office":
      return "Office";
    case "remote":
      return "Remote";
    case "client":
      return "Client";
    case "offline":
      return "Offline";
    default:
      return status;
  }
}

// =====================
// HOOK
// =====================
export function usePresence() {
  const users = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // =====================
  // UPDATE STATUS
  // =====================
  function updateStatus(status: UserStatus, userId?: string) {
    const currentUser = getCurrentUser();
    const targetId = userId ?? currentUser.id;

    const targetBefore = usersStore.find((u) => u.id === targetId);
    if (!targetBefore || targetBefore.status === status) return;

    // =====================
    // UPDATE STORE
    // =====================
    usersStore = usersStore.map((u) =>
      u.id === targetId ? { ...u, status } : u
    );

    saveUsers();
    recordPresenceHistory(usersStore);

    const updated = usersStore.find((u) => u.id === targetId);

    // =====================
    // 🔥 FIX: ONLY USERS (NOT ADMINS)
    // =====================
    if (updated && currentUser.role !== "admin") {
      const text =
        targetId === currentUser.id
          ? `You switched to ${formatStatusLabel(status)}`
          : `${updated.name} switched to ${formatStatusLabel(status)}`;

      addActivity(text);
    }

    void savePresenceSnapshot(usersStore);
    emit();
  }

  // =====================
  // TOGGLE ROLE
  // =====================
  function toggleRole(userId: string) {
    usersStore = usersStore.map((u) =>
      u.id === userId
        ? { ...u, role: u.role === "admin" ? "user" : "admin" }
        : u
    );

    saveUsers();
    emit();
  }

  return {
    users,
    updateStatus,
    toggleRole
  };
}