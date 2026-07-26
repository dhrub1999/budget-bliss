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

// ─── Money coercion (shared) ──────────────────────────────────────────────────
/** ₹1 trillion. Any real figure is far below this; anything above is a typo or an attack. */
export const MAX_MONEY = 1e12;

/**
 * Every amount, balance and limit in the app must funnel through this.
 *
 * Zod v3's `ZodNumber` rejects only non-numbers and `NaN`. `Infinity` **is** a
 * number, is not `NaN`, and happily satisfies `.positive()` — and
 * `JSON.parse('{"amount":1e999}')` produces exactly that. `doublePrecision` has no
 * `mapToDriver` guard, so Postgres stores `'Infinity'` and every aggregate in
 * `lib/accounts/balances.ts` reads back `Infinity`/`NaN` from then on: net worth,
 * budget percentages, card utilisation, goal bars. The row renders as `₹∞` and is
 * invisible in the UI, so there is nothing to click and delete.
 *
 * `.finite()` is opt-in in Zod, which is why it has to be spelled out per field.
 * Compose the sign constraint at the call site: `money().positive({ message })`.
 */
export const money = (params?: { invalid_type_error?: string }) =>
  z.coerce
    .number(params ?? { invalid_type_error: 'Amount must be a number' })
    .finite({ message: 'Enter a real number' })
    .max(MAX_MONEY, { message: 'That amount is unrealistically large' });

export const transactionSchema = z.object({
  amount: money().positive({ message: 'Amount must be a positive number' }),
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
// Exported so sibling validation modules (e.g. bill.ts) coerce dates the same
// way rather than each rolling their own preprocessor.
export const dateField = z.preprocess(
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
  amount: money().positive({ message: 'Enter an amount' })
});

/**
 * One expense splits into at most this many rows. Without a cap a single request
 * could mint unbounded transactions sharing one `splitGroupId` — and there is no
 * bulk-undo for a split group.
 */
export const MAX_ALLOCATIONS = 20;

/** Rupee slack when reconciling a split against its stated total. */
export const ALLOCATION_TOLERANCE = 0.5;

/**
 * Shared by the API payload and the client form so the two cannot drift.
 *
 * `POST /api/transactions` derives the stored total from the allocations
 * themselves rather than from `amount`, so a mismatch doesn't corrupt a balance —
 * it means the user is recorded as spending something other than the figure they
 * typed. Enforced server-side because until now this lived *only* in the client
 * schema, i.e. only in the code an attacker doesn't run.
 */
function assertAllocationsAgree(
  d: {
    amount?: number;
    allocations?: readonly { accountId: string; amount: number }[];
  },
  ctx: z.RefinementCtx
) {
  const rows = d.allocations ?? [];
  if (rows.length === 0) return;

  const ids = rows.map((r) => r.accountId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      path: ['allocations'],
      code: z.ZodIssueCode.custom,
      message: 'Each account can be used once'
    });
  }

  // Only checkable when the caller stated a total to check against.
  if (d.amount === undefined) return;
  const sum = rows.reduce((s, r) => s + r.amount, 0);
  if (Math.abs(sum - d.amount) > ALLOCATION_TOLERANCE) {
    ctx.addIssue({
      path: ['allocations'],
      code: z.ZodIssueCode.custom,
      message: `Allocations must total ₹${d.amount}`
    });
  }
}

export const createTransactionSchema = z
  .object({
    type: z.enum(['credit', 'debit']),
    amount: money().positive().optional(),
    category: z.string().min(1, { message: 'Category is required' }),
    vendor: z.string().optional(),
    date: dateField,
    notes: z.string().optional(),
    // income
    destinationAccountId: z.string().optional(),
    goalId: z.string().optional(),
    // expense (single source = one allocation)
    allocations: z
      .array(allocationSchema)
      .max(MAX_ALLOCATIONS, {
        message: `A split cannot exceed ${MAX_ALLOCATIONS} accounts`
      })
      .optional(),
    override: z.boolean().optional()
  })
  .superRefine(assertAllocationsAgree);

// ─── API payload (edit — single transaction) ──────────────────────────────────
export const updateTransactionSchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: money().positive(),
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
    amount: money().positive({ message: 'Amount must be a positive number' }),
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
    allocations: z
      .array(allocationSchema)
      .max(MAX_ALLOCATIONS, {
        message: `A split cannot exceed ${MAX_ALLOCATIONS} accounts`
      })
      .optional(),
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
        assertAllocationsAgree(d, ctx);
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

// ─── API payload (CSV import) ─────────────────────────────────────────────────
/**
 * Import deliberately does NOT reuse `dateField`, which silently substitutes
 * `new Date()` for anything it can't read. That's the right call for a form the
 * user is looking at; for a bulk CSV it would quietly stamp today's date onto
 * every unparseable row. `z.coerce.date()` rejects an Invalid Date instead, and
 * the caller gets told which row is wrong.
 */
export const importItemSchema = z.object({
  amount: money().positive({ message: 'Amount must be a positive number' }),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().trim().min(1).max(64).default('Others'),
  description: z.string().trim().max(500).default('Imported Transaction'),
  date: z.coerce.date({ invalid_type_error: 'Invalid date' })
});

/** One CSV upload. Capped so a single request can't become a multi-hundred-MB INSERT. */
export const MAX_IMPORT_ROWS = 1000;

export const importTransactionsSchema = z.object({
  items: z
    .array(importItemSchema)
    .min(1, { message: 'No transaction rows provided' })
    .max(MAX_IMPORT_ROWS, {
      message: `Import is limited to ${MAX_IMPORT_ROWS} rows at a time`
    })
});

// ─── API payload (bulk delete) ────────────────────────────────────────────────
/** ids are cuid2 (24 chars); 40 leaves headroom without allowing a megabyte of junk. */
export const MAX_BULK_IDS = 500;

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string().min(1).max(40))
    .min(1, { message: 'No transactions selected' })
    .max(MAX_BULK_IDS, {
      message: `Delete is limited to ${MAX_BULK_IDS} rows at a time`
    })
});

export type ImportItemInput = z.input<typeof importItemSchema>;
export type ImportItemOutput = z.output<typeof importItemSchema>;
export type AllocationInput = z.input<typeof allocationSchema>;
export type TransactionFormInput = z.input<typeof transactionFormSchema>;
export type TransactionFormOutput = z.output<typeof transactionFormSchema>;
