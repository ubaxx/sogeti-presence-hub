import { getAuthHeaders } from "../auth/authHeaders";

const API_BASE_URL =
  import.meta.env.VITE_PRESENCE_API_URL ?? "http://localhost:5000";

type AdminActionPayload = {
  actionType: string;
  title: string;
  detail: string;
  actorUserId?: string;
  actorName?: string;
  occurredAt?: string;
};

type EmergencyAlertPayload = {
  recipientCount: number;
  message: string;
  triggeredByUserId?: string;
  triggeredByName?: string;
  triggeredAt?: string;
};

export async function recordAdminAction(
  payload: AdminActionPayload
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin-actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      ...payload,
      occurredAt: payload.occurredAt ?? new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to record admin action (${response.status})`);
  }
}

export async function recordEmergencyAlert(
  payload: EmergencyAlertPayload
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/emergency-alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      ...payload,
      triggeredAt: payload.triggeredAt ?? new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to record emergency alert (${response.status})`);
  }
}
