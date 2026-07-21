import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

import { goalSchema, iconColorMap } from '@/lib/validations/goal';

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
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save goal' },
      { status: 500 }
    );
  }
}
