import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { inArray, and, eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    await db
      .delete(transactions)
      .where(
        and(
          inArray(transactions.id, ids),
          eq(transactions.userId, session.user.id)
        )
      );

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error('Error bulk deleting transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to bulk delete transactions'
      },
      { status: 500 }
    );
  }
}
