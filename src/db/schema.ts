import {
  boolean,
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// ─── Transactions ─────────────────────────────────────────────────────────────
// userId references neon_auth.user.id — managed by Neon Auth, not Drizzle.

export const transactions = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  amount: doublePrecision('amount').notNull(),
  /** "INCOME" | "EXPENSE" */
  type: text('type').notNull(),
  /** e.g. "Salary", "Rent", "Groceries" */
  category: text('category').notNull(),
  description: text('description'),
  date: timestamp('date').notNull().defaultNow(),
  /** accounts.id (by convention, no DB FK). NULL = legacy → default Cash account. */
  accountId: text('account_id'),
  /** goals.id (by convention). Set when INCOME is earmarked to a goal. */
  goalId: text('goal_id'),
  /** Groups the rows of a single expense split across multiple accounts. */
  splitGroupId: text('split_group_id'),
  /** UUID of the authenticated user from neon_auth.user */
  userId: uuid('user_id').notNull()
});

// ─── Goals ────────────────────────────────────────────────────────────────────
// userId references neon_auth.user.id — managed by Neon Auth, not Drizzle.

export const goals = pgTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  targetAmount: doublePrecision('target_amount').notNull(),
  savedAmount: doublePrecision('saved_amount').notNull().default(0),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  deadline: timestamp('deadline').notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  /** UUID of the authenticated user from neon_auth.user */
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// ─── Budgets ──────────────────────────────────────────────────────────────────
// userId references neon_auth.user.id — managed by Neon Auth, not Drizzle.

export const budgets = pgTable('budgets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  /** e.g. "Groceries", "Rent" or "TOTAL" for overall budget */
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  /** "MONTHLY" | "YEARLY" */
  period: text('period').notNull().default('MONTHLY'),
  /** UUID of the authenticated user from neon_auth.user */
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ─── Accounts ───────────────────────────────────────────────────────────────
// userId references neon_auth.user.id — managed by Neon Auth, not Drizzle.
// Unified table with a text discriminator; per-type fields are nullable.

export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  /** "SAVINGS" | "CREDIT_CARD" | "WALLET" | "CASH" */
  type: text('type').notNull(),
  /** Display name, e.g. "HDFC Savings", "Amazon Pay", "Cash" */
  name: text('name').notNull(),
  /** Bank / wallet-provider / card brand for display. Null for CASH. */
  provider: text('provider'),

  // ── Balance inputs (nullable; presence depends on type) ──
  /** Asset accounts (SAVINGS/WALLET/CASH): starting balance. Treat null as 0. */
  openingBalance: doublePrecision('opening_balance'),
  /** CREDIT_CARD only: total credit line. */
  creditLimit: doublePrecision('credit_limit'),
  /** SAVINGS only: minimum balance to maintain (warning threshold). */
  minimumBalance: doublePrecision('minimum_balance'),
  /** WALLET only: regulatory cap (e.g. 200000). */
  maxBalance: doublePrecision('max_balance'),

  // ── Cosmetic card fields (feed the credit-card visual widget) ──
  /** Last 4 digits (string, preserves leading zeros). CREDIT_CARD only. */
  last4: text('last4'),
  cardHolder: text('card_holder'),
  /** "MM/YY" */
  validThru: text('valid_thru'),
  /** "mastercard" | "visa" | "rupay" | "amex" */
  brand: text('brand'),
  /** Tailwind gradient classes or hex, used by the card widget. */
  gradient: text('gradient'),

  // ── State ──
  isDefault: boolean('is_default').notNull().default(false),
  isArchived: boolean('is_archived').notNull().default(false),

  /** UUID of the authenticated user from neon_auth.user */
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
