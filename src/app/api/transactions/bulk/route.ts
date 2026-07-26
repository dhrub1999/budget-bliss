import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { inArray, and, eq } from 'drizzle-orm';

import { bulkDeleteSchema } from '@/lib/validations/transaction';

export async function DELETE(request: NextRequest) {
  try {
    // Auth before body parsing — see the note in ../import/route.ts.
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parsed = bulkDeleteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    // The userId predicate is what makes this safe: ids come from the client and
    // are never checked for ownership individually.
    const deleted = await db
      .delete(transactions)
      .where(
        and(
          inArray(transactions.id, parsed.data.ids),
          eq(transactions.userId, session.user.id)
        )
      )
      .returning({ id: transactions.id });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');

    // Actual rows removed, not ids requested — the two differ whenever the
    // client sends an id the user doesn't own.
    return NextResponse.json({ success: true, count: deleted.length });
  } catch (error: unknown) {
    console.error('Error bulk deleting transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk delete transactions' },
      { status: 500 }
    );
  }
}
