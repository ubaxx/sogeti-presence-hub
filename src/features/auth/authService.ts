import type { User } from "../../data/mockUsers";

const API_BASE_URL =
  import.meta.env.VITE_PRESENCE_API_URL ?? "http://localhost:5000";
const CURRENT_USER_STORAGE_KEY = "auth_current_user";
const TOKEN_STORAGE_KEY = "auth_access_token";
const USERS_STORAGE_KEY = "presence_users_store";

export function getCurrentUser(): User {
  const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!raw) {
    throw new Error("No authenticated user is available.");
  }

  return JSON.parse(raw) as User;
}

export function getCurrentRole(): User["role"] {
  return getCurrentUser().role;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() && localStorage.getItem(CURRENT_USER_STORAGE_KEY));
}

type AuthResponse = {
  accessToken: string;
  userId: string;
  userName: string;
  userRole: User["role"];
  email: string;
  initials: string;
  status: User["status"];
};

function storeAuthenticatedUser(session: AuthResponse): void {
  const user: User = {
    id: session.userId,
    name: session.userName,
    initials: session.initials,
    status: session.status,
    role: session.userRole
  };

  localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));

  const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
  const existingUsers = rawUsers ? (JSON.parse(rawUsers) as User[]) : [];
  const nextUsers = existingUsers.some((existingUser) => existingUser.id === user.id)
    ? existingUsers.map((existingUser) =>
        existingUser.id === user.id ? { ...existingUser, ...user } : existingUser
      )
    : [user, ...existingUsers];

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Invalid email or password."
      };
    }

    storeAuthenticatedUser((await response.json()) as AuthResponse);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Unable to sign in."
    };
  }
}

export async function registerWithCredentials(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      return {
        success: false,
        error: errorPayload?.error ?? "Unable to create account."
      };
    }

    storeAuthenticatedUser((await response.json()) as AuthResponse);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Unable to create account."
    };
  }
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
