import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { transactions, goals } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { TransactionsView } from '@/features/transactions/components/transactions-view';
import { getAccountsWithBalances } from '@/features/accounts/lib/get-accounts';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Transactions | BudgetBliss',
  description:
    'View, search, filter, export, and import all your financial transactions.'
};

export default async function TransactionsPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  const [dbTxns, { accounts }, dbGoals] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date)),
    getAccountsWithBalances(userId),
    db.select().from(goals).where(eq(goals.userId, userId))
  ]);

  const formattedTransactions = dbTxns.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type as 'INCOME' | 'EXPENSE',
    category: t.category,
    description: t.description,
    date: t.date.toISOString(),
    accountId: t.accountId,
    goalId: t.goalId
  }));

  const goalOptions = dbGoals
    .filter((g) => !g.isCompleted)
    .map((g) => ({ id: g.id, name: g.name, icon: g.icon, color: g.color }));

  return (
    <TransactionsView
      initialTransactions={formattedTransactions}
      accounts={accounts}
      goals={goalOptions}
    />
  );
}
