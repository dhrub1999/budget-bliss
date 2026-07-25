import { asc, and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { accounts, bills as billsTable } from '@/db/schema';
import type { Recurrence } from '@/lib/validations/bill';
import type { BillRecord, BillsData } from '../types';
import { summariseBills } from './status';

/**
 * Server helper: loads the user's active bills in due-date order and flattens
 * them into the client-friendly BillRecord shape (ISO dates, account name
 * resolved). Use directly in Server Components — no client fetch waterfall.
 */
export async function getBills(userId: string): Promise<BillsData> {
  const [rows, userAccounts] = await Promise.all([
    db
      .select()
      .from(billsTable)
      .where(
        and(eq(billsTable.userId, userId), eq(billsTable.isArchived, false))
      )
      .orderBy(asc(billsTable.dueDate)),
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(eq(accounts.userId, userId))
  ]);

  const accountNames = new Map(userAccounts.map((a) => [a.id, a.name]));

  const bills: BillRecord[] = rows.map((b) => ({
    id: b.id,
    name: b.name,
    amount: b.amount,
    category: b.category,
    recurrence: b.recurrence as Recurrence,
    // Already a `yyyy-MM-dd` string — the column is `date`, not `timestamp`.
    dueDate: b.dueDate,
    dueDay: b.dueDay,
    accountId: b.accountId,
    accountName: b.accountId ? (accountNames.get(b.accountId) ?? null) : null,
    notes: b.notes,
    lastPaidAt: b.lastPaidAt ? b.lastPaidAt.toISOString() : null
  }));

  return { bills, summary: summariseBills(bills, new Date()) };
}
