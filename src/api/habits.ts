import { API_BASE_URL } from "./config";

export interface Habit {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface HabitRequest {
  name: string;
  description: string | null;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(`Forespørselen mot /v1/habits feilet (${response.status})`);
  }
}

export async function listHabits(token: string): Promise<Habit[]> {
  const response = await fetch(`${API_BASE_URL}/v1/habits`, { headers: authHeaders(token) });
  await throwIfNotOk(response);
  return (await response.json()) as Habit[];
}

export async function createHabit(token: string, request: HabitRequest): Promise<Habit> {
  const response = await fetch(`${API_BASE_URL}/v1/habits`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
  await throwIfNotOk(response);
  return (await response.json()) as Habit;
}

export async function updateHabit(token: string, id: number, request: HabitRequest): Promise<Habit> {
  const response = await fetch(`${API_BASE_URL}/v1/habits/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
  await throwIfNotOk(response);
  return (await response.json()) as Habit;
}

export async function deleteHabit(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/habits/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await throwIfNotOk(response);
}
