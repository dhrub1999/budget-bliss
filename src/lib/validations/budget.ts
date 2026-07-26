import { z } from 'zod';
import { money } from './transaction';

export const budgetPeriodEnum = z.enum(['MONTHLY', 'YEARLY']);

export const budgetSchema = z.object({
  category: z.string().min(1, { message: 'Category is required' }),
  amount: money().positive({
    message: 'Budget amount must be a positive number'
  }),
  period: budgetPeriodEnum.default('MONTHLY')
});

export type BudgetSchemaInput = z.input<typeof budgetSchema>;
export type BudgetSchemaOutput = z.output<typeof budgetSchema>;
