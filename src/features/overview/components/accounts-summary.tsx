'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, CreditCard, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatINRFull } from './overview-data';
import { ACCOUNT_TYPE_ORDER } from '@/features/accounts/constants';
import type { AccountOption, PortfolioTotals } from '@/features/accounts/types';

interface AccountsSummaryProps {
  accounts: AccountOption[];
  portfolio: PortfolioTotals;
}

export function AccountsSummary({ accounts, portfolio }: AccountsSummaryProps) {
  const visible = accounts.filter((a) => !a.isArchived);

  const tiles = [
    {
      label: 'Total Available',
      value: portfolio.totalAssets,
      icon: Wallet,
      accent: 'text-emerald-400'
    },
    {
      label: 'Net Worth',
      value: portfolio.netWorth,
      icon: TrendingUp,
      accent: portfolio.netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'
    },
    {
      label: 'Card Debt',
      value: portfolio.totalCardDebt,
      icon: CreditCard,
      accent: 'text-rose-400'
    }
  ];

  const ordered = [...visible].sort(
    (a, b) =>
      ACCOUNT_TYPE_ORDER.indexOf(a.type) - ACCOUNT_TYPE_ORDER.indexOf(b.type)
  );

  return (
    <Card className='border-zinc-800 bg-[#141416]'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
        <CardTitle className='text-lg font-semibold text-white/95'>
          Your Money
        </CardTitle>
        <Link
          href='/dashboard/accounts'
          className='flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline'
        >
          Manage accounts
          <ArrowRight className='h-3.5 w-3.5' />
        </Link>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-3 gap-2.5 sm:gap-4'>
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className='rounded-xl border border-zinc-800 bg-[#18181b] p-3'
              >
                <div className='flex items-center justify-between pb-1.5'>
                  <span className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                    {t.label}
                  </span>
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', t.accent)} />
                </div>
                <div
                  className={cn(
                    'truncate text-base font-bold sm:text-xl',
                    t.accent
                  )}
                >
                  {formatINRFull(t.value)}
                </div>
              </div>
            );
          })}
        </div>

        {ordered.length > 0 && (
          <div className='space-y-2'>
            {ordered.slice(0, 5).map((a) => {
              const isCard = a.type === 'CREDIT_CARD';
              return (
                <Link
                  key={a.id}
                  href={`/dashboard/accounts/${a.id}`}
                  className='flex items-center justify-between rounded-lg px-1 py-1 text-sm transition-colors hover:bg-zinc-800/40'
                >
                  <span className='truncate text-zinc-300'>{a.name}</span>
                  <span
                    className={cn(
                      'shrink-0 font-medium',
                      isCard ? 'text-rose-300' : 'text-zinc-200'
                    )}
                  >
                    {isCard
                      ? `${formatINRFull(a.owed ?? 0)} owed`
                      : formatINRFull(a.balance)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
