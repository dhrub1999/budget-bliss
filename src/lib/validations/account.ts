import { z } from 'zod';

/** Digital-wallet regulatory cap (RBI): ₹2,00,000. Defined here to keep this
 *  client-importable module free of any server (DB) imports. */
const WALLET_CAP = 200000;

export const accountTypes = [
  'SAVINGS',
  'CREDIT_CARD',
  'WALLET',
  'CASH'
] as const;

export const walletProviders = [
  'PhonePe',
  'GPay',
  'Mobikwik',
  'Paytm'
] as const;

export const cardBrands = ['mastercard', 'visa', 'rupay', 'amex'] as const;

export const accountSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    type: z.enum(accountTypes),
    provider: z.string().optional(),
    openingBalance: z.coerce
      .number({ invalid_type_error: 'Balance must be a number' })
      .nonnegative({ message: 'Balance cannot be negative' })
      .optional(),

    // SAVINGS
    minimumBalance: z.coerce
      .number({ invalid_type_error: 'Minimum balance must be a number' })
      .nonnegative({ message: 'Minimum balance cannot be negative' })
      .optional(),

    // CREDIT_CARD
    creditLimit: z.coerce
      .number({ invalid_type_error: 'Credit limit must be a number' })
      .positive({ message: 'Credit limit must be positive' })
      .optional(),
    /** Existing outstanding balance when adding a card (seeds owed via an opening EXPENSE). */
    currentOutstanding: z.coerce
      .number({ invalid_type_error: 'Outstanding must be a number' })
      .nonnegative({ message: 'Outstanding cannot be negative' })
      .optional(),
    last4: z.string().optional(),
    cardHolder: z.string().optional(),
    validThru: z.string().optional(),
    brand: z.enum(cardBrands).optional(),
    gradient: z.string().optional(),

    // WALLET
    maxBalance: z.coerce.number().positive().optional(),

    isDefault: z.boolean().optional()
  })
  .superRefine((data, ctx) => {
    if (data.type === 'CREDIT_CARD' && !data.creditLimit) {
      ctx.addIssue({
        path: ['creditLimit'],
        code: z.ZodIssueCode.custom,
        message: 'Credit limit is required for a credit card'
      });
    }
    if (data.type === 'WALLET') {
      if (!data.provider) {
        ctx.addIssue({
          path: ['provider'],
          code: z.ZodIssueCode.custom,
          message: 'Choose a wallet provider'
        });
      }
      if (data.maxBalance && data.maxBalance > WALLET_CAP) {
        ctx.addIssue({
          path: ['maxBalance'],
          code: z.ZodIssueCode.custom,
          message: `Wallet cap cannot exceed ₹${WALLET_CAP.toLocaleString('en-IN')}`
        });
      }
    }
  });

export const updateAccountSchema = z
  .object({
    name: z.string().min(1).optional(),
    provider: z.string().nullable().optional(),
    openingBalance: z.coerce.number().optional(),
    minimumBalance: z.coerce.number().nonnegative().nullable().optional(),
    creditLimit: z.coerce.number().positive().nullable().optional(),
    last4: z.string().nullable().optional(),
    cardHolder: z.string().nullable().optional(),
    validThru: z.string().nullable().optional(),
    brand: z.enum(cardBrands).nullable().optional(),
    gradient: z.string().nullable().optional(),
    maxBalance: z.coerce.number().positive().nullable().optional(),
    isDefault: z.boolean().optional(),
    isArchived: z.boolean().optional()
  })
  .partial();

export type AccountSchemaInput = z.input<typeof accountSchema>;
export type AccountSchemaOutput = z.output<typeof accountSchema>;
export type UpdateAccountSchemaInput = z.input<typeof updateAccountSchema>;
