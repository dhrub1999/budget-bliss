import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { accountSchema } from '@/lib/validations/account';
import { getAccountsSnapshot } from '@/lib/accounts/balances';

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const snapshot = await getAccountsSnapshot(session.user.id);
    return NextResponse.json({
      success: true,
      accounts: snapshot.accounts,
      totals: snapshot.totals
    });
  } catch (error: unknown) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const parsed = accountSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // For a credit card, openingBalance carries the initial outstanding (owed);
    // wallets default to the RBI cap unless overridden.
    const openingBalance =
      data.type === 'CREDIT_CARD'
        ? (data.currentOutstanding ?? 0)
        : (data.openingBalance ?? 0);
    const maxBalance =
      data.type === 'WALLET' ? (data.maxBalance ?? 200000) : null;

    await db.transaction(async (tx) => {
      if (data.isDefault) {
        await tx
          .update(accounts)
          .set({ isDefault: false })
          .where(eq(accounts.userId, userId));
      }

      await tx.insert(accounts).values({
        type: data.type,
        name: data.name,
        provider: data.provider ?? null,
        openingBalance,
        creditLimit:
          data.type === 'CREDIT_CARD' ? (data.creditLimit ?? null) : null,
        minimumBalance:
          data.type === 'SAVINGS' ? (data.minimumBalance ?? 0) : null,
        maxBalance,
        last4: data.last4 ?? null,
        cardHolder: data.cardHolder ?? null,
        validThru: data.validThru ?? null,
        brand: data.brand ?? null,
        gradient: data.gradient ?? null,
        isDefault: data.isDefault ?? false,
        userId
      });
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/accounts');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save account' },
      { status: 500 }
    );
  }
}
