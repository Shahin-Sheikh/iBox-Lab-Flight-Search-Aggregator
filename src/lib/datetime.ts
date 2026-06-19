/**
 * Datetime helpers shared by the mock API (arrival derivation) and the UI
 * (display formatting).
 *
 * Flight times are airport-local "wall-clock" ISO strings with no timezone
 * offset (e.g. `2026-06-25T08:30:00`). To format them identically regardless
 * of the host/browser timezone, we re-anchor the components onto a UTC Date
 * and format with `timeZone: "UTC"`. This keeps tests deterministic and avoids
 * a timezone library for what is mock data.
 */

export const DEFAULT_LOCALE = "en-US";
export const MINUTES_PER_DAY = 1440;

const WALL_CLOCK_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "HH:mm" into minutes-from-midnight. */
export function timeToMinutes(time: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new Error(`Invalid time of day: ${time}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format minutes-from-midnight (0–1439) as zero-padded "HH:mm". */
export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Add (or subtract) whole days to a `yyyy-MM-dd` string, returning the same format. */
export function addDaysToDateString(date: string, days: number): string {
  const match = DATE_RE.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const shifted = new Date(utc + days * MINUTES_PER_DAY * 60_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Re-anchor a wall-clock ISO string onto a UTC Date for stable formatting. */
export function parseWallClock(iso: string): Date {
  const match = WALL_CLOCK_RE.exec(iso);
  if (!match) throw new Error(`Invalid datetime: ${iso}`);
  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
    ),
  );
}

/** "8:30 AM" — airport-local clock time. */
export function formatTime(iso: string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(parseWallClock(iso));
}

/** "Thu, Jun 25" */
export function formatDayDate(iso: string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseWallClock(iso));
}

/** "Thursday, June 25, 2026" — from a `yyyy-MM-dd` string. */
export function formatFullDate(date: string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseWallClock(`${date}T00:00`));
}

/** "7h 15m" / "45m" / "12h" */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Number of whole calendar days the arrival lands after the departure date. */
export function dayOffsetBetween(departureIso: string, arrivalIso: string): number {
  const dep = parseWallClock(`${departureIso.slice(0, 10)}T00:00`);
  const arr = parseWallClock(`${arrivalIso.slice(0, 10)}T00:00`);
  return Math.round((arr.getTime() - dep.getTime()) / (MINUTES_PER_DAY * 60_000));
}

/** Today's date as `yyyy-MM-dd` in the host's local timezone. */
export function todayDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
