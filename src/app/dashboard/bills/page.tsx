import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getBills } from '@/features/bills/lib/get-bills';
import { getAccountsWithBalances } from '@/features/accounts/lib/get-accounts';
import { BillsView } from '@/features/bills/components/bills-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bills & Upcoming | BudgetBliss',
  description:
    'Track bills, rent and EMI due dates you enter yourself. Shown in the app when you open it — no bank linking and no notifications.'
};

export default async function BillsPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const [{ bills }, { accounts }] = await Promise.all([
    getBills(session.user.id),
    getAccountsWithBalances(session.user.id)
  ]);

  return (
    <BillsView
      bills={bills}
      accounts={accounts}
      serverNow={new Date().toISOString()}
    />
  );
}
