import { describe, expect, it } from "vitest";
import { dayStatus } from "../src/components/HabitCalendar.helpers";

describe("dayStatus", () => {
  const today = new Date(2026, 5, 10); // Wednesday 10 June 2026
  const createdDate = new Date(2026, 0, 1); // 1 January 2026

  it("is 'done' for a date in the checkin set", () => {
    const doneDates = new Set(["2026-06-08"]);
    expect(dayStatus(new Date(2026, 5, 8), doneDates, createdDate, today)).toBe("done");
  });

  it("is 'not-done' for a date not in the checkin set, within the habit's lifetime", () => {
    const doneDates = new Set<string>();
    expect(dayStatus(new Date(2026, 5, 8), doneDates, createdDate, today)).toBe("not-done");
  });

  it("is 'before-created' for a date before the habit existed, even if checked in", () => {
    const doneDates = new Set(["2025-12-31"]);
    expect(dayStatus(new Date(2025, 11, 31), doneDates, createdDate, today)).toBe("before-created");
  });

  it("is 'future' for a date after today", () => {
    const doneDates = new Set<string>();
    expect(dayStatus(new Date(2026, 5, 11), doneDates, createdDate, today)).toBe("future");
  });

  it("is 'done' for today itself when checked in", () => {
    const doneDates = new Set(["2026-06-10"]);
    expect(dayStatus(new Date(2026, 5, 10), doneDates, createdDate, today)).toBe("done");
  });
});
