'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  categoryConfig,
  formatINRFull,
  type TransactionCategory
} from './overview-data';

interface SpendingCategoriesProps {
  dbTransactions?: Array<{
    id: string;
    amount: number;
    type: string;
    category: string;
    description: string | null;
    date: string;
    userId: string;
  }>;
}

export function SpendingCategories({
  dbTransactions = []
}: SpendingCategoriesProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const computedCategories = React.useMemo(() => {
    const categoriesMap: Record<
      string,
      { category: string; amount: number; color: string; icon: string }
    > = {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    dbTransactions.forEach((dt) => {
      if (dt.type === 'EXPENSE') {
        const txnDate = new Date(dt.date);
        if (txnDate >= thirtyDaysAgo) {
          const cat = dt.category;
          const config = categoryConfig[cat as TransactionCategory] || {
            color: '#94a3b8',
            icon: '📦'
          };

          if (categoriesMap[cat]) {
            categoriesMap[cat].amount += dt.amount;
          } else {
            categoriesMap[cat] = {
              category: cat,
              amount: dt.amount,
              color: config.color,
              icon: config.icon
            };
          }
        }
      }
    });

    return Object.values(categoriesMap).sort((a, b) => b.amount - a.amount);
  }, [dbTransactions]);

  const computedTotalSpent = React.useMemo(() => {
    return computedCategories.reduce((sum, c) => sum + c.amount, 0);
  }, [computedCategories]);

  const maxAmount = Math.max(...computedCategories.map((c) => c.amount), 1);
  const isEmpty = computedCategories.length === 0;

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6'>
          <div className='text-4xl'>⚠️</div>
          <p className='text-muted-foreground text-center text-sm'>
            Failed to load spending categories.
          </p>
          <button
            onClick={() => setHasError(false)}
            className='border-border hover:bg-muted rounded-md border px-4 py-2 text-sm transition-colors'
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-card h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-lg font-semibold'>
              Spending Categories
            </CardTitle>
            <p className='text-muted-foreground mt-0.5 text-xs'>Last 30 days</p>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground text-xs'>Total Spent</p>
            <p className='text-foreground text-lg font-bold'>
              {formatINRFull(computedTotalSpent)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        {!isClient ? (
          <div className='space-y-3'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='bg-muted h-4 w-20 animate-pulse rounded' />
                <div
                  className='bg-muted h-7 animate-pulse rounded-md'
                  style={{ width: `${40 + i * 10}%` }}
                />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className='flex h-[220px] flex-col items-center justify-center gap-2 text-center'>
            <div className='text-3xl'>📊</div>
            <p className='text-muted-foreground text-sm'>
              No spending data for the last 30 days.
            </p>
            <p className='text-muted-foreground text-xs'>
              Add transactions to see your spending breakdown.
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {computedCategories.map((cat) => {
              const pct = (cat.amount / maxAmount) * 100;
              return (
                <div key={cat.category} className='flex items-center gap-2'>
                  <span className='text-foreground w-28 shrink-0 truncate text-xs font-medium'>
                    {cat.icon} {cat.category}
                  </span>
                  <div className='relative flex h-7 flex-1 items-center'>
                    <div
                      className='absolute left-0 h-full rounded-md transition-all duration-700 ease-out'
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                        opacity: 0.85
                      }}
                    />
                    <span className='relative ml-2 text-xs font-semibold text-white mix-blend-normal'>
                      {formatINRFull(cat.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
