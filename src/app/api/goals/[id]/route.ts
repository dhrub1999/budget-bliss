import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { updateGoalSchema, iconColorMap } from '@/lib/validations/goal';

export async function PUT(
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

    const parsed = updateGoalSchema.safeParse(rawData);
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

    const updatedColor = data.icon
      ? iconColorMap[data.icon] || existingGoal.color
      : existingGoal.color;
    const updatedTarget =
      data.targetAmount !== undefined
        ? data.targetAmount
        : existingGoal.targetAmount;
    const updatedSaved =
      data.savedAmount !== undefined
        ? data.savedAmount
        : existingGoal.savedAmount;

    let isCompleted =
      data.isCompleted !== undefined
        ? data.isCompleted
        : existingGoal.isCompleted;
    if (data.savedAmount !== undefined || data.targetAmount !== undefined) {
      isCompleted = updatedSaved >= updatedTarget;
    }

    const completedAt = isCompleted
      ? existingGoal.completedAt || new Date()
      : null;

    await db
      .update(goals)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.targetAmount !== undefined && {
          targetAmount: data.targetAmount
        }),
        ...(data.savedAmount !== undefined && {
          savedAmount: data.savedAmount
        }),
        ...(data.icon && { icon: data.icon, color: updatedColor }),
        ...(data.deadline && { deadline: data.deadline }),
        isCompleted,
        completedAt
      })
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update goal' },
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

    await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
