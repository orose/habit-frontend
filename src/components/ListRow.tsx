import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface Props {
  /** Leading visual, e.g. a checkbox or icon button. */
  avatar?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  /** Trailing controls (icon buttons, small buttons), right-aligned. */
  actions?: ReactNode;
  /** When given, the whole row becomes clickable (e.g. to open a details page). */
  onClick?: () => void;
}

/**
 * A single flat list row: optional leading visual, a bold primary line, a
 * muted secondary line, and a trailing actions slot - separated from the
 * next row by a subtle divider. Shared by the habits list and its stats.
 */
export default function ListRow({ avatar, primary, secondary, actions, onClick }: Props) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              // Ignore key events bubbling up from a nested interactive
              // element (checkbox, icon button) - only the row itself
              // should navigate on Enter/Space.
              if (event.target !== event.currentTarget) {
                return;
              }
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        alignItems: "center",
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        "&:last-of-type": { borderBottom: 0 },
        ...(onClick && {
          cursor: "pointer",
          "&:hover": { backgroundColor: "action.hover" },
        }),
      }}
    >
      {avatar}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700 }} noWrap>
          {primary}
        </Typography>
        {secondary != null && secondary !== "" && (
          <Typography variant="body2" color="text.secondary">
            {secondary}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
