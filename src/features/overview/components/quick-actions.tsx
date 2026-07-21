'use client';

import * as React from 'react';
import { TrendingUp, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from './add-transaction-dialog';
import { ViewReportDialog } from './view-report-dialog';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
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

export function QuickActions({ dbTransactions = [] }: QuickActionsProps) {
  const [incomeOpen, setIncomeOpen] = React.useState(false);
  const [expenseOpen, setExpenseOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  const actions = [
    {
      label: 'Add an Income',
      icon: Plus,
      bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      onClick: () => setIncomeOpen(true)
    },
    {
      label: 'Add an Expense',
      icon: Minus,
      bg: 'bg-rose-500/15 hover:bg-rose-500/25',
      iconBg: 'bg-rose-500',
      iconColor: 'text-white',
      onClick: () => setExpenseOpen(true)
    },
    {
      label: 'View Report',
      icon: TrendingUp,
      bg: 'bg-amber-500/15 hover:bg-amber-500/25',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      onClick: () => setReportOpen(true)
    }
  ];

  return (
    <>
      <div className='grid grid-cols-3 gap-3'>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.label}
              className={cn(
                'border-border/60 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
                action.bg
              )}
              onClick={action.onClick}
            >
              <CardContent className='flex flex-col items-center justify-center gap-2 p-4'>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm',
                    action.iconBg
                  )}
                >
                  <Icon className={cn('h-5 w-5', action.iconColor)} />
                </div>
                <span className='text-foreground text-center text-sm leading-tight font-medium'>
                  {action.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddTransactionDialog
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
        defaultType='credit'
      />
      <AddTransactionDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        defaultType='debit'
      />
      <ViewReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        dbTransactions={dbTransactions}
      />
    </>
  );
}
