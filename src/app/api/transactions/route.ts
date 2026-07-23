import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, budgets, accounts } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { createTransactionSchema } from '@/lib/validations/transaction';
import { applyGoalContribution } from '@/lib/goals/contribute';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    console.log('POST /api/transactions called with:', rawData);

    const parsed = createTransactionSchema.safeParse(rawData);
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
    const userId = session.user.id;

    const formattedDate = new Date(data.date);
    const vendor = data.vendor?.trim() || '';
    const description = `${vendor}${data.notes ? (vendor ? ': ' : '') + data.notes : ''}`;
    const txnType = data.type === 'credit' ? 'INCOME' : 'EXPENSE';

    // Collect the account ids we need to validate belong to the user.
    const referencedAccountIds = new Set<string>();
    if (data.destinationAccountId)
      referencedAccountIds.add(data.destinationAccountId);
    for (const a of data.allocations ?? [])
      referencedAccountIds.add(a.accountId);

    if (referencedAccountIds.size > 0) {
      const owned = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, userId),
            inArray(accounts.id, Array.from(referencedAccountIds))
          )
        );
      if (owned.length !== referencedAccountIds.size) {
        return NextResponse.json(
          { success: false, error: 'Invalid account selected' },
          { status: 400 }
        );
      }
    }

    // Build the row(s) to insert.
    let totalAmount = 0;
    const rows: Array<{
      amount: number;
      accountId: string | null;
      goalId: string | null;
      splitGroupId: string | null;
    }> = [];

    if (txnType === 'EXPENSE') {
      const allocations =
        data.allocations && data.allocations.length > 0
          ? data.allocations
          : data.amount
            ? [{ accountId: '', amount: data.amount }]
            : [];
      if (allocations.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No amount or allocations provided' },
          { status: 400 }
        );
      }
      const splitGroupId = allocations.length > 1 ? createId() : null;
      for (const a of allocations) {
        totalAmount += a.amount;
        rows.push({
          amount: a.amount,
          accountId: a.accountId || null,
          goalId: null,
          splitGroupId
        });
      }
    } else {
      // INCOME — single row into the destination account.
      const amount = data.amount ?? 0;
      if (amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Amount must be positive' },
          { status: 400 }
        );
      }
      totalAmount = amount;
      rows.push({
        amount,
        accountId: data.destinationAccountId || null,
        goalId: data.goalId || null,
        splitGroupId: null
      });
    }

    // Insert row(s) and apply any goal earmark atomically.
    const inserted = await db.transaction(async (tx) => {
      const result = await tx
        .insert(transactions)
        .values(
          rows.map((r) => ({
            amount: r.amount,
            type: txnType,
            category: data.category,
            description,
            date: formattedDate,
            accountId: r.accountId,
            goalId: r.goalId,
            splitGroupId: r.splitGroupId,
            userId
          }))
        )
        .returning();

      if (txnType === 'INCOME' && data.goalId) {
        await applyGoalContribution(tx, userId, data.goalId, totalAmount);
      }

      return result;
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    revalidatePath('/dashboard/accounts');

    let budgetAlert = null;

    if (txnType === 'EXPENSE') {
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

      const categorySpending = monthTxns
        .filter((t) => t.category === data.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpending = monthTxns.reduce((sum, t) => sum + t.amount, 0);

      const userBudgets = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.period, 'MONTHLY')));

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
      transactions: inserted,
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
