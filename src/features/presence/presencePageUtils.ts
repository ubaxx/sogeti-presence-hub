import type { User, UserStatus } from "../../data/mockUsers";

export const PRESENCE_INSIGHT_WINDOWS = [7, 30] as const;
export const PRESENCE_STATUS_FILTERS: UserStatus[] = [
  "office",
  "remote",
  "client",
  "offline"
];

export function formatPresenceDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta} vs previous week`;
  }

  if (delta < 0) {
    return `${delta} vs previous week`;
  }

  return "No change vs previous week";
}

export function getPresenceDeltaClass(delta: number): string {
  if (delta > 0) {
    return "positive";
  }

  if (delta < 0) {
    return "negative";
  }

  return "neutral";
}

export function compareUsersForPresenceList(a: User, b: User): number {
  if (a.status === "office" && b.status !== "office") {
    return -1;
  }

  if (a.status !== "office" && b.status === "office") {
    return 1;
  }

  return a.name.localeCompare(b.name);
}

export function getColleagueActivityMessage(user: User): string {
  switch (user.status) {
    case "office":
      return `${user.name} confirmed they are in the office`;
    case "remote":
      return `${user.name} is working remotely today`;
    case "client":
      return `${user.name} is with a client today`;
    case "offline":
      return `${user.name} is currently offline`;
    default:
      return `${user.name} updated their presence`;
  }
}
