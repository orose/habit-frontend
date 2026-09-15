import { API_BASE_URL } from "./config";
import type { UserProfile } from "./users";

/** Fetches the authenticated user's own profile - proves the token works. */
export async function fetchMe(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente brukerprofil (${response.status})`);
  }

  return (await response.json()) as UserProfile;
}
