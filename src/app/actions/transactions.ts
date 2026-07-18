'use server';

import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

import { transactionSchema } from '@/lib/validations/transaction';

export async function createTransactionAction(rawData: unknown) {
  try {
    console.log('createTransactionAction called on server with:', rawData);

    const parsed = transactionSchema.safeParse(rawData);
    if (!parsed.success) {
      console.log(
        'createTransactionAction validation failed:',
        parsed.error.format()
      );
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'Validation failed'
      };
    }

    const data = parsed.data;
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      console.log(
        'createTransactionAction: Unauthorized session access attempt.'
      );
      return { success: false, error: 'Unauthorized' };
    }

    const formattedDate = data.date;
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
    return { success: true };
  } catch (error: any) {
    console.error('Error in createTransactionAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to save transaction'
    };
  }
}
