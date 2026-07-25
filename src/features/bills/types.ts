import type { Recurrence } from '@/lib/validations/bill';
import type { DueDateString } from './lib/date';

/** How urgent a bill is, derived from its due date. Never stored. */
export type BillStatus = 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'LATER';

/**
 * Client-friendly bill. Serialized for the server/client boundary — same
 * convention as the accounts and budget views.
 */
export interface BillRecord {
  id: string;
  name: string;
  amount: number;
  category: string;
  recurrence: Recurrence;
  /** Calendar day, `yyyy-MM-dd`. Not an instant — see lib/date.ts. */
  dueDate: DueDateString;
  dueDay: number | null;
  accountId: string | null;
  /** Resolved account name, so the card doesn't have to look it up. */
  accountName: string | null;
  notes: string | null;
  /** ISO string, or null if never paid. */
  lastPaidAt: string | null;
}

export interface BillGroup {
  status: BillStatus;
  bills: BillRecord[];
}

export interface BillsSummary {
  /** Bills already past their due date. */
  overdueCount: number;
  overdueTotal: number;
  /** Bills due within the next 30 days, inclusive of overdue ones. */
  upcomingCount: number;
  upcomingTotal: number;
}

export interface BillsData {
  bills: BillRecord[];
  summary: BillsSummary;
}
