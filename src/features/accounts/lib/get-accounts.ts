import { getAccountsSnapshot } from '@/lib/accounts/balances';
import type { AccountsData, AccountOption } from '@/features/accounts/types';

/**
 * Server helper: loads the user's accounts with derived balances and flattens
 * them into the client-friendly AccountOption shape used across the UI + form.
 * Use directly in Server Components (no client fetch waterfall).
 */
export async function getAccountsWithBalances(
  userId: string
): Promise<AccountsData> {
  const snapshot = await getAccountsSnapshot(userId);

  const accounts: AccountOption[] = snapshot.accounts.map((b) => {
    const a = b.account;
    const isCard = b.type === 'CREDIT_CARD';
    const balance = isCard ? 0 : (b.balance ?? 0);
    const available = isCard ? (b.availableCredit ?? 0) : balance;
    const spendableAboveMin =
      b.type === 'SAVINGS' ? (b.spendableAboveMinimum ?? balance) : available;

    return {
      id: a.id,
      name: a.name,
      type: b.type,
      provider: a.provider,
      balance,
      available,
      spendableAboveMin,
      minimumBalance: a.minimumBalance,
      creditLimit: a.creditLimit,
      maxBalance: a.maxBalance,
      owed: isCard ? (b.owed ?? 0) : null,
      utilization: isCard ? (b.utilization ?? 0) : null,
      isDefault: a.isDefault,
      isArchived: a.isArchived,
      last4: a.last4,
      cardHolder: a.cardHolder,
      validThru: a.validThru,
      brand: a.brand,
      gradient: a.gradient
    };
  });

  return { accounts, portfolio: snapshot.totals };
}
