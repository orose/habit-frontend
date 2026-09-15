import { API_BASE_URL } from "./config";

/** Whether new users may currently register - publicly readable, no auth needed. */
export async function fetchAllowRegistration(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/v1/settings/allow-registration`);
  if (!response.ok) {
    return false;
  }
  const body = (await response.json()) as { allowRegistration: boolean };
  return body.allowRegistration;
}
