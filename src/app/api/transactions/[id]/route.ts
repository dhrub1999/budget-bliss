import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, accounts } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { updateTransactionSchema } from '@/lib/validations/transaction';
import { applyGoalContribution } from '@/lib/goals/contribute';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawData = await request.json();
    console.log(`PATCH /api/transactions/${id} called with:`, rawData);

    const parsed = updateTransactionSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues?.[0]?.message || 'Validation failed'
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

    // Load the existing row so we can reverse any prior goal earmark.
    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found or unauthorized' },
        { status: 404 }
      );
    }

    // Validate the target account belongs to the user.
    if (data.accountId) {
      const [owned] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(eq(accounts.id, data.accountId), eq(accounts.userId, userId))
        );
      if (!owned) {
        return NextResponse.json(
          { success: false, error: 'Invalid account selected' },
          { status: 400 }
        );
      }
    }

    const formattedDate = new Date(data.date);
    const vendor = data.vendor?.trim() || '';
    const description = `${vendor}${data.notes ? (vendor ? ': ' : '') + data.notes : ''}`;
    const txnType = data.type === 'credit' ? 'INCOME' : 'EXPENSE';
    const newGoalId = txnType === 'INCOME' ? data.goalId || null : null;

    const updated = await db.transaction(async (tx) => {
      // Reverse the previous earmark, if any.
      if (existing.goalId && existing.type === 'INCOME') {
        try {
          await applyGoalContribution(
            tx,
            userId,
            existing.goalId,
            -existing.amount
          );
        } catch {
          // goal may have been deleted — ignore reversal
        }
      }

      const [row] = await tx
        .update(transactions)
        .set({
          amount: data.amount,
          type: txnType,
          category: data.category,
          description,
          date: formattedDate,
          accountId: data.accountId || null,
          goalId: newGoalId
        })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning();

      // Apply the new earmark, if any.
      if (newGoalId) {
        await applyGoalContribution(tx, userId, newGoalId, data.amount);
      }

      return row;
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    revalidatePath('/dashboard/accounts');

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update transaction'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      if (!existing) return;

      // Reverse any goal earmark before deleting.
      if (existing.goalId && existing.type === 'INCOME') {
        try {
          await applyGoalContribution(
            tx,
            userId,
            existing.goalId,
            -existing.amount
          );
        } catch {
          // goal may have been deleted — ignore reversal
        }
      }

      await tx
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    revalidatePath('/dashboard/accounts');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete transaction'
      },
      { status: 500 }
    );
  }
}
