import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No transaction rows provided' },
        { status: 400 }
      );
    }

    const rowsToInsert = items.map((item: any) => ({
      amount: Math.abs(Number(item.amount) || 0),
      type: item.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      category: String(item.category || 'Others'),
      description: String(item.description || 'Imported Transaction'),
      date: new Date(item.date),
      userId: session.user.id
    }));

    await db.insert(transactions).values(rowsToInsert);

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');

    return NextResponse.json({ success: true, count: rowsToInsert.length });
  } catch (error: any) {
    console.error('Error importing CSV transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to import transactions'
      },
      { status: 500 }
    );
  }
}
