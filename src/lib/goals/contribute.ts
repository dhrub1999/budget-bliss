import { db } from '@/db';
import { goals } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

/** A Drizzle transaction handle (from db.transaction callback). */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface GoalContributionResult {
  savedAmount: number;
  isCompleted: boolean;
}

/**
 * Applies a delta to a goal's savedAmount and recomputes completion state.
 * Positive delta = contribution; negative delta = reversal (on edit/delete of
 * an earmarked transaction). savedAmount is clamped at ≥ 0.
 *
 * Must run inside a db.transaction so the caller can atomically pair it with a
 * transaction insert/update. Throws if the goal is missing / not owned.
 */
export async function applyGoalContribution(
  tx: Tx,
  userId: string,
  goalId: string,
  delta: number
): Promise<GoalContributionResult> {
  const [existingGoal] = await tx
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  if (!existingGoal) {
    throw new Error('Goal not found');
  }

  const savedAmount = Math.max(0, existingGoal.savedAmount + delta);
  const isCompleted = savedAmount >= existingGoal.targetAmount;
  const completedAt = isCompleted
    ? existingGoal.completedAt || new Date()
    : null;

  await tx
    .update(goals)
    .set({ savedAmount, isCompleted, completedAt })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  return { savedAmount, isCompleted };
}
