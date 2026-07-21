'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface QuickInsightsProps {
  dbTransactions?: Array<{
    id: string;
    amount: number;
    type: string;
    category: string;
    description: string | null;
    date: string;
    userId: string;
  }>;
  dbGoals?: Array<{
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    icon: string;
    color: string;
    deadline: string;
    userId: string;
    createdAt: string;
  }>;
}

export function QuickInsights({
  dbTransactions = [],
  dbGoals = []
}: QuickInsightsProps) {
  const insights = React.useMemo(() => {
    const list: Array<{
      id: string;
      type: 'goal' | 'warning' | 'bill' | 'savings';
      icon: string;
      color: string;
      text: string;
    }> = [];

    // 1. Goal Insight
    if (dbGoals.length > 0) {
      let bestGoal = dbGoals[0];
      let maxPct = 0;
      dbGoals.forEach((g) => {
        const pct =
          g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0;
        if (pct > maxPct) {
          maxPct = pct;
          bestGoal = g;
        }
      });

      if (maxPct > 0) {
        list.push({
          id: 'dyn-goal',
          type: 'goal',
          icon: bestGoal.icon || '🎯',
          color: bestGoal.color || '#4ade80',
          text: `You have saved ${Math.round(
            maxPct
          )}% of your target for "${bestGoal.name}"! Keep it up!`
        });
      } else {
        list.push({
          id: 'dyn-goal-start',
          type: 'goal',
          icon: '🎯',
          color: '#4ade80',
          text: `You have ${dbGoals.length} active goal(s). Add contributions to start building your savings!`
        });
      }
    }

    // 2. Transaction Summary
    if (dbTransactions.length > 0) {
      let totalIncome = 0;
      let totalExpense = 0;

      dbTransactions.forEach((t) => {
        if (t.type === 'INCOME') {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      });

      list.push({
        id: 'dyn-summary',
        type: 'savings',
        icon: '💰',
        color: '#c084fc',
        text: `Summary: You have recorded a total of ₹${totalIncome.toLocaleString(
          'en-IN'
        )} in income and ₹${totalExpense.toLocaleString('en-IN')} in expenses.`
      });

      if (totalExpense > totalIncome) {
        list.push({
          id: 'dyn-warning',
          type: 'warning',
          icon: '⚠️',
          color: '#fb923c',
          text: 'Your total expenses exceed your income. Consider reviewing your category caps.'
        });
      }
    }

    return list;
  }, [dbTransactions, dbGoals]);

  return (
    <Card className='bg-card h-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-semibold'>Quick Insights</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3 px-4 pb-4'>
        {insights.length === 0 ? (
          <div className='flex h-[160px] flex-col items-center justify-center gap-2 text-center'>
            <div className='text-3xl'>✨</div>
            <p className='text-muted-foreground text-sm'>
              No insights available yet.
            </p>
            <p className='text-muted-foreground text-xs'>
              Add more transactions to generate financial insights.
            </p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className='group border-border/50 bg-muted/30 hover:bg-muted/60 flex items-start gap-3 rounded-lg border p-3 transition-all duration-200'
            >
              <div
                className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base'
                style={{ backgroundColor: `${insight.color}20` }}
              >
                <span>{insight.icon}</span>
              </div>
              <p className='text-muted-foreground group-hover:text-foreground text-sm leading-relaxed'>
                {insight.text}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
