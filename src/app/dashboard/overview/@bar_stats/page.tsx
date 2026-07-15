import { delay } from '@/constants/mock-api';
import { SpendingCategories } from '@/features/overview/components/spending-categories';

export default async function BarStats() {
  await delay(800);
  return <SpendingCategories />;
}
