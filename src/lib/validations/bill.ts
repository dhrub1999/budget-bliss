import { z } from 'zod';
import { expenseCategories, money } from './transaction';

/**
 * Bill validation. Client-safe by contract — this module is imported by the
 * bill form, so it must never pull in anything from `@/db`.
 */

export const recurrenceEnum = z.enum([
  'NONE',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY'
]);

export type Recurrence = z.infer<typeof recurrenceEnum>;

/** Ordered for the form select; 'NONE' first because it reads as "just once". */
export const recurrenceOptions = [
  'NONE',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY'
] as const;

/**
 * A due date is a calendar day, not an instant.
 *
 * Accepting a Date here (and calling toISOString on the client) would push the
 * day backwards for any positive UTC offset — a bill picked as 31 Jan in IST
 * arrives at the server as 30 Jan 18:30Z. So the wire format is `yyyy-MM-dd`
 * and a Date, if given, is reduced to its *local* calendar day.
 */
const dueDateField = z.preprocess(
  (val) => {
    if (val instanceof Date) {
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${val.getFullYear()}-${m}-${d}`;
    }
    return val;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Pick a due date' })
    .refine(
      (s) => {
        const [y, m, d] = s.split('-').map(Number);
        const probe = new Date(Date.UTC(y, m - 1, d));
        return (
          probe.getUTCFullYear() === y &&
          probe.getUTCMonth() === m - 1 &&
          probe.getUTCDate() === d
        );
      },
      { message: 'That date does not exist' }
    )
);

export const billSchema = z.object({
  name: z.string().trim().min(1, { message: 'Give the bill a name' }),
  amount: money().positive({ message: 'Amount must be a positive number' }),
  category: z
    .string()
    .min(1, { message: 'Category is required' })
    .default('Bills'),
  recurrence: recurrenceEnum.default('MONTHLY'),
  dueDate: dueDateField,
  /** Optional — the account this is usually paid from. */
  accountId: z.string().optional(),
  notes: z.string().optional()
});

/** PATCH payload: every field optional, but validated when present. */
export const updateBillSchema = billSchema.partial();

export type BillSchemaInput = z.input<typeof billSchema>;
export type BillSchemaOutput = z.output<typeof billSchema>;
export type UpdateBillInput = z.input<typeof updateBillSchema>;

/** Re-exported so the bill form doesn't need to import from transaction.ts. */
export { expenseCategories };
