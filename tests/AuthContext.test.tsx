import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../src/auth/AuthContext";
import { useAuth } from "../src/auth/useAuth";

const TOKEN_STORAGE_KEY = "habit.auth.token";

function TestHarness() {
  const { token, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? "none"}</span>
      <button onClick={() => login("kari", "hunter22").catch(() => {})}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function mockLoginFetch(ok: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: async () => ({ token: "the-jwt" }),
    }),
  );
}

describe("AuthContext", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with no token", () => {
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>,
    );
    expect(screen.getByTestId("token")).toHaveTextContent("none");
  });

  it("stores the token in state and localStorage on successful login", async () => {
    mockLoginFetch(true);
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("token")).toHaveTextContent("the-jwt");
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe("the-jwt");
  });

  it("keeps the token empty when login fails", async () => {
    mockLoginFetch(false);
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("token")).toHaveTextContent("none");
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("picks up a token already in localStorage on mount", () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "existing-token");
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>,
    );
    expect(screen.getByTestId("token")).toHaveTextContent("existing-token");
  });

  it("clears the token from state and localStorage on logout", async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "existing-token");
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("token")).toHaveTextContent("none");
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
