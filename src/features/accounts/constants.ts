import type { AccountType } from '@/lib/accounts/balances';

/** Warn when a card's projected utilization reaches this fraction. */
export const UTIL_WARN = 0.4;
/** Digital-wallet regulatory cap (RBI). */
export const WALLET_CAP = 200000;
/** Warn when this much (or more) is added to physical cash in one go. */
export const CASH_WARN = 10000;

/** Utilization color thresholds (fractions). */
export const UTIL_AMBER = 0.4;
export const UTIL_ROSE = 0.7;

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit Cards',
  WALLET: 'Wallets',
  CASH: 'Cash'
};

export const ACCOUNT_TYPE_SINGULAR: Record<AccountType, string> = {
  SAVINGS: 'Savings account',
  CREDIT_CARD: 'Credit card',
  WALLET: 'Wallet',
  CASH: 'Cash'
};

/** Order accounts are grouped/displayed in. */
export const ACCOUNT_TYPE_ORDER: AccountType[] = [
  'SAVINGS',
  'CREDIT_CARD',
  'WALLET',
  'CASH'
];
