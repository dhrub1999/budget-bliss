import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getAccountsWithBalances } from '@/features/accounts/lib/get-accounts';
import { AccountsView } from '@/features/accounts/components/accounts-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Accounts | BudgetBliss',
  description:
    'Manage your savings accounts, credit cards, wallets, and cash in one place.'
};

export default async function AccountsPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { accounts, portfolio } = await getAccountsWithBalances(
    session.user.id
  );

  return <AccountsView accounts={accounts} portfolio={portfolio} />;
}
