import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bills } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import type { Recurrence } from '@/lib/validations/bill';
import { rollForwardPast } from '@/features/bills/lib/recurrence';
import { todayDueDateString } from '@/features/bills/lib/date';

/**
 * Settles a bill.
 *
 * Deliberately does NOT create the transaction. The client posts to
 * /api/transactions through the existing transaction dialog first — that route
 * already owns account-ownership checks, split allocations, goal contributions
 * and budget alerts — then calls this on success. Duplicating that logic here
 * would fork ~100 lines of money handling.
 *
 * Recurring bills roll their due date to the next cycle; one-offs archive.
 */
export async function POST(
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

    const [bill] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const recurrence = bill.recurrence as Recurrence;

    // Skip past any cycles that were never marked paid, so a bill ignored since
    // March doesn't still read as overdue in July after a single roll.
    const nextDue = rollForwardPast(
      bill.dueDate,
      recurrence,
      bill.dueDay,
      todayDueDateString(now)
    );

    if (nextDue) {
      await db
        .update(bills)
        .set({ dueDate: nextDue, lastPaidAt: now, updatedAt: now })
        .where(and(eq(bills.id, id), eq(bills.userId, userId)));
    } else {
      await db
        .update(bills)
        .set({ isArchived: true, lastPaidAt: now, updatedAt: now })
        .where(and(eq(bills.id, id), eq(bills.userId, userId)));
    }

    revalidatePath('/dashboard/bills');
    revalidatePath('/dashboard/overview');
    return NextResponse.json({
      success: true,
      archived: !nextDue,
      /** Calendar day, `yyyy-MM-dd`. */
      nextDueDate: nextDue
    });
  } catch (error: any) {
    console.error('Error marking bill paid:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark bill paid' },
      { status: 500 }
    );
  }
}
