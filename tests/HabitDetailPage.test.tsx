import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HabitDetailPage } from "../src/HabitDetailPage";
import { AuthProvider } from "../src/auth/AuthContext";
import { toIsoDate, yesterdayOf } from "../src/components/HabitCalendar.helpers";

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

const YESTERDAY = toIsoDate(yesterdayOf(new Date()));

/** A backend whose POST /checkins responds with `postStatus`, recording the check-ins it accepts. */
function mockBackendWithCheckIn({ checkins, postStatus = 201 }: { checkins: string[]; postStatus?: number }) {
  const posted: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";
      if (url === "/v1/habits") {
        return {
          ok: true,
          json: async () => [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
        };
      }
      if (url === "/v1/stats") {
        return {
          ok: true,
          json: async () => [
            { habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
          ],
        };
      }
      if (url === "/v1/habits/1/checkins" && method === "POST") {
        const body = JSON.parse(init?.body as string) as { date: string };
        posted.push(body);
        if (postStatus === 201 || postStatus === 409) {
          checkins.push(body.date);
        }
        return { ok: postStatus < 400, status: postStatus, json: async () => ({ id: 99, habitId: 1, date: body.date }) };
      }
      if (url === "/v1/habits/1/checkins") {
        return { ok: true, json: async () => checkins.map((date, i) => ({ id: i + 1, habitId: 1, date })) };
      }
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    }),
  );
  return { posted };
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
    expect(within(screen.getByTestId("streak-badge")).getByText("3")).toBeInTheDocument();
  });

  it("renders the calendar once the checkins have loaded", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        { habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    expect((await screen.findAllByRole("gridcell")).length).toBeGreaterThan(0);
  });

  it("shows the record streak and its period", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        {
          habitId: 1,
          name: "Drikke vann",
          currentStreak: 1,
          longestStreak: 12,
          longestStreakStart: "2026-03-03",
          longestStreakEnd: "2026-03-14",
          totalCheckins: 20,
          completedToday: true,
        },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    expect(await screen.findByText("Rekord: 12 dager · 3.–14. mars 2026")).toBeInTheDocument();
  });

  it("marks the record as ongoing when the current streak is the record", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        {
          habitId: 1,
          name: "Drikke vann",
          currentStreak: 3,
          longestStreak: 3,
          longestStreakStart: "2026-10-01",
          longestStreakEnd: "2026-10-03",
          totalCheckins: 3,
          completedToday: true,
        },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    expect(await screen.findByText("Rekord: 3 dager · 1.–3. okt. 2026 · pågår")).toBeInTheDocument();
  });

  it("does not show a record line for a habit with no checkins", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        {
          habitId: 1,
          name: "Drikke vann",
          currentStreak: 0,
          longestStreak: 0,
          longestStreakStart: null,
          longestStreakEnd: null,
          totalCheckins: 0,
          completedToday: false,
        },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    await screen.findByRole("heading", { name: "Drikke vann" });
    expect(screen.queryByTestId("longest-streak")).not.toBeInTheDocument();
  });

  it("shows a not-found message for an unknown habit id", async () => {
    mockBackend({ habits: [], stats: [], checkins: [] });

    renderDetailPage("999");

    expect(await screen.findByText("Fant ikke vanen")).toBeInTheDocument();
  });

  it("shows the habit's description between the header and the calendar", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: "2 liter per dag", createdAt: "2026-01-01 00:00:00" }],
      stats: [
        { habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    expect(await screen.findByText("2 liter per dag")).toBeInTheDocument();
  });

  it("does not render a description line when the habit has none", async () => {
    mockBackend({
      habits: [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
      stats: [
        { habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
      ],
      checkins: [],
    });

    renderDetailPage("1");

    await screen.findByRole("heading", { name: "Drikke vann" });
    expect(screen.queryByText("null")).not.toBeInTheDocument();
  });

  it("edits the habit's name via the edit button", async () => {
    const user = userEvent.setup();
    let currentName = "Drikke vann";

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const method = init?.method ?? "GET";
        if (url === "/v1/habits" && method === "GET") {
          return {
            ok: true,
            json: async () => [{ id: 1, userId: 1, name: currentName, description: null, createdAt: "2026-01-01 00:00:00" }],
          };
        }
        if (url === "/v1/stats") {
          return {
            ok: true,
            json: async () => [
              { habitId: 1, name: currentName, currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
            ],
          };
        }
        if (url === "/v1/habits/1" && method === "PUT") {
          const body = JSON.parse(init?.body as string) as { name: string; description: string | null };
          currentName = body.name;
          return {
            ok: true,
            json: async () => ({ id: 1, userId: 1, name: currentName, description: body.description, createdAt: "2026-01-01 00:00:00" }),
          };
        }
        if (url.endsWith("/checkins")) {
          return { ok: true, json: async () => [] };
        }
        throw new Error(`Unexpected fetch: ${method} ${url}`);
      }),
    );

    renderDetailPage("1");

    await user.click(await screen.findByRole("button", { name: "Rediger" }));
    const dialog = await screen.findByRole("dialog");
    const nameField = within(dialog).getByLabelText(/Navn/);
    await user.clear(nameField);
    await user.type(nameField, "Drikke mer vann");
    await user.click(screen.getByRole("button", { name: "Lagre" }));

    expect(await screen.findByRole("heading", { name: "Drikke mer vann" })).toBeInTheDocument();
  });

  it("deletes the habit via the delete button and navigates back to the dashboard", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let deleted = false;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const method = init?.method ?? "GET";
        if (url === "/v1/habits" && method === "GET") {
          return {
            ok: true,
            json: async () =>
              deleted ? [] : [{ id: 1, userId: 1, name: "Drikke vann", description: null, createdAt: "2026-01-01 00:00:00" }],
          };
        }
        if (url === "/v1/stats") {
          return {
            ok: true,
            json: async () => [
              { habitId: 1, name: "Drikke vann", currentStreak: 0, longestStreak: 0, totalCheckins: 0, completedToday: false },
            ],
          };
        }
        if (url === "/v1/habits/1" && method === "DELETE") {
          deleted = true;
          return { ok: true, json: async () => undefined };
        }
        if (url.endsWith("/checkins")) {
          return { ok: true, json: async () => [] };
        }
        throw new Error(`Unexpected fetch: ${method} ${url}`);
      }),
    );

    localStorage.setItem(TOKEN_STORAGE_KEY, "the-jwt");
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/habits/1"]}>
          <Routes>
            <Route path="/" element={<div>Dashbord</div>} />
            <Route path="/habits/:id" element={<HabitDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(await screen.findByRole("button", { name: "Slett" }));

    expect(await screen.findByText("Dashbord")).toBeInTheDocument();
  });

  describe("check in for yesterday", () => {
    it("checks the habit in for yesterday and hides the button afterwards", async () => {
      const user = userEvent.setup();
      const { posted } = mockBackendWithCheckIn({ checkins: [] });

      renderDetailPage("1");

      await user.click(await screen.findByRole("button", { name: "Kryss av for i går" }));

      expect(posted).toEqual([{ date: YESTERDAY }]);
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Kryss av for i går" })).not.toBeInTheDocument(),
      );
    });

    it("does not show the button when yesterday is already checked in", async () => {
      mockBackendWithCheckIn({ checkins: [YESTERDAY] });

      renderDetailPage("1");

      await screen.findAllByRole("gridcell");
      expect(screen.queryByRole("button", { name: "Kryss av for i går" })).not.toBeInTheDocument();
    });

    it("treats an already-checked-in conflict (409) as success", async () => {
      const user = userEvent.setup();
      mockBackendWithCheckIn({ checkins: [], postStatus: 409 });

      renderDetailPage("1");

      await user.click(await screen.findByRole("button", { name: "Kryss av for i går" }));

      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Kryss av for i går" })).not.toBeInTheDocument(),
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows an error and keeps the button enabled when the check-in fails", async () => {
      const user = userEvent.setup();
      mockBackendWithCheckIn({ checkins: [], postStatus: 500 });

      renderDetailPage("1");

      const button = await screen.findByRole("button", { name: "Kryss av for i går" });
      await user.click(button);

      expect(await screen.findByText("Kunne ikke krysse av for i går. Prøv igjen.")).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });
});
