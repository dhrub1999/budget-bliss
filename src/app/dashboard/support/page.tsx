import { redirect } from 'next/navigation';

import { SupportView } from '@/features/support/components/support-view';
import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Support | BudgetBliss',
  description:
    'Report a bug, request a feature, reach the maintainer, or contribute to BudgetBliss on GitHub.'
};

export default async function SupportPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  return <SupportView />;
}
