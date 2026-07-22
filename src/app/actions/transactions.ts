'use server';

import { db } from '@/db';
import { transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, inArray, and } from 'drizzle-orm';
import { transactionSchema } from '@/lib/validations/transaction';

export async function createTransactionAction(rawData: unknown) {
  try {
    const parsed = transactionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'Validation failed'
      };
    }

    const data = parsed.data;
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
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
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    return { success: true };
  } catch (error: any) {
    console.error('Error in createTransactionAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to save transaction'
    };
  }
}

export async function updateTransactionAction(id: string, rawData: unknown) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = transactionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'Validation failed'
      };
    }

    const data = parsed.data;
    const formattedDate = data.date;
    const description = `${data.account}${data.notes ? ': ' + data.notes : ''}`;

    await db
      .update(transactions)
      .set({
        amount: data.amount,
        type: data.type === 'credit' ? 'INCOME' : 'EXPENSE',
        category: data.category,
        description,
        date: formattedDate
      })
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, session.user.id))
      );

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateTransactionAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to update transaction'
    };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(transactions)
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, session.user.id))
      );

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteTransactionAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete transaction'
    };
  }
}

export async function deleteBulkTransactionsAction(ids: string[]) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!ids || ids.length === 0) {
      return { success: true };
    }

    await db
      .delete(transactions)
      .where(
        and(
          inArray(transactions.id, ids),
          eq(transactions.userId, session.user.id)
        )
      );

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteBulkTransactionsAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete transactions'
    };
  }
}

export async function importTransactionsBulkAction(
  items: Array<{
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    date: string | Date;
  }>
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'No items provided' };
    }

    const rowsToInsert = items.map((item) => ({
      amount: Math.abs(item.amount),
      type: item.type,
      category: item.category || (item.type === 'INCOME' ? 'Others' : 'Others'),
      description: item.description || 'Imported Transaction',
      date: new Date(item.date),
      userId: session.user.id
    }));

    await db.insert(transactions).values(rowsToInsert);

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/budgeting');
    return { success: true, count: rowsToInsert.length };
  } catch (error: any) {
    console.error('Error in importTransactionsBulkAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to import transactions'
    };
  }
}
