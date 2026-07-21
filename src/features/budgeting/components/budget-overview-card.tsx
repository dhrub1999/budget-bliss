'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Trash2,
  Edit
} from 'lucide-react';
import { AddBudgetDialog } from './add-budget-dialog';
import {
  formatINRFull,
  formatINR
} from '@/features/overview/components/overview-data';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  userId: string;
  createdAt: string;
}

export interface CategorySpending {
  category: string;
  spent: number;
}

interface BudgetOverviewCardProps {
  budgets?: Budget[];
  spendings?: CategorySpending[];
  totalSpending?: number;
}

export function BudgetOverviewCard({
  budgets = [],
  spendings = [],
  totalSpending = 0
}: BudgetOverviewCardProps) {
  const [period, setPeriod] = React.useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<string>('TOTAL');
  const [editAmount, setEditAmount] = React.useState<number | undefined>(
    undefined
  );

  const filteredBudgets = React.useMemo(() => {
    return budgets.filter((b) => b.period === period);
  }, [budgets, period]);

  const totalBudgetObj = React.useMemo(() => {
    return filteredBudgets.find((b) => b.category === 'TOTAL');
  }, [filteredBudgets]);

  const categoryBudgets = React.useMemo(() => {
    return filteredBudgets.filter((b) => b.category !== 'TOTAL');
  }, [filteredBudgets]);

  const spendingMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    spendings.forEach((s) => {
      map[s.category] = s.spent;
    });
    return map;
  }, [spendings]);

  async function handleDeleteBudget(id: string, category: string) {
    if (!confirm(`Remove budget for ${category}?`)) return;

    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Removed budget for ${category}`);
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to remove budget');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  }

  function handleOpenAdd(category = 'TOTAL', amount?: number) {
    setEditCategory(category);
    setEditAmount(amount);
    setDialogOpen(true);
  }

  return (
    <>
      <Card className='bg-card flex h-full flex-col'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400'>
                <PieChart className='h-4 w-4' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold'>
                  Budget Limits
                </CardTitle>
                <p className='text-muted-foreground text-xs'>
                  Control &amp; monitor spending caps
                </p>
              </div>
            </div>

            {/* Period selector toggle */}
            <div className='flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-1'>
              <button
                onClick={() => setPeriod('MONTHLY')}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  period === 'MONTHLY'
                    ? 'bg-emerald-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod('YEARLY')}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  period === 'YEARLY'
                    ? 'bg-emerald-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='flex flex-1 flex-col gap-4 px-4 pb-4'>
          {/* Total overall budget banner */}
          {totalBudgetObj ? (
            <div className='space-y-2 rounded-xl border border-zinc-800 bg-[#161618] p-3.5'>
              <div className='flex items-center justify-between'>
                <div>
                  <span className='text-xs font-medium tracking-wider text-zinc-400 uppercase'>
                    Overall Total Budget
                  </span>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-xl font-bold text-white'>
                      {formatINR(totalSpending)}
                    </span>
                    <span className='text-xs text-zinc-500'>
                      of {formatINRFull(totalBudgetObj.amount)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {totalSpending > totalBudgetObj.amount ? (
                    <span className='inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-400'>
                      <AlertTriangle className='h-3.5 w-3.5' /> Over Budget
                    </span>
                  ) : totalSpending >= totalBudgetObj.amount * 0.8 ? (
                    <span className='inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400'>
                      <AlertTriangle className='h-3.5 w-3.5' /> Near Limit
                      (80%+)
                    </span>
                  ) : (
                    <span className='inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400'>
                      <CheckCircle className='h-3.5 w-3.5' /> On Track
                    </span>
                  )}
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                      handleOpenAdd('TOTAL', totalBudgetObj.amount)
                    }
                    className='h-7 w-7 cursor-pointer text-zinc-400 hover:text-white'
                  >
                    <Edit className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              {(() => {
                const pct = Math.round(
                  (totalSpending / totalBudgetObj.amount) * 100
                );
                const barColor =
                  pct >= 100
                    ? 'bg-rose-500'
                    : pct >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';
                return (
                  <div className='space-y-1'>
                    <div className='h-2.5 w-full overflow-hidden rounded-full bg-zinc-800'>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className='flex justify-between text-[10px] text-zinc-400'>
                      <span>{pct}% spent</span>
                      <span>
                        {totalBudgetObj.amount - totalSpending > 0
                          ? `${formatINR(totalBudgetObj.amount - totalSpending)} remaining`
                          : `Exceeded by ${formatINR(totalSpending - totalBudgetObj.amount)}`}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className='space-y-2 rounded-xl border border-dashed border-zinc-800 bg-[#141416] p-3 text-center'>
              <p className='text-xs text-zinc-400'>
                No overall total budget set for {period.toLowerCase()} period.
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleOpenAdd('TOTAL')}
                className='h-8 cursor-pointer border-zinc-800 text-xs text-emerald-400 hover:bg-emerald-500/10'
              >
                + Set Overall Budget Limit
              </Button>
            </div>
          )}

          {/* Category Budgets list */}
          <div className='min-h-[160px] flex-1 space-y-3 overflow-auto pr-1'>
            <div className='flex items-center justify-between pt-1 text-xs font-semibold text-zinc-400'>
              <span>Category Limits ({categoryBudgets.length})</span>
              <button
                onClick={() => handleOpenAdd()}
                className='flex cursor-pointer items-center gap-1 text-xs font-medium text-emerald-400 hover:underline'
              >
                <Plus className='h-3 w-3' /> Add Category Budget
              </button>
            </div>

            {categoryBudgets.length === 0 ? (
              <p className='py-4 text-center text-xs text-zinc-500'>
                No category budgets set yet. Click above to set budget limits
                per category.
              </p>
            ) : (
              categoryBudgets.map((b) => {
                const spent = spendingMap[b.category] || 0;
                const pct =
                  b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
                const isOver = pct >= 100;
                const isWarn = pct >= 80 && !isOver;

                return (
                  <div
                    key={b.id}
                    className={`space-y-1.5 rounded-xl border p-2.5 transition-all ${
                      isOver
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : isWarn
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-zinc-800 bg-[#161618]'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-semibold text-white'>
                          {b.category}
                        </span>
                        {isOver && (
                          <span className='rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400'>
                            OVER
                          </span>
                        )}
                        {isWarn && (
                          <span className='rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400'>
                            80%+
                          </span>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-zinc-400'>
                          {formatINR(spent)} / {formatINR(b.amount)}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteBudget(b.id, b.category)}
                          className='h-6 w-6 cursor-pointer text-zinc-500 hover:text-rose-400'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <div className='relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-800'>
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOver
                              ? 'bg-rose-500'
                              : isWarn
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className='w-8 text-right text-[10px] font-semibold text-zinc-300'>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <AddBudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultCategory={editCategory}
        defaultPeriod={period}
        defaultAmount={editAmount}
      />
    </>
  );
}
