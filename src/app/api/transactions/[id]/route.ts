import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { transactionSchema } from '@/lib/validations/transaction';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawData = await request.json();
    console.log(`PATCH /api/transactions/${id} called with:`, rawData);

    const parsed = transactionSchema.safeParse(rawData);
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

    const formattedDate = new Date(data.date);
    const description = `${data.account}${data.notes ? ': ' + data.notes : ''}`;
    const txnType = data.type === 'credit' ? 'INCOME' : 'EXPENSE';

    const [updated] = await db
      .update(transactions)
      .set({
        amount: data.amount,
        type: txnType,
        category: data.category,
        description,
        date: formattedDate
      })
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, session.user.id))
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found or unauthorized' },
        { status: 440 }
      );
    }

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');

    return NextResponse.json({
      success: true,
      transaction: updated
    });
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
  request: NextRequest,
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

    await db
      .delete(transactions)
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, session.user.id))
      );

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');

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
