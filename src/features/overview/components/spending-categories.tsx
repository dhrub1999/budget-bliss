'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ChevronRight, PieChart } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  dbBudgets?: Array<{
    id: string;
    category: string;
    amount: number;
    period: string;
    userId: string;
  }>;
}

const DEFAULT_BUDGET_CATEGORIES: TransactionCategory[] = [
  'Groceries',
  'Dining Out',
  'Subscriptions',
  'Bills'
];

export function SpendingCategories({
  dbTransactions = [],
  dbBudgets = []
}: SpendingCategoriesProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const computedCategories = React.useMemo(() => {
    const categoriesMap: Record<
      string,
      {
        category: string;
        amount: number;
        color: string;
        icon: string;
        isBudget: boolean;
      }
    > = {};

    // 1. Identify categories set in the user's budget (excluding 'TOTAL')
    const setBudgetCategories = dbBudgets
      .filter((b) => b.category && b.category !== 'TOTAL')
      .map((b) => b.category);

    // Categories to prioritize: set budget categories first, padded by defaults if < 4
    const initialCategories = [...setBudgetCategories];
    for (const defaultCat of DEFAULT_BUDGET_CATEGORIES) {
      if (!initialCategories.includes(defaultCat)) {
        initialCategories.push(defaultCat);
      }
    }

    // Initialize map with top budget categories (ensuring even 0 spending categories exist)
    initialCategories.slice(0, 4).forEach((cat) => {
      const config = categoryConfig[cat as TransactionCategory] || {
        color: '#94a3b8',
        icon: 'package'
      };
      categoriesMap[cat] = {
        category: cat,
        amount: 0,
        color: config.color,
        icon: config.icon,
        isBudget: setBudgetCategories.includes(cat)
      };
    });

    // 2. Aggregate spending from expenses in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    dbTransactions.forEach((dt) => {
      if (dt.type === 'EXPENSE') {
        const txnDate = new Date(dt.date);
        if (txnDate >= thirtyDaysAgo) {
          const cat = dt.category;
          const config = categoryConfig[cat as TransactionCategory] || {
            color: '#94a3b8',
            icon: 'package'
          };

          if (categoriesMap[cat]) {
            categoriesMap[cat].amount += dt.amount;
          } else {
            categoriesMap[cat] = {
              category: cat,
              amount: dt.amount,
              color: config.color,
              icon: config.icon,
              isBudget: setBudgetCategories.includes(cat)
            };
          }
        }
      }
    });

    // Sort: highest spent first; if equal amount, prioritize set budget categories
    const sorted = Object.values(categoriesMap).sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      return (b.isBudget ? 1 : 0) - (a.isBudget ? 1 : 0);
    });

    // Enforce default display max 3-4 categories (max 4)
    return sorted.slice(0, 4);
  }, [dbTransactions, dbBudgets]);

  const computedTotalSpent = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return dbTransactions.reduce((sum, dt) => {
      if (dt.type === 'EXPENSE' && new Date(dt.date) >= thirtyDaysAgo) {
        return sum + dt.amount;
      }
      return sum;
    }, 0);
  }, [dbTransactions]);

  const maxAmount = Math.max(...computedCategories.map((c) => c.amount), 1);

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6'>
          <AlertTriangle className='h-10 w-10 text-red-500' />
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
    <Card className='bg-card flex h-full flex-col justify-between'>
      <div>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <CardTitle className='text-lg font-semibold'>
                Spending Categories
              </CardTitle>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                Budget limits &amp; last 30 days spend
              </p>
            </div>
            <div className='shrink-0 text-right'>
              <p className='text-muted-foreground text-xs'>Total Spent</p>
              <p className='text-foreground text-lg font-bold'>
                {formatINRFull(computedTotalSpent)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='px-4 pb-2'>
          {!isClient ? (
            <div className='space-y-3'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <div className='bg-muted h-4 w-20 animate-pulse rounded' />
                  <div
                    className='bg-muted h-7 animate-pulse rounded-md'
                    style={{ width: `${40 + i * 10}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-2.5'>
              {computedCategories.map((cat) => {
                const pct = (cat.amount / maxAmount) * 100;
                return (
                  <div key={cat.category} className='flex items-center gap-2'>
                    <span className='text-foreground flex w-28 shrink-0 items-center gap-1.5 truncate text-xs font-medium'>
                      <DynamicIcon
                        emoji={cat.icon}
                        className='h-3.5 w-3.5 shrink-0'
                        style={{ color: cat.color }}
                      />
                      <span className='truncate'>{cat.category}</span>
                    </span>
                    <div className='bg-muted/30 relative flex h-7 flex-1 items-center overflow-hidden rounded-md'>
                      {pct > 0 && (
                        <div
                          className='absolute left-0 h-full rounded-md transition-all duration-700 ease-out'
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            backgroundColor: cat.color,
                            opacity: 0.85
                          }}
                        />
                      )}
                      <span
                        className={cn(
                          'relative ml-2 text-xs font-semibold',
                          pct > 25 ? 'text-white' : 'text-zinc-300'
                        )}
                      >
                        {formatINRFull(cat.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </div>

      {/* CTA section redirecting to budgeting page */}
      <div className='p-4 pt-2'>
        <Button
          asChild
          variant='outline'
          className='h-9 w-full cursor-pointer justify-between border-zinc-800/80 bg-zinc-900/60 text-xs text-zinc-300 transition-colors hover:bg-zinc-800/80 hover:text-white'
        >
          <Link href='/dashboard/budgeting'>
            <span className='flex items-center gap-1.5 font-medium'>
              <PieChart className='h-3.5 w-3.5 text-emerald-400' />
              Manage Budgeting &amp; Limits
            </span>
            <ChevronRight className='h-3.5 w-3.5 text-zinc-400' />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
