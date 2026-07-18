import { delay } from '@/constants/mock-api';
import { RecentTransactions } from '@/features/overview/components/recent-transactions';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { eq, desc } from 'drizzle-orm';

export default async function Sales() {
  await delay(700);

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return <RecentTransactions dbTransactions={[]} />;
  }

  const dbTxns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id))
    .orderBy(desc(transactions.date));

  const serializedTxns = dbTxns.map((t) => ({
    ...t,
    date: t.date.toISOString()
  }));

  return <RecentTransactions dbTransactions={serializedTxns} />;
}
