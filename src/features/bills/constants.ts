import type { Recurrence } from '@/lib/validations/bill';
import type { BillStatus } from './types';

/** A bill this many days out (or fewer) counts as "due soon". */
export const DUE_SOON_DAYS = 7;

/** Horizon for the dashboard summary and the "upcoming" total. */
export const UPCOMING_HORIZON_DAYS = 30;

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  NONE: 'One-off',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly'
};

/** Section headings on the bills page, in display order. */
export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  OVERDUE: 'Overdue',
  DUE_TODAY: 'Due today',
  DUE_SOON: 'Due this week',
  LATER: 'Later'
};

export const BILL_STATUS_ORDER: BillStatus[] = [
  'OVERDUE',
  'DUE_TODAY',
  'DUE_SOON',
  'LATER'
];

/**
 * Status colours. Rose/amber mirror the credit-utilisation thresholds in
 * features/accounts/constants.ts so urgency reads consistently across the app.
 */
export const BILL_STATUS_STYLES: Record<
  BillStatus,
  { text: string; bg: string; border: string; dot: string }
> = {
  OVERDUE: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400'
  },
  DUE_TODAY: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400'
  },
  DUE_SOON: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400'
  },
  LATER: {
    text: 'text-muted-foreground',
    bg: 'bg-muted/30',
    border: 'border-border/50',
    dot: 'bg-muted-foreground'
  }
};
