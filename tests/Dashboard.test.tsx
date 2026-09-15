import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "../src/Dashboard";
import { AuthProvider } from "../src/auth/AuthContext";

const TOKEN_STORAGE_KEY = "habit.auth.token";

function renderDashboard() {
  localStorage.setItem(TOKEN_STORAGE_KEY, "the-jwt");
  return render(
    <AuthProvider>
      <Dashboard />
    </AuthProvider>,
  );
}

function mockBackend(habits: unknown[], stats: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url === "/v1/habits" && method === "GET") {
        return { ok: true, json: async () => habits };
      }
      if (url === "/v1/stats") {
        return { ok: true, json: async () => stats };
      }
      if (url.startsWith("/v1/habits/") && url.endsWith("/checkins") && method === "POST") {
        return { ok: true, json: async () => ({ id: 1, habitId: 1, date: "2026-01-01" }) };
      }
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    }),
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows an empty state when there are no habits", async () => {
    mockBackend([], []);
    renderDashboard();

    expect(await screen.findByText("Ingen vaner ennå")).toBeInTheDocument();
  });

  it("lists habits with their current streak", async () => {
    mockBackend(
      [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      [{ habitId: 1, name: "Drikke vann", currentStreak: 3, longestStreak: 5, totalCheckins: 10, completedToday: false }],
    );
    renderDashboard();

    expect(await screen.findByText("Drikke vann")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("checks a habit in for today when its checkbox is clicked", async () => {
    mockBackend(
      [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      [{ habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false }],
    );
    const user = userEvent.setup();
    renderDashboard();

    const checkbox = await screen.findByRole("checkbox");
    await user.click(checkbox);

    expect(fetch).toHaveBeenCalledWith("/v1/habits/1/checkins", expect.objectContaining({ method: "POST" }));
  });
});
