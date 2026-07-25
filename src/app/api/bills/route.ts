import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, bills } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { billSchema } from '@/lib/validations/bill';
import { dueDayOf } from '@/features/bills/lib/date';

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userBills = await db
      .select()
      .from(bills)
      .where(
        and(eq(bills.userId, session.user.id), eq(bills.isArchived, false))
      )
      .orderBy(asc(bills.dueDate));

    return NextResponse.json({ success: true, bills: userBills });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const parsed = billSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    const { name, amount, category, recurrence, dueDate, accountId, notes } =
      parsed.data;

    // accountId has no DB FK, so ownership is enforced here.
    if (accountId) {
      const [owned] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
      if (!owned) {
        return NextResponse.json(
          { success: false, error: 'Invalid account selected' },
          { status: 400 }
        );
      }
    }

    const [created] = await db
      .insert(bills)
      .values({
        name,
        amount,
        category,
        recurrence,
        dueDate,
        // Captured once so recurring rolls can re-anchor to the intended day.
        // Read off the string so no timezone can shift it.
        dueDay: dueDayOf(dueDate),
        accountId: accountId || null,
        notes: notes?.trim() || null,
        userId
      })
      .returning();

    revalidatePath('/dashboard/bills');
    revalidatePath('/dashboard/overview');
    return NextResponse.json({ success: true, bill: created });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create bill' },
      { status: 500 }
    );
  }
}
