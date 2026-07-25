import { delay } from '@/constants/mock-api';
import { FinancialCalendar } from '@/features/overview/components/financial-calendar';
import { getBills } from '@/features/bills/lib/get-bills';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

export default async function AreaStats() {
  await delay(600);

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return <FinancialCalendar dbTransactions={[]} />;
  }

  const [dbTxns, { bills }] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, session.user.id)),
    getBills(session.user.id)
  ]);

  const serializedTxns = dbTxns.map((t) => ({
    ...t,
    date: t.date.toISOString()
  }));

  return <FinancialCalendar dbTransactions={serializedTxns} dbBills={bills} />;
}
