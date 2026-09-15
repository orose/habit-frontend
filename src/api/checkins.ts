import { API_BASE_URL } from "./config";

export interface HabitCheckin {
  id: number;
  habitId: number;
  date: string;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(`Forespørselen mot /v1/habits/.../checkins feilet (${response.status})`);
  }
}

export async function listCheckins(token: string, habitId: number): Promise<HabitCheckin[]> {
  const response = await fetch(`${API_BASE_URL}/v1/habits/${habitId}/checkins`, {
    headers: authHeaders(token),
  });
  await throwIfNotOk(response);
  return (await response.json()) as HabitCheckin[];
}

/** Marks a habit done for a date (ISO `yyyy-MM-dd`), defaulting to today when omitted. */
export async function checkIn(token: string, habitId: number, date?: string): Promise<HabitCheckin> {
  const response = await fetch(`${API_BASE_URL}/v1/habits/${habitId}/checkins`, {
    method: "POST",
    headers: authHeaders(token),
    body: date ? JSON.stringify({ date }) : undefined,
  });
  await throwIfNotOk(response);
  return (await response.json()) as HabitCheckin;
}

export async function undoCheckIn(token: string, habitId: number, date: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/habits/${habitId}/checkins/${date}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await throwIfNotOk(response);
}
