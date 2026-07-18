import { z } from 'zod';

export const expenseCategories = [
  'Groceries',
  'Dining Out',
  'Subscriptions',
  'Bills',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Others'
] as const;

export const incomeCategories = [
  'Salary',
  'Freelance',
  'Investment',
  'Others'
] as const;

export const expenseVendors = [
  'Swiggy',
  'Zomato',
  'Amazon',
  'Netflix',
  'Uber',
  'Ola Cabs',
  'Blinkit',
  'Big Basket',
  'Myntra',
  'Spotify',
  'Others'
] as const;

export const incomeVendors = [
  'Company Salary',
  'Freelance Client',
  'Stock Dividend',
  'Investment Return',
  'Others'
] as const;

export const transactionSchema = z
  .object({
    amount: z.coerce
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive({ message: 'Amount must be a positive number' }),
    type: z.enum(['credit', 'debit']),
    category: z.string().min(1, { message: 'Category is required' }),
    account: z.string().min(1, { message: 'Account (vendor) is required' }),
    date: z.preprocess(
      (val) => {
        if (typeof val === 'string') return new Date(val);
        if (val instanceof Date) return val;
        return val;
      },
      z.date({
        required_error: 'Date is required',
        invalid_type_error: 'Invalid date format'
      })
    ),
    notes: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.type === 'debit') {
        return expenseCategories.includes(data.category as any);
      } else {
        return incomeCategories.includes(data.category as any);
      }
    },
    {
      message: 'Invalid category for the selected transaction type',
      path: ['category']
    }
  )
  .refine(
    (data) => {
      if (data.type === 'debit') {
        return expenseVendors.includes(data.account as any);
      } else {
        return incomeVendors.includes(data.account as any);
      }
    },
    {
      message: 'Invalid account/vendor for the selected transaction type',
      path: ['account']
    }
  );

export type TransactionSchemaInput = z.input<typeof transactionSchema>;
export type TransactionSchemaOutput = z.output<typeof transactionSchema>;
