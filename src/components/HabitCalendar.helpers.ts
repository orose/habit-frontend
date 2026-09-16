export type DayStatus = "done" | "not-done" | "before-created" | "future";

/**
 * Parses a `yyyy-MM-dd[...]` string as a local-time date, avoiding the
 * UTC-midnight interpretation `new Date("yyyy-MM-dd")` would otherwise apply
 * (which shifts the date by a day in timezones behind UTC).
 */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Classifies a calendar day relative to the habit's checkins, creation date and today. */
export function dayStatus(date: Date, doneDates: ReadonlySet<string>, createdDate: Date, today: Date): DayStatus {
  if (date > today) {
    return "future";
  }
  if (date < createdDate) {
    return "before-created";
  }
  return doneDates.has(toIsoDate(date)) ? "done" : "not-done";
}
