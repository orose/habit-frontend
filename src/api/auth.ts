import { API_BASE_URL } from "./config";

export interface LoginCredentials {
  username: string;
  password: string;
}

/** Logs in and returns the JWT on success, throws on invalid credentials. */
export async function login({ username, password }: LoginCredentials): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Feil brukernavn eller passord.");
  }

  const body = (await response.json()) as { token: string };
  return body.token;
}
