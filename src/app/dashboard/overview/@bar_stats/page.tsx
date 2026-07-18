import { delay } from '@/constants/mock-api';
import { SpendingCategories } from '@/features/overview/components/spending-categories';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

export default async function BarStats() {
  await delay(800);

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return <SpendingCategories dbTransactions={[]} />;
  }

  const dbTxns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id));

  const serializedTxns = dbTxns.map((t) => ({
    ...t,
    date: t.date.toISOString()
  }));

  return <SpendingCategories dbTransactions={serializedTxns} />;
}
