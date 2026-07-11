import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
