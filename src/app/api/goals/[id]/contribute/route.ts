import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { contributeGoalSchema } from '@/lib/validations/goal';
import { applyGoalContribution } from '@/lib/goals/contribute';

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

    let result;
    try {
      result = await db.transaction((tx) =>
        applyGoalContribution(tx, session.user.id, id, amount)
      );
    } catch (err: any) {
      if (err?.message === 'Goal not found') {
        return NextResponse.json(
          { success: false, error: 'Goal not found' },
          { status: 404 }
        );
      }
      throw err;
    }

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({
      success: true,
      savedAmount: result.savedAmount,
      isCompleted: result.isCompleted
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
