import type { Recurrence } from '@/lib/validations/bill';
import { calendarDaysBetween, dueDayOf, type DueDateString } from './date';

const STEP_MONTHS: Record<Exclude<Recurrence, 'NONE'>, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12
};

/** Days in a given month, computed via UTC so no local zone is involved. */
function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Advances a due date by whole months, re-anchoring the day-of-month.
 *
 * The anchor exists because naive month arithmetic silently degrades: Jan 31 +
 * 1 month clamps to Feb 28, and rolling *that* forward gives Mar 28 — a rent
 * bill quietly migrates off the 31st and never comes back. Re-anchoring to the
 * original day (capped at the target month's length) keeps Jan 31 → Feb 28 →
 * Mar 31.
 *
 * Returns null for 'NONE' — a one-off bill has no next cycle.
 */
export function rollForward(
  dueDate: DueDateString,
  recurrence: Recurrence,
  dueDay?: number | null
): DueDateString | null {
  if (recurrence === 'NONE') return null;

  const [year, month] = dueDate.split('-').map(Number);
  const anchor = dueDay ?? dueDayOf(dueDate);

  // month is 1-based in the string; work 0-based, then normalise the overflow.
  const total = month - 1 + STEP_MONTHS[recurrence];
  const nextYear = year + Math.floor(total / 12);
  const nextMonth = ((total % 12) + 12) % 12;
  const day = Math.min(anchor, daysInMonth(nextYear, nextMonth));

  const mm = String(nextMonth + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${nextYear}-${mm}-${dd}`;
}

/**
 * Rolls forward repeatedly until the due date is no longer in the past.
 *
 * Guards the case where a bill has been ignored for several cycles: a single
 * roll would leave a monthly bill last paid in March still showing as overdue
 * in July. Capped so a corrupt date can't spin.
 */
export function rollForwardPast(
  dueDate: DueDateString,
  recurrence: Recurrence,
  dueDay: number | null | undefined,
  notBefore: DueDateString
): DueDateString | null {
  let next = rollForward(dueDate, recurrence, dueDay);
  if (!next) return null;

  let guard = 0;
  while (calendarDaysBetween(next, notBefore) > 0 && guard < 120) {
    const further = rollForward(next, recurrence, dueDay);
    if (!further) break;
    next = further;
    guard += 1;
  }
  return next;
}
