import { mockUsers } from "../data/mockUsers";
import type { User } from "../data/mockUsers";

type Role = "admin" | "user";

const STORAGE_KEY = "auth_current_user_id";

function getFallbackUser(): User {
  return mockUsers[0];
}

export function getCurrentUser(): User {
  const storedId = localStorage.getItem(STORAGE_KEY);
  const found = mockUsers.find((user) => user.id === storedId);

  return found ?? getFallbackUser();
}

export function getCurrentRole(): Role {
  return getCurrentUser().role;
}

export function login(userId: string): void {
  const exists = mockUsers.some((user) => user.id === userId);

  if (!exists) {
    localStorage.setItem(STORAGE_KEY, getFallbackUser().id);
    return;
  }

  localStorage.setItem(STORAGE_KEY, userId);
}

export function loginAs(userId: string): void {
  login(userId);
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}