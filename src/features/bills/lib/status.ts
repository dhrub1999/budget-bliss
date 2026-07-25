import { DUE_SOON_DAYS, UPCOMING_HORIZON_DAYS } from '../constants';
import type { BillGroup, BillRecord, BillStatus, BillsSummary } from '../types';
import {
  calendarDaysBetween,
  todayDueDateString,
  type DueDateString
} from './date';

/**
 * Pure status derivation over calendar days.
 *
 * `today` is always passed in rather than read from the clock so the caller
 * controls it — pages seed it from the server's clock to keep SSR and the first
 * client paint identical, then correct it on mount.
 */
export function getBillStatus(dueDate: DueDateString, today: Date): BillStatus {
  const days = daysUntilDue(dueDate, today);
  if (days < 0) return 'OVERDUE';
  if (days === 0) return 'DUE_TODAY';
  if (days <= DUE_SOON_DAYS) return 'DUE_SOON';
  return 'LATER';
}

/** Whole days until due. Negative when overdue. */
export function daysUntilDue(dueDate: DueDateString, today: Date): number {
  return calendarDaysBetween(todayDueDateString(today), dueDate);
}

/** Human phrasing for the due chip: "3 days overdue", "Today", "in 5 days". */
export function formatDueLabel(dueDate: DueDateString, today: Date): string {
  const days = daysUntilDue(dueDate, today);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return '1 day overdue';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `in ${days} days`;
}

/** Groups bills into display sections, dropping empty ones. Assumes due-date order. */
export function groupBillsByStatus(
  bills: BillRecord[],
  today: Date
): BillGroup[] {
  const buckets = new Map<BillStatus, BillRecord[]>();

  for (const bill of bills) {
    const status = getBillStatus(bill.dueDate, today);
    const existing = buckets.get(status);
    if (existing) existing.push(bill);
    else buckets.set(status, [bill]);
  }

  return (['OVERDUE', 'DUE_TODAY', 'DUE_SOON', 'LATER'] as BillStatus[])
    .filter((status) => (buckets.get(status)?.length ?? 0) > 0)
    .map((status) => ({ status, bills: buckets.get(status)! }));
}

export function summariseBills(bills: BillRecord[], today: Date): BillsSummary {
  let overdueCount = 0;
  let overdueTotal = 0;
  let upcomingCount = 0;
  let upcomingTotal = 0;

  for (const bill of bills) {
    const days = daysUntilDue(bill.dueDate, today);
    if (days < 0) {
      overdueCount += 1;
      overdueTotal += bill.amount;
    }
    if (days <= UPCOMING_HORIZON_DAYS) {
      upcomingCount += 1;
      upcomingTotal += bill.amount;
    }
  }

  return { overdueCount, overdueTotal, upcomingCount, upcomingTotal };
}

/**
 * The single most pressing bill, for the Quick Insights slot. Overdue wins;
 * otherwise the soonest due. Returns null when nothing is within the horizon.
 */
export function mostPressingBill(
  bills: BillRecord[],
  today: Date
): BillRecord | null {
  let best: BillRecord | null = null;
  let bestDays = Number.POSITIVE_INFINITY;

  for (const bill of bills) {
    const days = daysUntilDue(bill.dueDate, today);
    if (days > UPCOMING_HORIZON_DAYS) continue;
    // Overdue sorts first (days is negative), then soonest.
    if (days < bestDays) {
      bestDays = days;
      best = bill;
    }
  }

  return best;
}
