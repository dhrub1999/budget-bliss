'use client';

import * as React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Target,
  PieChart,
  AlertTriangle,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import {
  BudgetOverviewCard,
  Budget,
  CategorySpending
} from './budget-overview-card';
import {
  GoalsSavings,
  Goal
} from '@/features/overview/components/goals-savings';
import { AddBudgetDialog } from './add-budget-dialog';
import { AddGoalDialog } from '@/features/overview/components/add-goal-dialog';
import {
  formatINRFull,
  formatINR
} from '@/features/overview/components/overview-data';

interface BudgetingViewProps {
  initialBudgets: Budget[];
  initialGoals: Goal[];
  monthlySpendings: CategorySpending[];
  totalMonthlySpending: number;
}

export function BudgetingView({
  initialBudgets,
  initialGoals,
  monthlySpendings,
  totalMonthlySpending
}: BudgetingViewProps) {
  const [addBudgetOpen, setAddBudgetOpen] = React.useState(false);
  const [addGoalOpen, setAddGoalOpen] = React.useState(false);

  // Compute summary stats
  const totalSaved = React.useMemo(() => {
    return initialGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  }, [initialGoals]);

  const totalTarget = React.useMemo(() => {
    return initialGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [initialGoals]);

  const completedGoalsCount = React.useMemo(() => {
    return initialGoals.filter(
      (g) => g.isCompleted || g.savedAmount >= g.targetAmount
    ).length;
  }, [initialGoals]);

  const monthlyBudgetObj = React.useMemo(() => {
    return initialBudgets.find(
      (b) => b.category === 'TOTAL' && b.period === 'MONTHLY'
    );
  }, [initialBudgets]);

  const alertCategoriesCount = React.useMemo(() => {
    let count = 0;
    const catBudgets = initialBudgets.filter(
      (b) => b.category !== 'TOTAL' && b.period === 'MONTHLY'
    );
    catBudgets.forEach((b) => {
      const spent =
        monthlySpendings.find((s) => s.category === b.category)?.spent || 0;
      if (b.amount > 0 && spent >= b.amount * 0.8) {
        count++;
      }
    });
    return count;
  }, [initialBudgets, monthlySpendings]);

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-6 pb-8'>
        {/* Header section */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
              Budgeting &amp; Goals Hub
            </h1>
            <p className='text-sm text-zinc-400'>
              Set spending limits, monitor category thresholds, and achieve your
              financial targets.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              onClick={() => setAddBudgetOpen(true)}
              variant='outline'
              className='h-10 cursor-pointer gap-2 border-zinc-800 bg-[#18181b] text-white hover:bg-zinc-800'
            >
              <PieChart className='h-4 w-4 text-emerald-400' />
              Set Budget Limit
            </Button>
            <Button
              onClick={() => setAddGoalOpen(true)}
              className='h-10 cursor-pointer gap-2 bg-[#4ade80] font-semibold text-black hover:bg-[#22c55e]'
            >
              <Plus className='h-4 w-4' />
              New Goal
            </Button>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Monthly Budget Cap */}
          <Card className='border-zinc-800 bg-[#141416]'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                Monthly Cap Limit
              </CardTitle>
              <PieChart className='h-4 w-4 text-emerald-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {monthlyBudgetObj
                  ? formatINRFull(monthlyBudgetObj.amount)
                  : 'Not Set'}
              </div>
              <p className='mt-1 text-xs text-zinc-400'>
                {monthlyBudgetObj
                  ? `${formatINR(totalMonthlySpending)} spent (${Math.round(
                      (totalMonthlySpending / monthlyBudgetObj.amount) * 100
                    )}%)`
                  : 'Set total limit to monitor overall spending'}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Goals Saved */}
          <Card className='border-zinc-800 bg-[#141416]'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                Total Savings Accumulated
              </CardTitle>
              <Target className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {formatINRFull(totalSaved)}
              </div>
              <p className='mt-1 text-xs text-zinc-400'>
                Target: {formatINRFull(totalTarget)} (
                {totalTarget > 0
                  ? Math.round((totalSaved / totalTarget) * 100)
                  : 0}
                % achieved)
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Goals Completed */}
          <Card className='border-zinc-800 bg-[#141416]'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                Achieved Goals
              </CardTitle>
              <ShieldCheck className='h-4 w-4 text-purple-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {completedGoalsCount} of {initialGoals.length}
              </div>
              <p className='mt-1 text-xs text-zinc-400'>
                {initialGoals.length - completedGoalsCount} active goals in
                progress
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Budget Alerts */}
          <Card className='border-zinc-800 bg-[#141416]'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                Active Budget Warnings
              </CardTitle>
              <AlertTriangle
                className={`h-4 w-4 ${alertCategoriesCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`}
              />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {alertCategoriesCount}
              </div>
              <p className='mt-1 text-xs text-zinc-400'>
                {alertCategoriesCount > 0
                  ? `${alertCategoriesCount} categories near or exceeding 80%+ limit`
                  : 'All category budgets are healthy'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Budget Overview + Goals Savings */}
        <div className='grid min-h-[500px] gap-6 lg:grid-cols-2'>
          <BudgetOverviewCard
            budgets={initialBudgets}
            spendings={monthlySpendings}
            totalSpending={totalMonthlySpending}
          />

          <GoalsSavings dbGoals={initialGoals} />
        </div>
      </div>

      <AddBudgetDialog open={addBudgetOpen} onOpenChange={setAddBudgetOpen} />

      <AddGoalDialog open={addGoalOpen} onOpenChange={setAddGoalOpen} />
    </PageContainer>
  );
}
