import { API_BASE_URL } from "./config";

export interface UserProfile {
  id: number;
  username: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

/** Registers a new user - fails with a message if registration is closed or the name is taken. */
export async function register(request: RegisterRequest): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(problem?.detail ?? `Registrering feilet (${response.status})`);
  }

  return (await response.json()) as UserProfile;
}

export async function changeOwnPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/users/me/password`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(problem?.detail ?? `Passordendring feilet (${response.status})`);
  }
}
