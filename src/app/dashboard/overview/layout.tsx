import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { QuickActions } from '@/features/overview/components/quick-actions';
import { QuickInsights } from '@/features/overview/components/quick-insights';
import { CreditCards } from '@/features/overview/components/credit-cards';
import { AccountsSummary } from '@/features/overview/components/accounts-summary';
import { getAccountsWithBalances } from '@/features/accounts/lib/get-accounts';
import type { AccountOption, PortfolioTotals } from '@/features/accounts/types';
import { UpcomingBillsCard } from '@/features/bills/components/upcoming-bills-card';
import { getBills } from '@/features/bills/lib/get-bills';
import type { BillRecord } from '@/features/bills/types';
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
  let dbBills: BillRecord[] = [];
  let accountList: AccountOption[] = [];
  let portfolio: PortfolioTotals = {
    totalAssets: 0,
    totalCardDebt: 0,
    netWorth: 0
  };

  if (userId) {
    dbTxns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    dbGoals = await db
      .select()
      .from(dbGoalsTable)
      .where(eq(dbGoalsTable.userId, userId));

    const accountsData = await getAccountsWithBalances(userId);
    accountList = accountsData.accounts;
    portfolio = accountsData.portfolio;

    // Already serialized to ISO strings by getBills.
    dbBills = (await getBills(userId)).bills;
  }

  const serverNow = new Date().toISOString();

  const cardAccounts = accountList.filter((a) => a.type === 'CREDIT_CARD');

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

        {/* ─── Row 1.5: Accounts / Net-worth summary ───────────────────── */}
        <AccountsSummary accounts={accountList} portfolio={portfolio} />

        {/* ─── Row 2: Main Dashboard Grid ──────────────────────────────── */}
        {/*
          Layout (3 columns on large screens):
          Col 1 (narrow): Spending Categories + Quick Insights + Upcoming Bills
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
              dbBills={dbBills}
              serverNow={serverNow}
            />
            {/* Upcoming Bills */}
            <UpcomingBillsCard bills={dbBills} serverNow={serverNow} />
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
            {/* Credit Cards (real accounts) */}
            <CreditCards cards={cardAccounts} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
