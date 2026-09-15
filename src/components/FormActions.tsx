import { Button, Stack } from "@mui/material";

interface Props {
  onCancel?: () => void;
  submitting?: boolean;
  /** Disable the submit button for reasons beyond `submitting`. */
  submitDisabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * The standard right-aligned dialog/form button row: a ghost "Avbryt" and a
 * primary submit button.
 */
export default function FormActions({
  onCancel,
  submitting = false,
  submitDisabled = false,
  submitLabel = "Lagre",
  cancelLabel = "Avbryt",
}: Props) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
      {onCancel && (
        <Button onClick={onCancel} disabled={submitting}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" variant="contained" disabled={submitting || submitDisabled}>
        {submitLabel}
      </Button>
    </Stack>
  );
}
