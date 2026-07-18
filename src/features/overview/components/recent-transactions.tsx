'use client';

import * as React from 'react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, ChevronRight, Plus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { transactions, formatINRFull, type Transaction } from './overview-data';
import { AddTransactionDialog } from './add-transaction-dialog';

type FilterTab = 'all' | 'credited' | 'debited';

const categoryIconMap: Record<string, string> = {
  Groceries: '🛒',
  'Dining Out': '🍽️',
  Subscriptions: '📺',
  Bills: '🧾',
  Transportation: '🚗',
  Entertainment: '🎬',
  Healthcare: '🏥',
  Shopping: '🛍️',
  Salary: '💼',
  Freelance: '💻',
  Investment: '📈',
  Others: '📦'
};

function formatDateTime(isoStr: string) {
  const d = new Date(isoStr);
  return {
    date: format(d, 'MMM d, yyyy'),
    time: format(d, 'h:mm a')
  };
}

interface RecentTransactionsProps {
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

export function RecentTransactions({
  dbTransactions = []
}: RecentTransactionsProps) {
  const [tab, setTab] = React.useState<FilterTab>('all');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );
  const [calOpen, setCalOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const allTransactions = React.useMemo(() => {
    const mappedDb = dbTransactions.map((dt) => {
      const icon = categoryIconMap[dt.category] || '📦';
      return {
        id: dt.id,
        title: dt.description || dt.category,
        category: dt.category as any,
        amount: dt.amount,
        type: dt.type === 'INCOME' ? ('credit' as const) : ('debit' as const),
        date: dt.date,
        icon
      };
    });

    return [...mappedDb, ...transactions];
  }, [dbTransactions]);

  const filtered = React.useMemo(() => {
    let list = [...allTransactions];

    // Tab filter
    if (tab === 'credited') list = list.filter((t) => t.type === 'credit');
    else if (tab === 'debited') list = list.filter((t) => t.type === 'debit');

    // Date range filter
    if (dateRange?.from) {
      const from = startOfDay(dateRange.from);
      const to = dateRange.to
        ? endOfDay(dateRange.to)
        : endOfDay(dateRange.from);
      list = list.filter((t) =>
        isWithinInterval(new Date(t.date), { start: from, end: to })
      );
    }

    return list.slice(0, 12); // show last 12
  }, [tab, dateRange, allTransactions]);

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-6'>
          <div className='text-4xl'>⚠️</div>
          <p className='text-muted-foreground text-center text-sm'>
            Failed to load transactions.
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
    <>
      <Card className='bg-card flex h-full flex-col'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              Recent Transactions
            </CardTitle>
            <a
              href='/dashboard/transactions'
              className='text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs transition-colors'
            >
              View All
              <ChevronRight className='h-3 w-3' />
            </a>
          </div>

          {/* Controls row */}
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            {/* Date range picker */}
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className={cn(
                    'border-border h-7 gap-1.5 text-xs',
                    dateRange?.from && 'text-foreground'
                  )}
                >
                  <CalendarIcon className='h-3 w-3' />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM d')} -{' '}
                        {format(dateRange.to, 'MMM d')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Pick date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.to) setCalOpen(false);
                  }}
                  numberOfMonths={1}
                  disabled={(date) => date > new Date()}
                />
                {dateRange && (
                  <div className='border-t p-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full text-xs'
                      onClick={() => {
                        setDateRange(undefined);
                        setCalOpen(false);
                      }}
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Add new transaction */}
            <Button
              size='sm'
              className='ml-auto h-7 gap-1 bg-[#4ade80] px-3 text-xs font-semibold text-black hover:bg-[#22c55e]'
              onClick={() => setAddOpen(true)}
            >
              <Plus className='h-3 w-3' />
              Add New
            </Button>
          </div>

          {/* Tab filter */}
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as FilterTab)}
            className='mt-1'
          >
            <TabsList className='h-7 w-full gap-1 bg-transparent p-0'>
              {(['all', 'credited', 'debited'] as const).map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className='data-[state=active]:border-primary data-[state=active]:text-foreground h-7 rounded-none border-b-2 border-transparent px-3 text-xs capitalize data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none'
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className='flex-1 overflow-auto px-4 pb-4'>
          {filtered.length === 0 ? (
            <div className='flex h-[200px] flex-col items-center justify-center gap-2 text-center'>
              <div className='text-3xl'>🔍</div>
              <p className='text-muted-foreground text-sm'>
                No transactions found.
              </p>
              <p className='text-muted-foreground text-xs'>
                {dateRange?.from
                  ? 'Try a different date range.'
                  : 'Add a transaction to get started.'}
              </p>
            </div>
          ) : (
            <div className='divide-border/50 divide-y'>
              {filtered.map((txn) => {
                const { date, time } = formatDateTime(txn.date);
                const isCredit = txn.type === 'credit';
                return (
                  <div
                    key={txn.id}
                    className='hover:bg-muted/30 flex items-center gap-3 py-2.5 transition-colors'
                  >
                    {/* Icon */}
                    <div className='bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg'>
                      {categoryIconMap[txn.category] ?? '💳'}
                    </div>

                    {/* Title + category */}
                    <div className='flex-1 overflow-hidden'>
                      <p className='text-foreground truncate text-sm font-medium'>
                        {txn.title}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {txn.category}
                      </p>
                    </div>

                    {/* Amount + date */}
                    <div className='shrink-0 text-right'>
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          isCredit ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {isCredit ? '+' : '-'}
                        {formatINRFull(txn.amount)}
                      </p>
                      <p className='text-muted-foreground text-[10px]'>
                        {date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
