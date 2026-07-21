import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { goals, budgets, transactions } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { BudgetingView } from '@/features/budgeting/components/budgeting-view';

export const metadata = {
  title: 'Budgeting & Goals | BudgetBliss',
  description:
    'Manage monthly & yearly budget limits, category thresholds, and financial goals.'
};

export default async function BudgetingPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // 1. Fetch user goals
  const dbGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));

  const formattedGoals = dbGoals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    savedAmount: g.savedAmount,
    icon: g.icon,
    color: g.color,
    deadline: g.deadline.toISOString(),
    isCompleted: g.isCompleted,
    completedAt: g.completedAt ? g.completedAt.toISOString() : null,
    userId: g.userId,
    createdAt: g.createdAt.toISOString()
  }));

  // 2. Fetch user budgets
  const dbBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.createdAt));

  const formattedBudgets = dbBudgets.map((b) => ({
    id: b.id,
    category: b.category,
    amount: b.amount,
    period: b.period as 'MONTHLY' | 'YEARLY',
    userId: b.userId,
    createdAt: b.createdAt.toISOString()
  }));

  // 3. Fetch current month's expenses for budget monitoring
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const monthTxns = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'EXPENSE'),
        gte(transactions.date, firstDayOfMonth),
        lte(transactions.date, lastDayOfMonth)
      )
    );

  const spendingByCategoryMap: Record<string, number> = {};
  let totalMonthlySpending = 0;

  monthTxns.forEach((t) => {
    spendingByCategoryMap[t.category] =
      (spendingByCategoryMap[t.category] || 0) + t.amount;
    totalMonthlySpending += t.amount;
  });

  const monthlySpendings = Object.entries(spendingByCategoryMap).map(
    ([category, spent]) => ({
      category,
      spent
    })
  );

  return (
    <BudgetingView
      initialBudgets={formattedBudgets}
      initialGoals={formattedGoals}
      monthlySpendings={monthlySpendings}
      totalMonthlySpending={totalMonthlySpending}
    />
  );
}
