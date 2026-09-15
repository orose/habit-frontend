import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * The placeholder shown when a list has nothing in it yet - a centered,
 * low-key title with an optional icon and one line of guidance.
 */
export default function EmptyState({ title, description, icon }: Props) {
  return (
    <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center", py: 5, color: "text.secondary" }}>
      {icon && <Box sx={{ color: "text.disabled", display: "flex" }}>{icon}</Box>}
      <Typography variant="h6" component="p" color="text.primary">
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
    </Stack>
  );
}
