'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import { formatINRFull } from './overview-data';

interface ViewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const chartConfig = {
  income: {
    label: 'Income',
    color: '#4ade80'
  },
  expense: {
    label: 'Expense',
    color: '#f87171'
  }
} satisfies ChartConfig;

export function ViewReportDialog({
  open,
  onOpenChange,
  dbTransactions = []
}: ViewReportDialogProps) {
  const computedMonthlyFinancials = React.useMemo(() => {
    const result: Array<{
      year: number;
      monthNum: number;
      month: string;
      income: number;
      expense: number;
    }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      result.push({
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        month: label,
        income: 0,
        expense: 0
      });
    }

    dbTransactions.forEach((dt) => {
      const txDate = new Date(dt.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      const match = result.find(
        (m) => m.year === txYear && m.monthNum === txMonth
      );

      if (match) {
        if (dt.type === 'INCOME') {
          match.income += dt.amount;
        } else if (dt.type === 'EXPENSE') {
          match.expense += dt.amount;
        }
      }
    });

    return result.map(({ month, income, expense }) => ({
      month,
      income,
      expense
    }));
  }, [dbTransactions]);

  const totalIncome = React.useMemo(() => {
    return computedMonthlyFinancials.reduce((s, m) => s + m.income, 0);
  }, [computedMonthlyFinancials]);

  const totalExpense = React.useMemo(() => {
    return computedMonthlyFinancials.reduce((s, m) => s + m.expense, 0);
  }, [computedMonthlyFinancials]);

  const netSavings = totalIncome - totalExpense;
  const savingRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>Financial Report — Last 6 Months</DialogTitle>
        </DialogHeader>

        {/* Summary stats */}
        <div className='grid grid-cols-3 gap-3'>
          <div className='rounded-lg bg-emerald-500/10 p-3 text-center'>
            <p className='text-muted-foreground text-xs'>Total Income</p>
            <p className='text-lg font-bold text-emerald-400'>
              {formatINRFull(totalIncome)}
            </p>
          </div>
          <div className='rounded-lg bg-red-500/10 p-3 text-center'>
            <p className='text-muted-foreground text-xs'>Total Spent</p>
            <p className='text-lg font-bold text-red-400'>
              {formatINRFull(totalExpense)}
            </p>
          </div>
          <div className='rounded-lg bg-blue-500/10 p-3 text-center'>
            <p className='text-muted-foreground text-xs'>Net Saved</p>
            <p className='text-lg font-bold text-blue-400'>
              {formatINRFull(netSavings)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div>
          <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase'>
            Income vs Expenses
          </p>
          <ChartContainer config={chartConfig} className='h-[220px] w-full'>
            <AreaChart
              data={computedMonthlyFinancials}
              margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='fillIncome' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#4ade80' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#4ade80' stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id='fillExpense' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f87171' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#f87171' stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatINRFull(value as number)}
                  />
                }
              />
              <Area
                dataKey='income'
                type='monotone'
                fill='url(#fillIncome)'
                stroke='#4ade80'
                strokeWidth={2}
                dot={{ r: 3, fill: '#4ade80' }}
                activeDot={{ r: 5 }}
              />
              <Area
                dataKey='expense'
                type='monotone'
                fill='url(#fillExpense)'
                stroke='#f87171'
                strokeWidth={2}
                dot={{ r: 3, fill: '#f87171' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Monthly breakdown table */}
        <div>
          <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase'>
            Monthly Breakdown
          </p>
          <div className='border-border overflow-hidden rounded-lg border'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-muted/50'>
                  <th className='text-muted-foreground px-3 py-2 text-left text-xs font-medium'>
                    Month
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-emerald-400'>
                    Income
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-red-400'>
                    Expense
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-blue-400'>
                    Saved
                  </th>
                </tr>
              </thead>
              <tbody>
                {computedMonthlyFinancials.map((row, i) => {
                  const saved = row.income - row.expense;
                  return (
                    <tr
                      key={i}
                      className='border-border/50 hover:bg-muted/30 border-t transition-colors'
                    >
                      <td className='text-foreground px-3 py-2 text-xs font-medium'>
                        {row.month}
                      </td>
                      <td className='px-3 py-2 text-right text-xs text-emerald-400'>
                        {formatINRFull(row.income)}
                      </td>
                      <td className='px-3 py-2 text-right text-xs text-red-400'>
                        {formatINRFull(row.expense)}
                      </td>
                      <td className='px-3 py-2 text-right text-xs font-semibold text-blue-400'>
                        {formatINRFull(saved)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className='text-muted-foreground mt-2 text-right text-xs'>
            Average savings rate:{' '}
            <span className='text-foreground font-semibold'>{savingRate}%</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
