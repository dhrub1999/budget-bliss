import { z } from 'zod';

export const budgetPeriodEnum = z.enum(['MONTHLY', 'YEARLY']);

export const budgetSchema = z.object({
  category: z.string().min(1, { message: 'Category is required' }),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive({ message: 'Budget amount must be a positive number' }),
  period: budgetPeriodEnum.default('MONTHLY')
});

export type BudgetSchemaInput = z.input<typeof budgetSchema>;
export type BudgetSchemaOutput = z.output<typeof budgetSchema>;
