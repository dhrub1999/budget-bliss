import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, bills } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { updateBillSchema } from '@/lib/validations/bill';
import { dueDayOf } from '@/features/bills/lib/date';

export async function GET(
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

    const [bill] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, session.user.id)));

    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bill });
  } catch (error: any) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawData = await request.json();
    const parsed = updateBillSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const [existing] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }

    const data = parsed.data;

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

    await db
      .update(bills)
      .set({
        ...data,
        notes:
          data.notes !== undefined ? data.notes?.trim() || null : undefined,
        accountId:
          data.accountId !== undefined ? data.accountId || null : undefined,
        // Moving the due date re-anchors the recurring day too.
        dueDay: data.dueDate ? dueDayOf(data.dueDate) : undefined,
        updatedAt: new Date()
      })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    revalidatePath('/dashboard/bills');
    revalidatePath('/dashboard/overview');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update bill' },
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

    const [existing] = await db
      .select({ id: bills.id })
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }

    // Hard delete: a bill carries no history of its own — the transactions it
    // produced are independent rows and stay untouched.
    await db
      .delete(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    revalidatePath('/dashboard/bills');
    revalidatePath('/dashboard/overview');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete bill' },
      { status: 500 }
    );
  }
}
