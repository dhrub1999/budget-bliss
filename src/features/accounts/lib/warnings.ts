import type { AccountOption } from '@/features/accounts/types';
import {
  CASH_WARN,
  UTIL_WARN,
  WALLET_CAP
} from '@/features/accounts/constants';

export interface TransactionWarning {
  id: 'card-util' | 'cash-large' | 'wallet-cap' | 'below-min';
  severity: 'warn' | 'confirm';
  title: string;
  body: string;
  action?: { label: string; kind: 'enable-split' };
}

export interface WarningInput {
  type: 'credit' | 'debit';
  amount: number;
  destinationAccountId?: string;
  goalId?: string;
  splitEnabled?: boolean;
  sourceAccountId?: string;
  allocations?: { accountId: string; amount: number }[];
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Per-account amounts for an expense (single source or split). */
function expenseAllocations(input: WarningInput) {
  if (input.splitEnabled && input.allocations?.length) {
    return input.allocations.filter((a) => a.accountId && a.amount > 0);
  }
  if (input.sourceAccountId) {
    return [{ accountId: input.sourceAccountId, amount: input.amount }];
  }
  return [];
}

/**
 * Pure, client-side pre-submit checks. Non-blocking — the caller shows these in
 * a confirm dialog and lets the user proceed (override:true).
 */
export function computeTransactionWarnings(
  input: WarningInput,
  accounts: AccountOption[]
): TransactionWarning[] {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const warnings: TransactionWarning[] = [];

  if (input.type === 'debit') {
    for (const alloc of expenseAllocations(input)) {
      const acc = byId.get(alloc.accountId);
      if (!acc) continue;

      // (a) Credit-card utilization
      if (
        acc.type === 'CREDIT_CARD' &&
        acc.creditLimit &&
        acc.creditLimit > 0
      ) {
        const projectedOwed = (acc.owed ?? 0) + alloc.amount;
        const pct = projectedOwed / acc.creditLimit;
        if (pct >= UTIL_WARN) {
          warnings.push({
            id: 'card-util',
            severity: 'warn',
            title: 'High credit utilization',
            body: `This will push ${acc.name} to ${Math.round(pct * 100)}% utilization. Staying under 30% is best for your credit score.`
          });
        }
      }

      // (d) Savings below minimum balance
      if (acc.type === 'SAVINGS') {
        const after = acc.balance - alloc.amount;
        const min = acc.minimumBalance ?? 0;
        if (after < min) {
          warnings.push({
            id: 'below-min',
            severity: 'warn',
            title: 'Below minimum balance',
            body: `Paying ${inr(alloc.amount)} from ${acc.name} leaves ${inr(after)}, under its ${inr(min)} minimum — banks may charge a penalty.`,
            action: input.splitEnabled
              ? undefined
              : { label: 'Split this payment instead', kind: 'enable-split' }
          });
        }
      }
    }
  } else {
    // income
    const acc = input.destinationAccountId
      ? byId.get(input.destinationAccountId)
      : undefined;
    if (acc) {
      // (b) Large cash
      if (acc.type === 'CASH' && input.amount > CASH_WARN) {
        warnings.push({
          id: 'cash-large',
          severity: 'confirm',
          title: "That's a lot of cash to hold",
          body: `Keeping ${inr(input.amount)} in physical cash is risky and earns nothing. Consider a bank or digital wallet instead.`
        });
      }
      // (c) Wallet cap
      if (acc.type === 'WALLET') {
        const cap = acc.maxBalance ?? WALLET_CAP;
        const projected = acc.balance + input.amount;
        if (projected > cap) {
          warnings.push({
            id: 'wallet-cap',
            severity: 'warn',
            title: 'Wallet limit reached',
            body: `${acc.name} can hold up to ${inr(cap)}. This takes it to ${inr(projected)}. Move the excess to a bank account?`
          });
        }
      }
    }
  }

  return warnings;
}
