import type { User } from "../types/types";

export function getUsersWithoutResponse(users: User[]) {
  return users.filter((u) => u.status === "offline");
}

export function simulateTeamsReminder(users: User[]) {
  return users.map((u) => u.name);
}