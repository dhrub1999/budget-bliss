import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals, transactions } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { updateGoalSchema, iconColorMap } from '@/lib/validations/goal';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const parsed = updateGoalSchema.safeParse(await request.json());
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
  } catch (error: unknown) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update goal' },
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

    // There are no foreign keys anywhere in this schema, so nothing cascades.
    // Leaving transactions pointing at a deleted goal is not cosmetic: every
    // later edit/delete of one of those rows tries to reverse an earmark against
    // a goal that no longer exists, and the reversal is swallowed by a bare
    // `catch {}` in transactions/[id], so the failure is permanently silent.
    // Clear the reference in the same transaction as the delete.
    const [deleted] = await db.transaction(async (tx) => {
      await tx
        .update(transactions)
        .set({ goalId: null })
        .where(
          and(eq(transactions.goalId, id), eq(transactions.userId, userId))
        );

      return tx
        .delete(goals)
        .where(and(eq(goals.id, id), eq(goals.userId, userId)))
        .returning({ id: goals.id });
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
