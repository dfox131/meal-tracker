import { TZDate } from "@date-fns/tz";

// Calendar dates travel between server and client as "YYYY-MM-DD" strings, not
// Date objects. A Date is an instant: one created at midnight in the server's
// timezone (UTC on Vercel) is still the previous day in negative-offset zones
// like the Americas. Building the Date from its parts in whichever runtime
// renders it keeps the calendar day the same everywhere.

export function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses "YYYY-MM-DD" as local midnight; returns undefined if invalid. */
export function parseDateParam(value: string | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);

  // Reject dates that roll over, e.g. 2026-02-31.
  return formatDateParam(date) === value ? date : undefined;
}

/** True if `value` is an IANA timezone name the runtime recognizes. */
export function isValidTimeZone(value: string | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** The calendar day ("YYYY-MM-DD") that `instant` falls on in `timeZone`. */
export function formatDateParamInTimeZone(instant: Date, timeZone: string) {
  return formatDateParam(new TZDate(instant, timeZone));
}

/**
 * The instants bounding the calendar day `dateParam` in `timeZone`:
 * `start` is inclusive local midnight, `end` is the next day's local midnight
 * (exclusive). DST days come out as 23 or 25 hours long.
 */
export function getDayRangeInTimeZone(dateParam: string, timeZone: string) {
  const date = parseDateParam(dateParam);
  if (!date) throw new Error(`Invalid date: ${dateParam}`);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return {
    start: new Date(new TZDate(year, month, day, timeZone).getTime()),
    end: new Date(new TZDate(year, month, day + 1, timeZone).getTime()),
  };
}

/** Cookie the browser uses to tell the server its IANA timezone. */
export const TIME_ZONE_COOKIE = "tz";
