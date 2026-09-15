import type { ReactNode } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Props {
  title: string;
  /** When given, a round "back" button is shown to the left of the title. */
  onBack?: () => void;
  /** Optional trailing content (e.g. an action button), right-aligned. */
  action?: ReactNode;
}

/**
 * The sub-page top bar: an optional circular back button, the page title,
 * and an optional right-aligned action slot.
 */
export default function PageHeader({ title, onBack, action }: Props) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
        {onBack && (
          <IconButton
            aria-label="Tilbake"
            onClick={onBack}
            sx={(t) => ({ backgroundColor: t.palette.action.hover, color: t.palette.text.primary })}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h4" component="h1" noWrap>
          {title}
        </Typography>
      </Stack>
      {action}
    </Stack>
  );
}
