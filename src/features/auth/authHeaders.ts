import { getAccessToken } from "./authService";

export function getAuthHeaders(): Record<string, string> {
  const accessToken = getAccessToken();

  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`
      }
    : {};
}
