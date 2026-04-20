import type { User } from "../data/mockUsers";
import { getAuthHeaders } from "../features/auth/authHeaders";
const API_BASE_URL =
  import.meta.env.VITE_PRESENCE_API_URL ?? "http://localhost:5000";

export async function savePresenceSnapshot(users: User[]): Promise<void> {
  const payload = {
    office: users.filter((user) => user.status === "office").length,
    remote: users.filter((user) => user.status === "remote").length,
    client: users.filter((user) => user.status === "client").length,
    offline: users.filter((user) => user.status === "offline").length,
    totalUsers: users.length,
    capturedAt: new Date().toISOString()
  };

  const response = await fetch(`${API_BASE_URL}/presence/snapshots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to save presence snapshot (${response.status})`);
  }
}
