/**
 * Due dates are calendar days ("2026-01-31"), never instants.
 *
 * Everything that touches storage or comparison uses the string form; only
 * display converts to a Date, and then to a *local* Date so the rendered day
 * matches the string exactly regardless of the viewer's timezone.
 */

/** A `yyyy-MM-dd` calendar day. */
export type DueDateString = string;

const PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDueDateString(value: unknown): value is DueDateString {
  return typeof value === 'string' && PATTERN.test(value);
}

/** Formats a Date's *local* calendar day. Never use toISOString here. */
export function toDueDateString(d: Date): DueDateString {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Parses to a local Date at midnight, so display shows the same day. */
export function parseDueDate(value: DueDateString): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Day-of-month, read off the string so no timezone can shift it. */
export function dueDayOf(value: DueDateString): number {
  return Number(value.slice(8, 10));
}

/** Today as a calendar day, in the caller's zone. */
export function todayDueDateString(now: Date = new Date()): DueDateString {
  return toDueDateString(now);
}

/**
 * Whole days between two calendar days. Both sides are reduced to a UTC
 * midnight ordinal purely as arithmetic — no zone is implied by the result.
 */
export function calendarDaysBetween(
  from: DueDateString,
  to: DueDateString
): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86_400_000);
}
