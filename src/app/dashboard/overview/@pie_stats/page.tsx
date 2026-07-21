import { delay } from '@/constants/mock-api';
import { GoalsSavings } from '@/features/overview/components/goals-savings';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

export default async function PieStats() {
  await delay(900);

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return <GoalsSavings dbGoals={[]} />;
  }

  const dbGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, session.user.id));

  const serializedGoals = dbGoals.map((g) => ({
    ...g,
    deadline: g.deadline.toISOString(),
    createdAt: g.createdAt.toISOString()
  }));

  return <GoalsSavings dbGoals={serializedGoals} />;
}
