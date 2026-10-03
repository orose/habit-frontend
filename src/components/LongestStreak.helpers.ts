import "dayjs/locale/nb";
import dayjs from "dayjs";

export function formatDayCount(days: number): string {
  return days === 1 ? "1 dag" : `${days} dager`;
}

/**
 * Formats a streak's ISO start/end dates as a Norwegian period, leaving out
 * the parts the two ends share: "3. okt. 2026", "1.–3. okt. 2026",
 * "28. sep.–3. okt. 2026", "30. des. 2025–2. jan. 2026".
 */
export function formatStreakPeriod(startIso: string, endIso: string): string {
  const start = dayjs(startIso).locale("nb");
  const end = dayjs(endIso).locale("nb");
  const endText = end.format("D. MMM YYYY");
  if (start.isSame(end, "day")) {
    return endText;
  }
  if (start.isSame(end, "month")) {
    return `${start.format("D.")}–${endText}`;
  }
  if (start.isSame(end, "year")) {
    return `${start.format("D. MMM")}–${endText}`;
  }
  return `${start.format("D. MMM YYYY")}–${endText}`;
}
