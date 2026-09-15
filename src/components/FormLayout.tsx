import type { FormEvent, ReactNode } from "react";
import { Alert, Stack } from "@mui/material";

interface Props {
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
  /** Shown as an error banner above the fields. */
  error?: string | null;
}

/**
 * A vertical form column with consistent field spacing and a slot for an
 * error banner. Pair with `<FormActions>` for the button row.
 */
export default function FormLayout({ onSubmit, children, error }: Props) {
  return (
    <Stack component="form" spacing={2} onSubmit={onSubmit} sx={{ width: "100%" }}>
      {error && <Alert severity="error">{error}</Alert>}
      {children}
    </Stack>
  );
}
