import {
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
  /** UUID of the authenticated user from neon_auth.user */
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
