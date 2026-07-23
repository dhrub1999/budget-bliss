import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and, or, isNull, desc } from 'drizzle-orm';
import { updateAccountSchema } from '@/lib/validations/account';
import { getAccountBalance } from '@/lib/accounts/balances';

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
    const userId = session.user.id;

    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Include legacy null-accountId transactions when this is the default Cash account.
    const accountFilter =
      account.isDefault && account.type === 'CASH'
        ? or(eq(transactions.accountId, id), isNull(transactions.accountId))
        : eq(transactions.accountId, id);

    const accountTxns = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), accountFilter))
      .orderBy(desc(transactions.date));

    const balance = await getAccountBalance(userId, id);

    return NextResponse.json({
      success: true,
      account,
      balance,
      transactions: accountTxns
    });
  } catch (error: any) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch account' },
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
    const parsed = updateAccountSchema.safeParse(rawData);
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
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    const data = parsed.data;

    await db.transaction(async (tx) => {
      if (data.isDefault) {
        await tx
          .update(accounts)
          .set({ isDefault: false })
          .where(eq(accounts.userId, userId));
      }
      await tx
        .update(accounts)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/accounts');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update account' },
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
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Never delete/archive the default Cash account — legacy transactions rely on it.
    if (existing.isDefault && existing.type === 'CASH') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the default Cash account' },
        { status: 409 }
      );
    }

    const linked = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.accountId, id))
      );

    let archived = false;
    if (linked.length > 0) {
      // Soft-archive to preserve transaction history / debt.
      await db
        .update(accounts)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
      archived = true;
    } else {
      await db
        .delete(accounts)
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    }

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/accounts');
    return NextResponse.json({ success: true, archived });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
