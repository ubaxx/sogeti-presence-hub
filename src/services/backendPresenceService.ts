import type { User } from "../data/mockUsers";
import { getAuthHeaders } from "../features/auth/authHeaders";

const API_BASE_URL =
  import.meta.env.VITE_PRESENCE_API_URL ?? "http://localhost:5000";

type PresenceApiUser = {
  id: string;
  name: string;
  initials: string;
  status: User["status"];
  role?: User["role"];
  updatedAt?: string;
};

function toPayload(user: User) {
  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    status: user.status,
    role: user.role,
    updatedAt: new Date().toISOString()
  };
}

export async function savePresenceUpdateToBackend(user: User): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/presence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(toPayload(user))
  });

  if (!response.ok) {
    throw new Error(`Failed to save presence update (${response.status})`);
  }
}

export async function loadPresenceUsersFromBackend(): Promise<PresenceApiUser[]> {
  const response = await fetch(`${API_BASE_URL}/presence`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load presence users (${response.status})`);
  }

  return (await response.json()) as PresenceApiUser[];
}
