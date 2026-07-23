'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  TransactionFormDialog,
  type GoalOption
} from '@/features/transactions/components/transaction-form-dialog';
import type { AccountOption } from '@/features/accounts/types';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultType?: 'debit' | 'credit';
  defaultAccountId?: string;
  onSuccess?: () => void;
}

/**
 * Thin wrapper kept for existing overview entry points (quick actions, recent
 * transactions, financial calendar). Self-fetches accounts + goals on open so
 * those call sites don't need to thread the data through parallel routes.
 */
export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultType,
  defaultAccountId,
  onSuccess
}: AddTransactionDialogProps) {
  const router = useRouter();
  const [accounts, setAccounts] = React.useState<AccountOption[]>([]);
  const [goals, setGoals] = React.useState<GoalOption[]>([]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [accRes, goalRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/goals')
        ]);
        const accJson = await accRes.json();
        const goalJson = await goalRes.json();
        if (cancelled) return;
        if (accJson?.success && Array.isArray(accJson.accounts)) {
          setAccounts(
            accJson.accounts.map((a: any) => ({
              id: a.account.id,
              name: a.account.name,
              type: a.type,
              provider: a.account.provider,
              balance: a.balance ?? 0,
              available:
                a.type === 'CREDIT_CARD'
                  ? (a.availableCredit ?? 0)
                  : (a.balance ?? 0),
              spendableAboveMin:
                a.type === 'SAVINGS'
                  ? (a.spendableAboveMinimum ?? a.balance ?? 0)
                  : a.type === 'CREDIT_CARD'
                    ? (a.availableCredit ?? 0)
                    : (a.balance ?? 0),
              minimumBalance: a.account.minimumBalance,
              creditLimit: a.account.creditLimit,
              maxBalance: a.account.maxBalance,
              owed: a.owed ?? null,
              utilization: a.utilization ?? null,
              isDefault: a.account.isDefault,
              isArchived: a.account.isArchived
            }))
          );
        }
        if (goalJson?.success && Array.isArray(goalJson.goals)) {
          setGoals(
            goalJson.goals
              .filter((g: any) => !g.isCompleted)
              .map((g: any) => ({
                id: g.id,
                name: g.name,
                icon: g.icon,
                color: g.color
              }))
          );
        }
      } catch {
        // fetch failed — dialog still opens with an empty-state prompt
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <TransactionFormDialog
      open={open}
      onOpenChange={onOpenChange}
      accounts={accounts}
      goals={goals}
      defaultType={defaultType}
      defaultDate={defaultDate}
      defaultAccountId={defaultAccountId}
      onSuccess={onSuccess ?? (() => router.refresh())}
    />
  );
}
