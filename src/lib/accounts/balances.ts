import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import type { Account, Transaction } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type AccountType = 'SAVINGS' | 'CREDIT_CARD' | 'WALLET' | 'CASH';

/** Regulatory cap for a digital wallet (RBI): ₹2,00,000. */
export const WALLET_CAP = 200000;

export interface AccountBalance {
  account: Account;
  type: AccountType;
  /** Asset accounts (SAVINGS/WALLET/CASH): opening + ΣINCOME − ΣEXPENSE. Undefined for cards. */
  balance?: number;
  /** CREDIT_CARD: ΣEXPENSE − ΣINCOME(repayments), clamped ≥ 0. */
  owed?: number;
  /** CREDIT_CARD: creditLimit − owed. */
  availableCredit?: number;
  /** CREDIT_CARD: owed / creditLimit (0..1); 0 when no limit set. */
  utilization?: number;
  /** SAVINGS: balance − minimumBalance. */
  spendableAboveMinimum?: number;
  txnCount: number;
}

export interface PortfolioTotals {
  /** Σ asset balances (SAVINGS + WALLET + CASH). */
  totalAssets: number;
  /** Σ credit-card owed. */
  totalCardDebt: number;
  /** totalAssets − totalCardDebt. */
  netWorth: number;
}

export interface AccountsSnapshot {
  accounts: AccountBalance[];
  totals: PortfolioTotals;
  defaultCashAccountId: string | null;
}

/**
 * Pure computation — no DB. Derives balances for every account from the raw
 * transaction rows. Transactions with a null accountId fold into the user's
 * default Cash account (so legacy rows need no backfill).
 */
export function computeAccountsSnapshot(
  accountRows: Account[],
  txnRows: Transaction[]
): AccountsSnapshot {
  const defaultCash =
    accountRows.find((a) => a.type === 'CASH' && a.isDefault) ??
    accountRows.find((a) => a.type === 'CASH') ??
    null;
  const defaultCashAccountId = defaultCash?.id ?? null;

  // Bucket signed transaction flows per account id.
  const income = new Map<string, number>();
  const expense = new Map<string, number>();
  const count = new Map<string, number>();

  for (const t of txnRows) {
    const key = t.accountId ?? defaultCashAccountId;
    if (!key) continue; // no account to attribute to (no accounts at all)
    if (t.type === 'INCOME') {
      income.set(key, (income.get(key) ?? 0) + t.amount);
    } else {
      expense.set(key, (expense.get(key) ?? 0) + t.amount);
    }
    count.set(key, (count.get(key) ?? 0) + 1);
  }

  const balances: AccountBalance[] = accountRows.map((account) => {
    const type = account.type as AccountType;
    const inc = income.get(account.id) ?? 0;
    const exp = expense.get(account.id) ?? 0;
    const txnCount = count.get(account.id) ?? 0;

    if (type === 'CREDIT_CARD') {
      // openingBalance doubles as the card's initial outstanding (owed at creation).
      const owed = Math.max(0, (account.openingBalance ?? 0) + exp - inc);
      const limit = account.creditLimit ?? 0;
      const availableCredit = limit - owed;
      const utilization = limit > 0 ? owed / limit : 0;
      return { account, type, owed, availableCredit, utilization, txnCount };
    }

    // Asset accounts: SAVINGS / WALLET / CASH
    const balance = (account.openingBalance ?? 0) + inc - exp;
    const result: AccountBalance = { account, type, balance, txnCount };
    if (type === 'SAVINGS') {
      result.spendableAboveMinimum = balance - (account.minimumBalance ?? 0);
    }
    return result;
  });

  let totalAssets = 0;
  let totalCardDebt = 0;
  for (const b of balances) {
    if (b.type === 'CREDIT_CARD') {
      // Archived cards with outstanding debt still count; the debt is real.
      totalCardDebt += b.owed ?? 0;
    } else {
      // Exclude archived zero-balance assets; include everything else.
      if (b.account.isArchived && (b.balance ?? 0) === 0) continue;
      totalAssets += b.balance ?? 0;
    }
  }

  return {
    accounts: balances,
    totals: {
      totalAssets,
      totalCardDebt,
      netWorth: totalAssets - totalCardDebt
    },
    defaultCashAccountId
  };
}

/**
 * Ensures the user has a default Cash account, creating one lazily if none
 * exists. Returns the full set of account rows. Guards against a race on the
 * first concurrent request by re-checking inside a transaction.
 */
export async function ensureAccounts(userId: string): Promise<Account[]> {
  const existing = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (existing.length > 0) return existing;

  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (rows.length > 0) return rows;

    await tx.insert(accounts).values({
      type: 'CASH',
      name: 'Cash',
      openingBalance: 0,
      isDefault: true,
      userId
    });

    return tx.select().from(accounts).where(eq(accounts.userId, userId));
  });
}

/** Loads accounts (lazy-creating Cash) + transactions and computes the snapshot. */
export async function getAccountsSnapshot(
  userId: string
): Promise<AccountsSnapshot> {
  const accountRows = await ensureAccounts(userId);
  const txnRows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  return computeAccountsSnapshot(accountRows, txnRows);
}

/** Convenience: the computed balance for a single account (or null if missing). */
export async function getAccountBalance(
  userId: string,
  accountId: string
): Promise<AccountBalance | null> {
  const snapshot = await getAccountsSnapshot(userId);
  return snapshot.accounts.find((a) => a.account.id === accountId) ?? null;
}
