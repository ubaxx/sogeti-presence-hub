export type ActivityType = "checkin";

export type UserStatus = "office" | "remote" | "client" | "offline";

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  status: UserStatus;
  type: ActivityType;
  timestamp: number;
}