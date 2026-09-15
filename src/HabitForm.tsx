import { useState, type FormEvent } from "react";
import { TextField } from "@mui/material";
import type { HabitRequest } from "./api/habits";
import { FormActions, FormLayout } from "./components";

interface Props {
  initial?: HabitRequest;
  onSubmit: (request: HabitRequest) => Promise<void>;
  onCancel: () => void;
}

export default function HabitForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, description: description.trim() === "" ? null : description });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kunne ikke lagre vanen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormLayout onSubmit={handleSubmit} error={errorMessage}>
      <TextField label="Navn" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
      <TextField
        label="Beskrivelse (valgfritt)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        minRows={2}
      />
      <FormActions onCancel={onCancel} submitting={submitting} submitDisabled={name.trim() === ""} />
    </FormLayout>
  );
}
