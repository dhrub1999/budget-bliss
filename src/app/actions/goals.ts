'use server';

import { db } from '@/db';
import { goals } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

import { goalSchema, iconColorMap } from '@/lib/validations/goal';

export async function createGoalAction(rawData: unknown) {
  try {
    console.log('createGoalAction called on server with:', rawData);

    const parsed = goalSchema.safeParse(rawData);
    if (!parsed.success) {
      console.log('createGoalAction validation failed:', parsed.error.format());
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'Validation failed'
      };
    }

    const data = parsed.data;
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      console.log('createGoalAction: Unauthorized session access attempt.');
      return { success: false, error: 'Unauthorized' };
    }

    // Auto-assign a pastel color based on the selected icon
    const color = iconColorMap[data.icon] || '#BAE1FF';

    await db.insert(goals).values({
      name: data.name,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount,
      icon: data.icon,
      color,
      deadline: data.deadline,
      userId: session.user.id
    });

    revalidatePath('/dashboard/overview');
    return { success: true };
  } catch (error: any) {
    console.error('Error in createGoalAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to save goal'
    };
  }
}
