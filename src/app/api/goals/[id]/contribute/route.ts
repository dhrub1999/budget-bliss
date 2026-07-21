import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { contributeGoalSchema } from '@/lib/validations/goal';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawData = await request.json();
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parsed = contributeGoalSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    const { amount } = parsed.data;

    // Fetch existing goal
    const [existingGoal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

    if (!existingGoal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    const newSavedAmount = existingGoal.savedAmount + amount;
    const isCompleted = newSavedAmount >= existingGoal.targetAmount;
    const completedAt = isCompleted
      ? existingGoal.completedAt || new Date()
      : null;

    await db
      .update(goals)
      .set({
        savedAmount: newSavedAmount,
        isCompleted,
        completedAt
      })
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({
      success: true,
      savedAmount: newSavedAmount,
      isCompleted
    });
  } catch (error: any) {
    console.error('Error contributing to goal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to contribute to goal'
      },
      { status: 500 }
    );
  }
}
