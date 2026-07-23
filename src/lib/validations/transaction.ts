import { z } from 'zod';

export const expenseCategories = [
  'Groceries',
  'Dining Out',
  'Subscriptions',
  'Bills',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Others'
] as const;

export const incomeCategories = [
  'Salary',
  'Freelance',
  'Investment',
  'Others'
] as const;

export const expenseVendors = [
  'Swiggy',
  'Zomato',
  'Amazon',
  'Netflix',
  'Uber',
  'Ola Cabs',
  'Blinkit',
  'Big Basket',
  'Myntra',
  'Spotify',
  'Others'
] as const;

export const incomeVendors = [
  'Company Salary',
  'Freelance Client',
  'Stock Dividend',
  'Investment Return',
  'Others'
] as const;

export const transactionSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive({ message: 'Amount must be a positive number' }),
  type: z.enum(['credit', 'debit']),
  category: z.string().min(1, { message: 'Category is required' }),
  account: z.string().min(1, { message: 'Account (vendor) is required' }),
  date: z.preprocess(
    (val) => {
      if (!val) return new Date();
      if (typeof val === 'string') return new Date(val);
      if (typeof val === 'number') return new Date(val);
      if (val instanceof Date) return val;
      return new Date();
    },
    z.date({
      required_error: 'Date is required',
      invalid_type_error: 'Invalid date format'
    })
  ),
  notes: z.string().optional()
});

export type TransactionSchemaInput = z.input<typeof transactionSchema>;
export type TransactionSchemaOutput = z.output<typeof transactionSchema>;

// ─── Date coercion (shared) ───────────────────────────────────────────────────
const dateField = z.preprocess(
  (val) => {
    if (!val) return new Date();
    if (typeof val === 'string') return new Date(val);
    if (typeof val === 'number') return new Date(val);
    if (val instanceof Date) return val;
    return new Date();
  },
  z.date({ invalid_type_error: 'Invalid date format' })
);

// ─── API payload (create) ─────────────────────────────────────────────────────
// One expense may be split across accounts → one row per allocation.
export const allocationSchema = z.object({
  accountId: z.string().min(1, { message: 'Select an account' }),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive({ message: 'Enter an amount' })
});

export const createTransactionSchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: z.coerce.number().positive().optional(),
  category: z.string().min(1, { message: 'Category is required' }),
  vendor: z.string().optional(),
  date: dateField,
  notes: z.string().optional(),
  // income
  destinationAccountId: z.string().optional(),
  goalId: z.string().optional(),
  // expense (single source = one allocation)
  allocations: z.array(allocationSchema).optional(),
  override: z.boolean().optional()
});

// ─── API payload (edit — single transaction) ──────────────────────────────────
export const updateTransactionSchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: z.coerce.number().positive(),
  category: z.string().min(1, { message: 'Category is required' }),
  vendor: z.string().optional(),
  date: dateField,
  notes: z.string().optional(),
  accountId: z.string().optional(),
  goalId: z.string().optional(),
  override: z.boolean().optional()
});

// ─── Client form schema (react-hook-form) ─────────────────────────────────────
export const transactionFormSchema = z
  .object({
    type: z.enum(['credit', 'debit']),
    amount: z.coerce
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive({ message: 'Amount must be a positive number' }),
    category: z.string().min(1, { message: 'Category is required' }),
    vendor: z.string().min(1, { message: 'Vendor is required' }),
    date: dateField,
    notes: z.string().optional(),
    // income
    destinationAccountId: z.string().optional(),
    goalId: z.string().optional(),
    // expense
    splitEnabled: z.boolean().default(false),
    sourceAccountId: z.string().optional(),
    allocations: z.array(allocationSchema).optional(),
    override: z.boolean().optional()
  })
  .superRefine((d, ctx) => {
    if (d.type === 'debit') {
      if (d.splitEnabled) {
        const rows = d.allocations ?? [];
        if (rows.length === 0) {
          ctx.addIssue({
            path: ['allocations'],
            code: z.ZodIssueCode.custom,
            message: 'Add at least one account'
          });
        }
        const sum = rows.reduce((s, a) => s + (Number(a.amount) || 0), 0);
        if (rows.length > 0 && Math.abs(sum - d.amount) > 0.5) {
          ctx.addIssue({
            path: ['allocations'],
            code: z.ZodIssueCode.custom,
            message: `Allocations must total ₹${d.amount}`
          });
        }
        const ids = rows.map((r) => r.accountId);
        if (new Set(ids).size !== ids.length) {
          ctx.addIssue({
            path: ['allocations'],
            code: z.ZodIssueCode.custom,
            message: 'Each account can be used once'
          });
        }
      } else if (!d.sourceAccountId) {
        ctx.addIssue({
          path: ['sourceAccountId'],
          code: z.ZodIssueCode.custom,
          message: 'Choose an account to pay from'
        });
      }
    } else {
      // credit / income
      if (!d.destinationAccountId && !d.goalId) {
        ctx.addIssue({
          path: ['destinationAccountId'],
          code: z.ZodIssueCode.custom,
          message: 'Choose where the money went'
        });
      }
      if (d.goalId && !d.destinationAccountId) {
        ctx.addIssue({
          path: ['destinationAccountId'],
          code: z.ZodIssueCode.custom,
          message: 'Pick the account holding this goal'
        });
      }
    }
  });

export type AllocationInput = z.input<typeof allocationSchema>;
export type TransactionFormInput = z.input<typeof transactionFormSchema>;
export type TransactionFormOutput = z.output<typeof transactionFormSchema>;
