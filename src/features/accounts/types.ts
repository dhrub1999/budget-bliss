import type { AccountType } from '@/lib/accounts/balances';

/** Flat, client-friendly view of an account with its derived balance. */
export interface AccountOption {
  id: string;
  name: string;
  type: AccountType;
  provider?: string | null;
  /** Asset accounts: current balance. Cards: 0 (use owed/available). */
  balance: number;
  /** Spendable now: asset balance, or a card's available credit. */
  available: number;
  /** Savings: balance − minimumBalance. Others: same as available. */
  spendableAboveMin: number;
  minimumBalance?: number | null;
  creditLimit?: number | null;
  maxBalance?: number | null;
  owed?: number | null;
  /** Card utilization 0..1. */
  utilization?: number | null;
  isDefault: boolean;
  isArchived: boolean;
  // cosmetic (cards)
  last4?: string | null;
  cardHolder?: string | null;
  validThru?: string | null;
  brand?: string | null;
  gradient?: string | null;
}

export interface PortfolioTotals {
  totalAssets: number;
  totalCardDebt: number;
  netWorth: number;
}

export interface AccountsData {
  accounts: AccountOption[];
  portfolio: PortfolioTotals;
}
