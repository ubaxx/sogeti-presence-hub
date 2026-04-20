import { useSyncExternalStore } from "react";
import type { User, UserStatus } from "../../data/mockUsers";

import { addActivity } from "../../services/activityStore";
import { getCurrentUser } from "../auth/authService";
import {
  loadPresenceUsersFromBackend,
  savePresenceUpdateToBackend
} from "../../services/backendPresenceService";
import { savePresenceSnapshot } from "../../services/presenceBackend";

import {
  ensurePresenceHistory,
  recordPresenceHistory
} from "../../services/presenceHistory";

const STORAGE_KEY = "presence_users_store";

let usersStore: User[] = loadUsers();
const listeners = new Set<() => void>();
let backendHydrationStarted = false;

function loadUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const currentUser = getCurrentUser();
    const initialUsers = [currentUser];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
    ensurePresenceHistory(initialUsers);
    void savePresenceSnapshot(initialUsers);
    return initialUsers;
  }

  try {
    const parsed = JSON.parse(raw) as User[];
    ensurePresenceHistory(parsed);
    return parsed;
  } catch {
    const currentUser = getCurrentUser();
    const initialUsers = [currentUser];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
    ensurePresenceHistory(initialUsers);
    void savePresenceSnapshot(initialUsers);
    return initialUsers;
  }
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usersStore));
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return usersStore;
}

function persistUsers(nextUsers: User[]) {
  usersStore = nextUsers;
  saveUsers();
  recordPresenceHistory(usersStore);
  void savePresenceSnapshot(usersStore);
  emit();
}

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

export function usePresence() {
  ensureBackendHydration();
  const users = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  function updateStatus(
    status: UserStatus,
    userId?: string,
    activityText?: string
  ) {
    const currentUser = getCurrentUser();
    const targetId = userId ?? currentUser.id;

    const targetBefore = usersStore.find((user) => user.id === targetId);
    if (!targetBefore || targetBefore.status === status) {
      return;
    }

    const nextUsers = usersStore.map((user) =>
      user.id === targetId ? { ...user, status } : user
    );

    persistUsers(nextUsers);

    const updated = usersStore.find((user) => user.id === targetId);

    if (updated) {
      const text =
        activityText ??
        (targetId === currentUser.id
          ? `You switched to ${formatStatusLabel(status)}`
          : `${updated.name} switched to ${formatStatusLabel(status)}`);

      addActivity(text);
      void syncPresenceChange(updated);
    }
  }

  function toggleRole(userId: string) {
    usersStore = usersStore.map((user) =>
      user.id === userId
        ? { ...user, role: user.role === "admin" ? "user" : "admin" }
        : user
    );

    saveUsers();
    emit();

    const updatedUser = usersStore.find((user) => user.id === userId);
    if (updatedUser) {
      void syncPresenceChange(updatedUser);
    }
  }

  return {
    users,
    updateStatus,
    toggleRole
  };
}

async function syncPresenceChange(user: User): Promise<void> {
  try {
    await savePresenceUpdateToBackend(user);
  } catch (error) {
    console.error("Failed to sync presence change", error);
  }
}

function ensureBackendHydration() {
  if (backendHydrationStarted) {
    return;
  }

  backendHydrationStarted = true;
  void hydratePresenceFromBackend();
}

async function hydratePresenceFromBackend(): Promise<void> {
  try {
    const backendUsers = await loadPresenceUsersFromBackend();

    if (backendUsers.length === 0) {
      return;
    }

    const backendUsersById = new Map(
      backendUsers.map((user) => [user.id, user] as const)
    );

    const nextUsers = usersStore.map((existing) => {
      const backendUser = backendUsersById.get(existing.id);

      if (!backendUser) {
        return existing;
      }

      return {
        ...existing,
        name: backendUser.name,
        initials: backendUser.initials,
        status: backendUser.status,
        role: backendUser.role ?? existing.role
      };
    });

    persistUsers(nextUsers);
  } catch (error) {
    console.error("Failed to hydrate presence from backend", error);
  }
}

export function applyPresenceUpdatedUser(
  user: Omit<User, "role"> & { role?: User["role"] }
): void {
  const current = usersStore.find((existing) => existing.id === user.id);

  if (
    current &&
    current.status === user.status &&
    current.name === user.name &&
    current.initials === user.initials &&
    current.role === user.role
  ) {
    return;
  }

  const nextUsers = usersStore.some((existing) => existing.id === user.id)
    ? usersStore.map((existing) =>
        existing.id === user.id
          ? {
              ...existing,
              name: user.name,
              initials: user.initials,
              status: user.status,
              role: user.role ?? existing.role
            }
          : existing
      )
    : [
        ...usersStore,
        {
          ...user,
          role: user.role ?? "user"
        }
      ];

  persistUsers(nextUsers);
}
