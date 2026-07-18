import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

import { transactionSchema } from '@/lib/validations/transaction';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    console.log('POST /api/transactions called with:', rawData);

    const parsed = transactionSchema.safeParse(rawData);
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

    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formattedDate = new Date(data.date);
    const description = `${data.account}${data.notes ? ': ' + data.notes : ''}`;

    await db.insert(transactions).values({
      amount: data.amount,
      type: data.type === 'credit' ? 'INCOME' : 'EXPENSE',
      category: data.category,
      description,
      date: formattedDate,
      userId: session.user.id
    });

    revalidatePath('/dashboard/overview');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save transaction' },
      { status: 500 }
    );
  }
}
