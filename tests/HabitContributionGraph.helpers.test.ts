import { describe, expect, it } from "vitest";
import {
  buildContributionWeeks,
  formatDayLabel,
  monthLabelsForWeeks,
} from "../src/components/HabitContributionGraph.helpers";

describe("buildContributionWeeks", () => {
  it("builds full Monday-to-Sunday weeks ending on the current week's Sunday", () => {
    const today = new Date(2026, 5, 10); // Wednesday 10 June 2026
    const weeks = buildContributionWeeks([], "2020-01-01 00:00:00", today, 3);

    expect(weeks).toHaveLength(3);
    for (const week of weeks) {
      expect(week.days).toHaveLength(7);
    }
    expect(weeks[0].days[0].date).toBe("2026-05-25"); // Monday, 3 weeks before
    const lastWeek = weeks[weeks.length - 1];
    expect(lastWeek.days[0].date).toBe("2026-06-08"); // Monday of today's week
    expect(lastWeek.days[6].date).toBe("2026-06-14"); // Sunday of today's week
  });

  it("marks a checked-in date as done", () => {
    const today = new Date(2026, 5, 10);
    const weeks = buildContributionWeeks(["2026-06-08"], "2020-01-01 00:00:00", today, 1);

    expect(weeks[0].days[0].status).toBe("done");
  });

  it("marks a date without a checkin as not-done", () => {
    const today = new Date(2026, 5, 10);
    const weeks = buildContributionWeeks([], "2020-01-01 00:00:00", today, 1);

    expect(weeks[0].days[0].status).toBe("not-done");
  });

  it("marks days after today as future", () => {
    const today = new Date(2026, 5, 10); // Wednesday
    const weeks = buildContributionWeeks([], "2020-01-01 00:00:00", today, 1);

    const sunday = weeks[0].days[6];
    expect(sunday.date).toBe("2026-06-14");
    expect(sunday.status).toBe("future");
  });

  it("marks days before the habit was created as before-created, even if checked in", () => {
    const today = new Date(2026, 5, 10);
    const weeks = buildContributionWeeks(["2026-06-08"], "2026-06-09 00:00:00", today, 1);

    expect(weeks[0].days[0].date).toBe("2026-06-08");
    expect(weeks[0].days[0].status).toBe("before-created");
  });

  it("is timezone-safe: a date-only ISO string is not shifted by a day", () => {
    const today = new Date(2026, 5, 10);
    const weeks = buildContributionWeeks(["2026-06-08"], "2020-01-01", today, 1);

    const monday = weeks[0].days[0];
    expect(monday.date).toBe("2026-06-08");
    expect(monday.status).toBe("done");
  });
});

describe("monthLabelsForWeeks", () => {
  it("labels only the first week of each month, in Norwegian", () => {
    const today = new Date(2026, 5, 10);
    const weeks = buildContributionWeeks([], "2020-01-01", today, 6);

    const labels = monthLabelsForWeeks(weeks);

    expect(labels).toHaveLength(6);
    expect(labels.filter((label) => label !== null)).toEqual(["mai", "jun"]);
  });
});

describe("formatDayLabel", () => {
  it("formats an ISO date as a Norwegian day-and-month label", () => {
    expect(formatDayLabel("2026-06-08")).toBe("8. juni");
  });
});
