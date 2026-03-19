export type User = {
  id: string;
  name: string;
  avatar: string;
  status: "office" | "remote" | "client" | "offline";
  group: "Team Alpha" | "Consulting" | "Management";
  lastUpdated: number;
  date: string; // 🔥 för historik
};