import { delay } from '@/constants/mock-api';
import { FinancialCalendar } from '@/features/overview/components/financial-calendar';

export default async function AreaStats() {
  await delay(600);
  return <FinancialCalendar />;
}
