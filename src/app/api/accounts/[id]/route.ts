import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and, or, ne, isNull, desc } from 'drizzle-orm';
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
  } catch (error: unknown) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth first: returning the 400 before the 401 let an unauthenticated caller
    // map the whole validation schema from the error messages.
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { id } = await params;
    const parsed = updateAccountSchema.safeParse(await request.json());
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
      // Spreading the parsed payload is safe *only* because Zod strips unknown
      // keys and `updateAccountSchema` declares no `userId`/`id`/`createdAt`.
      // Adding any of those to that schema would turn this line into a
      // userId-overwrite — i.e. handing one user's account to another.
      await tx
        .update(accounts)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/accounts');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update account' },
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

    const linked = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.accountId, id))
      );

    let archived = false;
    if (linked.length > 0) {
      // Soft-archive to preserve transaction history / debt. Safe even for the
      // last Cash account: the null-accountId fallback in
      // computeAccountsSnapshot does not filter archived rows.
      await db
        .update(accounts)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
      archived = true;
    } else {
      // Hard delete. The invariant to protect is that *a* Cash row survives —
      // not that the `isDefault` flag is set on one.
      // `computeAccountsSnapshot` attributes every transaction with a null
      // accountId to `CASH && isDefault` or, failing that, to any CASH row
      // (lib/accounts/balances.ts:51-54); with no CASH row at all it hits
      // `if (!key) continue` and those rows vanish from every balance and total
      // while still existing in the table.
      //
      // Guarding on `isDefault` was bypassable in two calls: PATCH
      // {"isDefault":true} on any other account cleared the flag from Cash, and
      // this delete then went through. Note `linked` only counts transactions
      // pointing *at* this id, so the rows most at risk — the legacy
      // null-accountId ones — never showed up here at all.
      if (existing.type === 'CASH') {
        const [otherCash] = await db
          .select({ id: accounts.id })
          .from(accounts)
          .where(
            and(
              eq(accounts.userId, userId),
              eq(accounts.type, 'CASH'),
              ne(accounts.id, id)
            )
          )
          .limit(1);

        if (!otherCash) {
          return NextResponse.json(
            {
              success: false,
              error: 'Cannot delete your only Cash account'
            },
            { status: 409 }
          );
        }
      }

      await db
        .delete(accounts)
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    }

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/accounts');
    return NextResponse.json({ success: true, archived });
  } catch (error: unknown) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
