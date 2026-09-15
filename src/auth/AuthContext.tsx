import { useState, type ReactNode } from "react";
import { login as loginRequest } from "../api/auth";
import { AuthContext } from "./context";

const TOKEN_STORAGE_KEY = "habit.auth.token";

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (e.g. private browsing) - the session still works
    // in-memory for the rest of this page load.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);

  async function login(username: string, password: string) {
    const newToken = await loginRequest({ username, password });
    setToken(newToken);
    storeToken(newToken);
  }

  function logout() {
    setToken(null);
    storeToken(null);
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}
