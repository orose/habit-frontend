import { API_BASE_URL } from "./config";

export interface HabitStats {
  habitId: number;
  name: string;
  currentStreak: number;
  longestStreak: number;
  /** ISO date (`yyyy-MM-dd`) the longest streak began; null without check-ins. Ties go to the most recent streak. */
  longestStreakStart: string | null;
  /** ISO date of the longest streak's last checked-off day; null without check-ins. */
  longestStreakEnd: string | null;
  totalCheckins: number;
  completedToday: boolean;
}

/** Streak/completion stats for every one of the caller's habits - the dashboard overview. */
export async function fetchAllStats(token: string): Promise<HabitStats[]> {
  const response = await fetch(`${API_BASE_URL}/v1/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Kunne ikke hente statistikk (${response.status})`);
  }
  return (await response.json()) as HabitStats[];
}
