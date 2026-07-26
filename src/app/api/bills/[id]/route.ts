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
  } catch (error: unknown) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { id } = await params;
    const parsed = updateBillSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

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

    // Spreading the parsed payload is safe *only* because Zod strips unknown
    // keys and `updateBillSchema` declares no `userId`/`id`/`createdAt`. Adding
    // any of those to that schema would turn this into a userId-overwrite.
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
  } catch (error: unknown) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bill' },
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
  } catch (error: unknown) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
}
