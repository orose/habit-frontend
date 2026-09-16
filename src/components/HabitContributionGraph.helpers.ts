export type DayStatus = "done" | "not-done" | "before-created" | "future";

export interface ContributionDay {
  /** ISO date, `yyyy-MM-dd`. */
  date: string;
  status: DayStatus;
}

export interface ContributionWeek {
  /** Monday through Sunday. */
  days: ContributionDay[];
}

export const WEEKS_TO_SHOW = 52;

const MONTH_LABELS_SHORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const MONTH_LABELS_FULL = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

/**
 * Parses a `yyyy-MM-dd[...]` string as a local-time date, avoiding the
 * UTC-midnight interpretation `new Date("yyyy-MM-dd")` would otherwise apply
 * (which shifts the date by a day in timezones behind UTC).
 */
function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Monday-based day-of-week index: Monday=0 ... Sunday=6. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Builds `weeksToShow` full Monday-Sunday weeks ending on the Sunday of
 * today's week. Each day is classified relative to `today` and the habit's
 * `createdAt`, so the grid can render checked-off, empty, not-yet-existing
 * and future days differently.
 */
export function buildContributionWeeks(
  checkinDates: readonly string[],
  createdAt: string,
  today: Date = new Date(),
  weeksToShow: number = WEEKS_TO_SHOW,
): ContributionWeek[] {
  const doneDates = new Set(checkinDates.map((date) => date.slice(0, 10)));
  const createdDate = parseIsoDate(createdAt);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + (6 - mondayIndex(weekEnd)));

  const cursor = new Date(weekEnd);
  cursor.setDate(cursor.getDate() - weeksToShow * 7 + 1);

  const weeks: ContributionWeek[] = [];
  for (let week = 0; week < weeksToShow; week++) {
    const days: ContributionDay[] = [];
    for (let day = 0; day < 7; day++) {
      const iso = toIsoDate(cursor);
      let status: DayStatus;
      if (cursor > todayStart) {
        status = "future";
      } else if (cursor < createdDate) {
        status = "before-created";
      } else {
        status = doneDates.has(iso) ? "done" : "not-done";
      }
      days.push({ date: iso, status });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push({ days });
  }
  return weeks;
}

/** The short month name above the first week each new month starts in, `null` for every other week. */
export function monthLabelsForWeeks(weeks: readonly ContributionWeek[]): (string | null)[] {
  let previousMonth = -1;
  return weeks.map((week) => {
    const month = Number(week.days[0].date.slice(5, 7)) - 1;
    if (month === previousMonth) {
      return null;
    }
    previousMonth = month;
    return MONTH_LABELS_SHORT[month];
  });
}

/** Formats an ISO date as a Norwegian "8. juni" label. */
export function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${day}. ${MONTH_LABELS_FULL[month - 1]}`;
}
