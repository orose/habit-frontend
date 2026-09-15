import { useState, type FormEvent } from "react";
import { Button, TextField } from "@mui/material";
import { useAuth } from "./auth/useAuth";
import { FormLayout } from "./components";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await login(username, password);
    } catch {
      setErrorMessage("Feil brukernavn eller passord.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormLayout onSubmit={handleSubmit} error={errorMessage}>
      <TextField
        label="Brukernavn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        autoComplete="username"
      />
      <TextField
        label="Passord"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        autoComplete="current-password"
      />
      <Button type="submit" variant="contained" size="large" disabled={submitting}>
        Logg inn
      </Button>
    </FormLayout>
  );
}
