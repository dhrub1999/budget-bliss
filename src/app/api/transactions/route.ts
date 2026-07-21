import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, budgets } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and, gte, lte } from 'drizzle-orm';

import { transactionSchema } from '@/lib/validations/transaction';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    console.log('POST /api/transactions called with:', rawData);

    const parsed = transactionSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formattedDate = new Date(data.date);
    const description = `${data.account}${data.notes ? ': ' + data.notes : ''}`;
    const txnType = data.type === 'credit' ? 'INCOME' : 'EXPENSE';

    const [inserted] = await db
      .insert(transactions)
      .values({
        amount: data.amount,
        type: txnType,
        category: data.category,
        description,
        date: formattedDate,
        userId: session.user.id
      })
      .returning();

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');

    let budgetAlert = null;

    if (txnType === 'EXPENSE') {
      // Calculate current month's spending for category & overall total
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
            eq(transactions.userId, session.user.id),
            eq(transactions.type, 'EXPENSE'),
            gte(transactions.date, firstDayOfMonth),
            lte(transactions.date, lastDayOfMonth)
          )
        );

      const categorySpending = monthTxns
        .filter((t) => t.category === data.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpending = monthTxns.reduce((sum, t) => sum + t.amount, 0);

      // Check category budget
      const userBudgets = await db
        .select()
        .from(budgets)
        .where(
          and(
            eq(budgets.userId, session.user.id),
            eq(budgets.period, 'MONTHLY')
          )
        );

      const catBudget = userBudgets.find((b) => b.category === data.category);
      const totBudget = userBudgets.find((b) => b.category === 'TOTAL');

      if (catBudget && catBudget.amount > 0) {
        const pct = Math.round((categorySpending / catBudget.amount) * 100);
        if (pct >= 100) {
          budgetAlert = {
            status: 'EXCEEDED',
            category: data.category,
            spent: categorySpending,
            limit: catBudget.amount,
            pct
          };
        } else if (pct >= 80) {
          budgetAlert = {
            status: 'WARNING',
            category: data.category,
            spent: categorySpending,
            limit: catBudget.amount,
            pct
          };
        }
      }

      if (!budgetAlert && totBudget && totBudget.amount > 0) {
        const pct = Math.round((totalSpending / totBudget.amount) * 100);
        if (pct >= 100) {
          budgetAlert = {
            status: 'EXCEEDED',
            category: 'Total Monthly',
            spent: totalSpending,
            limit: totBudget.amount,
            pct
          };
        } else if (pct >= 80) {
          budgetAlert = {
            status: 'WARNING',
            category: 'Total Monthly',
            spent: totalSpending,
            limit: totBudget.amount,
            pct
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      transaction: inserted,
      budgetAlert
    });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save transaction' },
      { status: 500 }
    );
  }
}
