import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { budgets } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { eq, and, desc } from 'drizzle-orm';
import { budgetSchema } from '@/lib/validations/budget';

export async function GET(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'MONTHLY';

    const userBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(eq(budgets.userId, session.user.id), eq(budgets.period, period))
      )
      .orderBy(desc(budgets.createdAt));

    return NextResponse.json({ success: true, budgets: userBudgets });
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parsed = budgetSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    const { category, amount, period } = parsed.data;

    // Check if user already has a budget for this category and period
    const existing = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, session.user.id),
          eq(budgets.category, category),
          eq(budgets.period, period)
        )
      );

    if (existing.length > 0) {
      // Update existing budget
      await db
        .update(budgets)
        .set({
          amount,
          updatedAt: new Date()
        })
        .where(eq(budgets.id, existing[0].id));
    } else {
      // Create new budget
      await db.insert(budgets).values({
        category,
        amount,
        period,
        userId: session.user.id
      });
    }

    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/budgeting');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting budget:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set budget' },
      { status: 500 }
    );
  }
}
