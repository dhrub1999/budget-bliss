import { delay } from '@/constants/mock-api';
import { GoalsSavings } from '@/features/overview/components/goals-savings';

export default async function PieStats() {
  await delay(900);
  return <GoalsSavings />;
}
