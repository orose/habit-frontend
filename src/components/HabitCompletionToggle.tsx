import { IconButton } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { neutral } from "../theme/tokens";

interface Props {
  completed: boolean;
  onToggle: () => void;
  habitName: string;
}

/**
 * Marks a habit done for today: an outlined circle that fills brand-green
 * with a check once toggled, instead of a plain checkbox.
 */
export function HabitCompletionToggle({ completed, onToggle, habitName }: Props) {
  const label = completed
    ? `Merk "${habitName}" som ikke gjort i dag`
    : `Merk "${habitName}" som gjort i dag`;

  return (
    <IconButton
      data-testid="habit-toggle"
      aria-label={label}
      aria-pressed={completed}
      onClick={onToggle}
      disableRipple
      sx={(t) => ({
        width: 36,
        height: 36,
        padding: 0,
        flexShrink: 0,
        border: completed ? "none" : `2px solid ${neutral[300]}`,
        backgroundColor: completed ? t.palette.primary.main : "transparent",
        color: completed ? t.palette.primary.contrastText : "transparent",
        "&:hover": {
          backgroundColor: completed ? t.palette.primary.main : "transparent",
        },
      })}
    >
      <CheckRoundedIcon sx={{ fontSize: 20 }} />
    </IconButton>
  );
}
