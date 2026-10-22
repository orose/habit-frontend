import { describe, expect, it } from "vitest";
import { canCheckInYesterday, dayStatus, toIsoDate, yesterdayOf } from "../src/components/HabitCalendar.helpers";

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

describe("toIsoDate", () => {
  it("uses the local date, not UTC, just after midnight", () => {
    // 00:30 local time - toISOString() would give the previous day east of UTC
    expect(toIsoDate(new Date(2026, 9, 23, 0, 30))).toBe("2026-10-23");
  });
});

describe("yesterdayOf", () => {
  it("crosses month boundaries", () => {
    expect(toIsoDate(yesterdayOf(new Date(2026, 10, 1, 12, 0)))).toBe("2026-10-31");
  });
});

describe("canCheckInYesterday", () => {
  const today = new Date(2026, 5, 10, 12, 0); // Wednesday 10 June 2026, midday
  const createdDate = new Date(2026, 0, 1);

  it("is true when yesterday is not checked in", () => {
    expect(canCheckInYesterday(new Set(["2026-06-08"]), createdDate, today)).toBe(true);
  });

  it("is false when yesterday is already checked in", () => {
    expect(canCheckInYesterday(new Set(["2026-06-09"]), createdDate, today)).toBe(false);
  });

  it("is false for a habit created today", () => {
    expect(canCheckInYesterday(new Set<string>(), new Date(2026, 5, 10), today)).toBe(false);
  });

  it("is true for a habit created yesterday", () => {
    expect(canCheckInYesterday(new Set<string>(), new Date(2026, 5, 9), today)).toBe(true);
  });

  it("treats yesterday as the previous local day just after midnight", () => {
    const justAfterMidnight = new Date(2026, 5, 10, 0, 30);
    expect(canCheckInYesterday(new Set(["2026-06-09"]), createdDate, justAfterMidnight)).toBe(false);
    expect(canCheckInYesterday(new Set(["2026-06-08"]), createdDate, justAfterMidnight)).toBe(true);
  });
});
