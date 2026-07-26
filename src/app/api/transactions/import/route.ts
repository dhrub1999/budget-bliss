import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, type NewTransaction } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

import { importTransactionsSchema } from '@/lib/validations/transaction';

export async function POST(request: NextRequest) {
  try {
    // Auth before body parsing — otherwise an unauthenticated caller gets the
    // server to buffer and validate an arbitrarily large payload for free.
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parsed = importTransactionsSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issue = parsed.error.errors[0];
      // Row index is the first path segment — without it "Invalid date" is
      // useless feedback on a 500-row CSV.
      const row = typeof issue?.path[1] === 'number' ? issue.path[1] : null;
      return NextResponse.json(
        {
          success: false,
          error:
            row !== null
              ? `Row ${row + 1}: ${issue?.message ?? 'Invalid row'}`
              : (issue?.message ?? 'Validation failed')
        },
        { status: 400 }
      );
    }

    const rowsToInsert: NewTransaction[] = parsed.data.items.map((item) => ({
      amount: item.amount,
      type: item.type,
      category: item.category,
      description: item.description,
      date: item.date,
      userId: session.user.id
    }));

    await db.insert(transactions).values(rowsToInsert);

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');

    return NextResponse.json({ success: true, count: rowsToInsert.length });
  } catch (error: unknown) {
    console.error('Error importing CSV transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import transactions' },
      { status: 500 }
    );
  }
}
