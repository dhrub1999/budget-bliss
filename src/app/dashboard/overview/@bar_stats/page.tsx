import { delay } from '@/constants/mock-api';
import { SpendingCategories } from '@/features/overview/components/spending-categories';
import { db } from '@/db';
import { transactions, budgets } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

export default async function BarStats() {
  await delay(800);

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return <SpendingCategories dbTransactions={[]} dbBudgets={[]} />;
  }

  const dbTxns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id));

  const dbBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, session.user.id));

  const serializedTxns = dbTxns.map((t) => ({
    ...t,
    date: t.date.toISOString()
  }));

  const serializedBudgets = dbBudgets.map((b) => ({
    id: b.id,
    category: b.category,
    amount: b.amount,
    period: b.period,
    userId: b.userId,
    createdAt: b.createdAt.toISOString()
  }));

  return (
    <SpendingCategories
      dbTransactions={serializedTxns}
      dbBudgets={serializedBudgets}
    />
  );
}
