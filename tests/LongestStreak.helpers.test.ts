import { describe, expect, it } from "vitest";
import { formatDayCount, formatStreakPeriod } from "../src/components/LongestStreak.helpers";

describe("formatDayCount", () => {
  it("uses the singular for one day", () => {
    expect(formatDayCount(1)).toBe("1 dag");
  });

  it("uses the plural for several days", () => {
    expect(formatDayCount(12)).toBe("12 dager");
  });
});

describe("formatStreakPeriod", () => {
  it("shows a single date for a one-day streak", () => {
    expect(formatStreakPeriod("2026-10-03", "2026-10-03")).toBe("3. okt. 2026");
  });

  it("shares month and year within one month", () => {
    expect(formatStreakPeriod("2026-10-01", "2026-10-03")).toBe("1.–3. okt. 2026");
  });

  it("shares the year across a month boundary", () => {
    expect(formatStreakPeriod("2026-09-28", "2026-10-03")).toBe("28. sep.–3. okt. 2026");
  });

  it("spells out both years across a year boundary", () => {
    expect(formatStreakPeriod("2025-12-30", "2026-01-02")).toBe("30. des. 2025–2. jan. 2026");
  });

  it("uses the unabbreviated short month names nb gives for short months", () => {
    expect(formatStreakPeriod("2026-03-03", "2026-03-14")).toBe("3.–14. mars 2026");
  });
});
