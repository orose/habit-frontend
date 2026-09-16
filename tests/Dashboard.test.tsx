import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Dashboard from "../src/Dashboard";
import { AuthProvider } from "../src/auth/AuthContext";

const TOKEN_STORAGE_KEY = "habit.auth.token";

function renderDashboard() {
  localStorage.setItem(TOKEN_STORAGE_KEY, "the-jwt");
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AuthProvider>,
  );
}

function renderDashboardWithDetailRoute() {
  localStorage.setItem(TOKEN_STORAGE_KEY, "the-jwt");
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits/:id" element={<div>Vanedetaljer</div>} />
        </Routes>
      </MemoryRouter>
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
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
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

  it("checks a habit in for today when its toggle is clicked", async () => {
    mockBackend(
      [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      [{ habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false }],
    );
    const user = userEvent.setup();
    renderDashboard();

    const toggle = await screen.findByTestId("habit-toggle");
    await user.click(toggle);

    expect(fetch).toHaveBeenCalledWith("/v1/habits/1/checkins", expect.objectContaining({ method: "POST" }));
  });

  it("navigates to the habit's detail page when its row is clicked", async () => {
    mockBackend(
      [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      [{ habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false }],
    );
    const user = userEvent.setup();
    renderDashboardWithDetailRoute();

    await user.click(await screen.findByText("Drikke vann"));

    expect(await screen.findByText("Vanedetaljer")).toBeInTheDocument();
  });

  it("does not navigate away when the toggle is clicked", async () => {
    mockBackend(
      [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      [{ habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false }],
    );
    const user = userEvent.setup();
    renderDashboardWithDetailRoute();

    const toggle = await screen.findByTestId("habit-toggle");
    await user.click(toggle);

    expect(screen.queryByText("Vanedetaljer")).not.toBeInTheDocument();
  });

  it("does not show edit or delete buttons on the list", async () => {
    mockBackend(
      [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      [{ habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false }],
    );
    renderDashboard();

    await screen.findByText("Drikke vann");
    expect(screen.queryByRole("button", { name: "Rediger" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Slett" })).not.toBeInTheDocument();
  });

  it("refetches habits and stats when the app becomes visible again", async () => {
    let statsCallCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url === "/v1/habits") {
          return {
            ok: true,
            json: async () => [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
          };
        }
        if (url === "/v1/stats") {
          statsCallCount += 1;
          const completedToday = statsCallCount === 1;
          return {
            ok: true,
            json: async () => [
              { habitId: 1, name: "Drikke vann", currentStreak: 3, longestStreak: 5, totalCheckins: 10, completedToday },
            ],
          };
        }
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );
    renderDashboard();

    const toggle = await screen.findByTestId("habit-toggle");
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));

    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "false"));
  });
});
