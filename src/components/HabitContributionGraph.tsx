import { Box, Stack, Tooltip, Typography, type Theme } from "@mui/material";
import {
  buildContributionWeeks,
  formatDayLabel,
  monthLabelsForWeeks,
  WEEKS_TO_SHOW,
  type DayStatus,
} from "./HabitContributionGraph.helpers";

interface Props {
  checkins: readonly string[];
  createdAt: string;
  today?: Date;
  weeksToShow?: number;
}

const CELL_SIZE = 12;
const CELL_GAP = 0.5;
const WEEKDAY_LABELS = ["Man", "", "Ons", "", "Fre", "", ""];

function cellColor(status: DayStatus, theme: Theme): string {
  switch (status) {
    case "done":
      return theme.palette.primary.main;
    case "not-done":
      return theme.palette.divider;
    case "before-created":
    case "future":
      return theme.palette.action.disabledBackground;
  }
}

function tooltipLabel(status: DayStatus, date: string): string | null {
  if (status === "before-created" || status === "future") {
    return null;
  }
  return `${status === "done" ? "Gjort" : "Ikke gjort"} ${formatDayLabel(date)}`;
}

/** A GitHub-style contribution grid showing which days a habit was checked off. */
export function HabitContributionGraph({ checkins, createdAt, today, weeksToShow = WEEKS_TO_SHOW }: Props) {
  const weeks = buildContributionWeeks(checkins, createdAt, today, weeksToShow);
  const monthLabels = monthLabelsForWeeks(weeks);

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Stack direction="row" spacing={CELL_GAP} sx={{ height: 18, mb: 0.5 }}>
        <Box sx={{ width: 28, flexShrink: 0 }} />
        <Stack direction="row" spacing={CELL_GAP}>
          {monthLabels.map((label, index) => (
            <Box key={index} sx={{ width: CELL_SIZE, position: "relative" }}>
              {label && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ position: "absolute", top: 0, left: 0, whiteSpace: "nowrap" }}
                >
                  {label}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={CELL_GAP}>
        <Stack spacing={CELL_GAP} sx={{ pt: 0.5, width: 28, flexShrink: 0 }}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{ height: CELL_SIZE, lineHeight: `${CELL_SIZE}px` }}
            >
              {label}
            </Typography>
          ))}
        </Stack>
        <Stack direction="row" spacing={CELL_GAP} sx={{ pt: 0.5 }}>
          {weeks.map((week, weekIndex) => (
            <Stack key={weekIndex} spacing={CELL_GAP}>
              {week.days.map((day) => {
                const label = tooltipLabel(day.status, day.date);
                return (
                  <Tooltip key={day.date} title={label ?? ""}>
                    <Box
                      data-testid="contribution-day"
                      sx={(theme) => ({
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: 0.5,
                        backgroundColor: cellColor(day.status, theme),
                      })}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
