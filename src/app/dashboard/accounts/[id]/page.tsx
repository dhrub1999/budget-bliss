import { auth } from '@/lib/auth/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and, or, isNull, desc } from 'drizzle-orm';
import { getAccountsWithBalances } from '@/features/accounts/lib/get-accounts';
import { AccountDetailView } from '@/features/accounts/components/account-detail-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Account Details | BudgetBliss',
  description: 'View balance and transaction history for a single account.'
};

export default async function AccountDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: session } = await auth.getSession();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  const { accounts } = await getAccountsWithBalances(userId);
  const account = accounts.find((a) => a.id === id);

  if (!account) {
    notFound();
  }

  // Include legacy null-accountId transactions when this is the default Cash account.
  const accountFilter =
    account.isDefault && account.type === 'CASH'
      ? or(eq(transactions.accountId, id), isNull(transactions.accountId))
      : eq(transactions.accountId, id);

  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.userId, userId), accountFilter))
    .orderBy(desc(transactions.date));

  const serialized = rows.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type as 'INCOME' | 'EXPENSE',
    category: t.category,
    description: t.description,
    date: t.date.toISOString()
  }));

  return (
    <AccountDetailView
      account={account}
      balance={account.balance}
      transactions={serialized}
      accounts={accounts}
    />
  );
}
