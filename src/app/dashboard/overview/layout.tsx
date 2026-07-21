import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { QuickActions } from '@/features/overview/components/quick-actions';
import { QuickInsights } from '@/features/overview/components/quick-insights';
import { CreditCards } from '@/features/overview/components/credit-cards';
import { db } from '@/db';
import { transactions, goals as dbGoalsTable } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

export default async function OverViewLayout({
  bar_stats,
  pie_stats,
  sales,
  area_stats
}: {
  bar_stats: React.ReactNode;
  pie_stats: React.ReactNode;
  sales: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;

  let dbTxns: any[] = [];
  let dbGoals: any[] = [];

  if (userId) {
    dbTxns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    dbGoals = await db
      .select()
      .from(dbGoalsTable)
      .where(eq(dbGoalsTable.userId, userId));
  }

  const serializedTxns = dbTxns.map((t) => ({
    ...t,
    date: t.date.toISOString()
  }));

  const serializedGoals = dbGoals.map((g) => ({
    ...g,
    deadline: g.deadline.toISOString(),
    createdAt: g.createdAt.toISOString()
  }));

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-4'>
        {/* ─── Row 1: Quick Action Buttons ─────────────────────────────── */}
        <QuickActions dbTransactions={serializedTxns} />

        {/* ─── Row 2: Main Dashboard Grid ──────────────────────────────── */}
        {/*
          Layout (3 columns on large screens):
          Col 1 (narrow): Spending Categories + Quick Insights
          Col 2 (mid):    Goals & Savings + Financial Calendar
          Col 3 (wide):   Recent Transactions + Credit Cards
        */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* ── Column 1 ── */}
          <div className='flex flex-col gap-4 lg:col-span-4'>
            {/* Spending Categories (parallel route @bar_stats) */}
            <div>{bar_stats}</div>
            {/* Quick Insights */}
            <QuickInsights
              dbTransactions={serializedTxns}
              dbGoals={serializedGoals}
            />
          </div>

          {/* ── Column 2 ── */}
          <div className='flex flex-col gap-4 lg:col-span-4'>
            {/* Goals & Savings (parallel route @pie_stats) */}
            <div>{pie_stats}</div>
            {/* Financial Calendar (parallel route @area_stats) */}
            <div>{area_stats}</div>
          </div>

          {/* ── Column 3 ── */}
          <div className='flex flex-col gap-4 lg:col-span-4'>
            {/* Recent Transactions (parallel route @sales) */}
            <div className='flex-1'>{sales}</div>
            {/* Credit Cards (static) */}
            <CreditCards />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
