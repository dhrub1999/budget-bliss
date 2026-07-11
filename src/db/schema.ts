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

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
