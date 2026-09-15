import { useState, type FormEvent } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { register } from "./api/users";
import { FormLayout } from "./components";

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

export default function RegisterUserForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await register({ username, password });
      setSucceeded(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registrering feilet. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (succeeded) {
    return <Alert severity="success">Bruker registrert. Du kan nå logge inn.</Alert>;
  }

  return (
    <FormLayout onSubmit={handleSubmit} error={errorMessage}>
      <TextField
        label="Brukernavn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        slotProps={{ htmlInput: { minLength: MIN_USERNAME_LENGTH } }}
      />
      <TextField
        label="Passord"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        slotProps={{ htmlInput: { minLength: MIN_PASSWORD_LENGTH } }}
        helperText={`Minst ${MIN_PASSWORD_LENGTH} tegn`}
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        Registrer bruker
      </Button>
    </FormLayout>
  );
}
