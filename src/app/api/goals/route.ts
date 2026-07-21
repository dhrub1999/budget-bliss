import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';

import { goalSchema, iconColorMap } from '@/lib/validations/goal';

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .orderBy(desc(goals.createdAt));

    return NextResponse.json({ success: true, goals: userGoals });
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    console.log('POST /api/goals called with:', rawData);

    const parsed = goalSchema.safeParse(rawData);
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

    // Auto-assign a pastel color based on the selected icon
    const color = iconColorMap[data.icon] || '#BAE1FF';
    const isCompleted = data.savedAmount >= data.targetAmount;

    await db.insert(goals).values({
      name: data.name,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount,
      icon: data.icon,
      color,
      deadline: data.deadline,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
      userId: session.user.id
    });

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save goal' },
      { status: 500 }
    );
  }
}
