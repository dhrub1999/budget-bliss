'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, CreditCard, Scale } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatINRFull } from '@/features/overview/components/overview-data';
import {
  ACCOUNT_TYPE_ORDER,
  ACCOUNT_TYPE_LABELS
} from '@/features/accounts/constants';
import type { AccountOption, PortfolioTotals } from '@/features/accounts/types';
import type { AccountType } from '@/lib/accounts/balances';
import { AccountCard } from './account-card';
import { AddEditAccountDialog } from './add-edit-account-dialog';

interface AccountsViewProps {
  accounts: AccountOption[];
  portfolio: PortfolioTotals;
}

export function AccountsView({ accounts, portfolio }: AccountsViewProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);

  const visible = React.useMemo(
    () => accounts.filter((a) => !a.isArchived),
    [accounts]
  );

  const grouped = React.useMemo(() => {
    const map: Record<AccountType, AccountOption[]> = {
      SAVINGS: [],
      CREDIT_CARD: [],
      WALLET: [],
      CASH: []
    };
    for (const a of visible) map[a.type].push(a);
    return map;
  }, [visible]);

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-4 pb-8 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl'>
              Accounts
            </h1>
            <p className='mt-0.5 text-xs text-zinc-400 sm:mt-1 sm:text-sm'>
              Manage your savings, credit cards, wallets, and cash in one place.
            </p>
          </div>

          <Button
            onClick={() => setAddOpen(true)}
            className='h-9 w-full cursor-pointer gap-1.5 bg-[#4ade80] text-xs font-semibold text-black hover:bg-[#22c55e] sm:h-10 sm:w-auto sm:text-sm'
          >
            <Plus className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
            Add Account
          </Button>
        </div>

        {/* Summary stat cards */}
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4'>
          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Total Available
              </CardTitle>
              <Wallet className='h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-emerald-400 sm:text-2xl'>
                {formatINRFull(portfolio.totalAssets)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                Across all asset accounts
              </p>
            </CardContent>
          </Card>

          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Total Card Debt
              </CardTitle>
              <CreditCard className='h-3.5 w-3.5 shrink-0 text-rose-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-rose-400 sm:text-2xl'>
                {formatINRFull(portfolio.totalCardDebt)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                Owed across credit cards
              </p>
            </CardContent>
          </Card>

          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Net Worth
              </CardTitle>
              <Scale className='h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div
                className={`truncate text-base font-bold sm:text-2xl ${
                  portfolio.netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatINRFull(portfolio.netWorth)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                Assets minus card debt
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grouped accounts */}
        {visible.length === 0 ? (
          <div className='rounded-xl border border-dashed border-zinc-800 bg-[#141416] p-10 text-center'>
            <Wallet className='mx-auto h-10 w-10 text-zinc-500' />
            <p className='mt-3 text-sm font-medium text-zinc-400'>
              No accounts yet.
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              variant='outline'
              className='mt-4 gap-1.5 border-zinc-800 bg-[#18181b] text-white hover:bg-zinc-800'
            >
              <Plus className='h-4 w-4' />
              Add your first account
            </Button>
          </div>
        ) : (
          ACCOUNT_TYPE_ORDER.map((type) => {
            const list = grouped[type];
            if (list.length === 0) return null;
            return (
              <div key={type} className='space-y-3'>
                <h2 className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                  {ACCOUNT_TYPE_LABELS[type]}
                  <span className='ml-1.5 text-zinc-600'>({list.length})</span>
                </h2>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {list.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddEditAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => router.refresh()}
      />
    </PageContainer>
  );
}
