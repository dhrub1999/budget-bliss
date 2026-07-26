import { z } from 'zod';
import { money } from './transaction';

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

/**
 * An emptied `<input type="number">` submits `''`, which `z.coerce.number()` turns into
 * `0` — tripping `.positive()` on fields the user never touched. Since the form keeps
 * every type's fields in one flat object, a blank credit limit would otherwise fail
 * validation even when a Savings account is being created. Treat blank as absent.
 *
 * Only `''` is remapped — `null` stays meaningful, since PATCH payloads send it
 * explicitly to clear a column.
 */
const blankToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema);

export const accountSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    type: z.enum(accountTypes),
    provider: z.string().optional(),
    openingBalance: blankToUndefined(
      money({ invalid_type_error: 'Balance must be a number' })
        .nonnegative({ message: 'Balance cannot be negative' })
        .optional()
    ),

    // SAVINGS
    minimumBalance: blankToUndefined(
      money({ invalid_type_error: 'Minimum balance must be a number' })
        .nonnegative({ message: 'Minimum balance cannot be negative' })
        .optional()
    ),

    // CREDIT_CARD
    creditLimit: blankToUndefined(
      money({ invalid_type_error: 'Credit limit must be a number' })
        .positive({ message: 'Credit limit must be positive' })
        .optional()
    ),
    /** Existing outstanding balance when adding a card (seeds owed via an opening EXPENSE). */
    currentOutstanding: blankToUndefined(
      money({ invalid_type_error: 'Outstanding must be a number' })
        .nonnegative({ message: 'Outstanding cannot be negative' })
        .optional()
    ),
    last4: z.string().optional(),
    cardHolder: z.string().optional(),
    validThru: z.string().optional(),
    brand: z.enum(cardBrands).optional(),
    gradient: z.string().optional(),

    // WALLET
    maxBalance: blankToUndefined(money().positive().optional()),

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
    // `.nonnegative()` is not optional polish here: the create path above refuses
    // a negative opening balance, and without the same rule a PATCH could set one
    // and drive net worth arbitrarily negative.
    openingBalance: blankToUndefined(
      money({ invalid_type_error: 'Balance must be a number' })
        .nonnegative({ message: 'Balance cannot be negative' })
        .optional()
    ),
    minimumBalance: blankToUndefined(
      money().nonnegative().nullable().optional()
    ),
    creditLimit: blankToUndefined(money().positive().nullable().optional()),
    last4: z.string().nullable().optional(),
    cardHolder: z.string().nullable().optional(),
    validThru: z.string().nullable().optional(),
    brand: z.enum(cardBrands).nullable().optional(),
    gradient: z.string().nullable().optional(),
    maxBalance: blankToUndefined(money().positive().nullable().optional()),
    isDefault: z.boolean().optional(),
    isArchived: z.boolean().optional()
  })
  .partial();

export type AccountSchemaInput = z.input<typeof accountSchema>;
export type AccountSchemaOutput = z.output<typeof accountSchema>;
export type UpdateAccountSchemaInput = z.input<typeof updateAccountSchema>;
