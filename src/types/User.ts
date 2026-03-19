export type UserStatus =
  | "office"
  | "remote"
  | "client"
  | "offline";

export interface User {
  id: string;
  name: string;
  status: UserStatus;
  initials: string;

  // 🔥 NY
  role?: "admin" | "user";
}