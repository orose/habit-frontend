import { Stack, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import type { HabitStats } from "../api/stats";
import { formatDayCount, formatStreakPeriod } from "./LongestStreak.helpers";

interface Props {
  stats: HabitStats;
}

/**
 * A habit's record streak and when it happened, e.g. "Rekord: 3 dager · 1.–3. okt. 2026 · pågår".
 * Renders nothing until the habit has at least one check-in.
 */
export function LongestStreak({ stats }: Props) {
  const { longestStreak, longestStreakStart, longestStreakEnd, currentStreak } = stats;
  if (longestStreak === 0 || !longestStreakStart || !longestStreakEnd) {
    return null;
  }
  // The backend lets the most recent streak win a tie, so a current streak as
  // long as the record *is* the record.
  const ongoing = currentStreak > 0 && currentStreak === longestStreak;
  const parts = [
    `Rekord: ${formatDayCount(longestStreak)}`,
    formatStreakPeriod(longestStreakStart, longestStreakEnd),
    ...(ongoing ? ["pågår"] : []),
  ];

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} data-testid="longest-streak">
      <EmojiEventsRoundedIcon fontSize="small" color="primary" />
      <Typography variant="body2">{parts.join(" · ")}</Typography>
    </Stack>
  );
}
