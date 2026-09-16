import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HabitDetailPage } from "../src/HabitDetailPage";
import { AuthProvider } from "../src/auth/AuthContext";

const TOKEN_STORAGE_KEY = "habit.auth.token";

function renderDetailPage(habitId: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, "the-jwt");
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/habits/${habitId}`]}>
        <Routes>
          <Route path="/habits/:id" element={<HabitDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

function mockBackend({
  habits,
  stats,
  checkins,
}: {
  habits: unknown[];
  stats: unknown[];
  checkins: unknown[];
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "/v1/habits") {
        return { ok: true, json: async () => habits };
      }
      if (url === "/v1/stats") {
        return { ok: true, json: async () => stats };
      }
      if (url.endsWith("/checkins")) {
        return { ok: true, json: async () => checkins };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }),
  );
}

describe("HabitDetailPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the habit's name and current streak", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        { habitId: 1, name: "Drikke vann", currentStreak: 3, longestStreak: 5, totalCheckins: 10, completedToday: false },
      ],
      checkins: [{ id: 1, habitId: 1, date: "2026-06-08" }],
    });

    renderDetailPage("1");

    expect(await screen.findByRole("heading", { name: "Drikke vann" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the contribution graph once the checkins have loaded", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        { habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    expect((await screen.findAllByTestId("contribution-day")).length).toBeGreaterThan(0);
  });

  it("shows a not-found message for an unknown habit id", async () => {
    mockBackend({ habits: [], stats: [], checkins: [] });

    renderDetailPage("999");

    expect(await screen.findByText("Fant ikke vanen")).toBeInTheDocument();
  });
});
