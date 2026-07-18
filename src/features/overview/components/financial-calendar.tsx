'use client';

import * as React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isAfter,
  startOfDay,
  subMonths,
  addMonths,
  isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  getCalendarEventsForMonth,
  formatINRFull,
  type Transaction
} from './overview-data';
import { AddTransactionDialog } from './add-transaction-dialog';

const TODAY = new Date('2025-07-14');

function getDateType(
  events: Record<string, { debits: Transaction[]; credits: Transaction[] }>,
  dateStr: string
): 'debit' | 'credit' | 'both' | null {
  const e = events[dateStr];
  if (!e) return null;
  const hasDebit = e.debits.length > 0;
  const hasCredit = e.credits.length > 0;
  if (hasDebit && hasCredit) return 'both';
  if (hasCredit) return 'credit';
  if (hasDebit) return 'debit';
  return null;
}

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

interface FinancialCalendarProps {
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

export function FinancialCalendar({
  dbTransactions = []
}: FinancialCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(TODAY);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [popoverDate, setPopoverDate] = React.useState<Date | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addDateStr, setAddDateStr] = React.useState<string>('');
  const [hasError] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const events = React.useMemo(() => {
    const result = getCalendarEventsForMonth(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );

    dbTransactions.forEach((dt) => {
      const d = new Date(dt.date);
      if (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      ) {
        const key = d.toISOString().split('T')[0];
        if (!result[key]) {
          result[key] = { debits: [], credits: [] };
        }

        const icon = categoryIconMap[dt.category] || '📦';
        const frontendTxn = {
          id: dt.id,
          title: dt.description || dt.category,
          category: dt.category as any,
          amount: dt.amount,
          type: dt.type === 'INCOME' ? ('credit' as const) : ('debit' as const),
          date: dt.date,
          icon
        };

        if (dt.type === 'INCOME') {
          if (!result[key].credits.some((c) => c.id === dt.id)) {
            result[key].credits.push(frontendTxn);
          }
        } else {
          if (!result[key].debits.some((d) => d.id === dt.id)) {
            result[key].debits.push(frontendTxn);
          }
        }
      }
    });

    return result;
  }, [currentMonth, dbTransactions]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Sunday = 0 (pad days before month starts)
  const startPadding = getDay(monthStart);

  const canGoForward = !isSameMonth(currentMonth, TODAY);

  function handlePrevMonth() {
    setCurrentMonth((m) => subMonths(m, 1));
  }

  function handleNextMonth() {
    if (canGoForward) setCurrentMonth((m) => addMonths(m, 1));
  }

  function handleDayClick(day: Date) {
    const isFuture = isAfter(startOfDay(day), startOfDay(TODAY));
    if (isFuture) return;
    setSelectedDate(day);
    setPopoverDate(day);
  }

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6'>
          <div className='text-4xl'>⚠️</div>
          <p className='text-muted-foreground text-center text-sm'>
            Failed to load calendar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const popoverDateStr = popoverDate ? format(popoverDate, 'yyyy-MM-dd') : '';
  const popoverEvents = popoverDateStr ? events[popoverDateStr] : null;

  return (
    <>
      <Card className='bg-card h-full'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              Financial Calendar
            </CardTitle>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={handlePrevMonth}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-foreground min-w-[100px] text-center text-sm font-medium'>
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                disabled={!canGoForward}
                onClick={handleNextMonth}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <p className='text-xs font-medium text-emerald-400'>
            {format(TODAY, 'EEEE, do MMMM')}
          </p>
        </CardHeader>
        <CardContent className='px-3 pb-4'>
          {!isClient ? (
            <div className='grid grid-cols-7 gap-1'>
              {[...Array(35)].map((_, i) => (
                <div key={i} className='bg-muted h-8 animate-pulse rounded' />
              ))}
            </div>
          ) : (
            <>
              {/* Day header */}
              <div className='mb-1 grid grid-cols-7 text-center'>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div
                    key={d}
                    className='text-muted-foreground py-1 text-[11px] font-medium'
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className='grid grid-cols-7 gap-y-0.5'>
                {/* Padding cells */}
                {[...Array(startPadding)].map((_, i) => (
                  <div key={`pad-${i}`} className='py-1 text-center text-sm' />
                ))}

                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isFuture = isAfter(startOfDay(day), startOfDay(TODAY));
                  const isToday = isSameDay(day, TODAY);
                  const isSelected = selectedDate
                    ? isSameDay(day, selectedDate)
                    : false;
                  const type = getDateType(events, dateStr);

                  return (
                    <Popover
                      key={dateStr}
                      open={popoverDate ? isSameDay(day, popoverDate) : false}
                      onOpenChange={(open) => {
                        if (!open) setPopoverDate(null);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => handleDayClick(day)}
                          disabled={isFuture}
                          className={cn(
                            'relative flex h-8 w-full flex-col items-center justify-center rounded-md text-sm font-medium transition-all duration-150',
                            isFuture
                              ? 'text-muted-foreground/30 cursor-not-allowed'
                              : 'hover:bg-muted cursor-pointer',
                            isToday &&
                              !type &&
                              'text-foreground ring-border ring-1',
                            isSelected && 'bg-muted',
                            type === 'debit' && 'text-red-400',
                            type === 'credit' && 'text-emerald-400',
                            type === 'both' && 'text-emerald-400'
                          )}
                        >
                          {format(day, 'd')}
                          {type && (
                            <span
                              className={cn(
                                'absolute bottom-0.5 h-1 w-1 rounded-full',
                                type === 'debit' && 'bg-red-400',
                                (type === 'credit' || type === 'both') &&
                                  'bg-emerald-400'
                              )}
                            />
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-72 p-3'
                        side='top'
                        align='center'
                      >
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <p className='text-foreground text-sm font-semibold'>
                              {format(day, 'MMM d, yyyy')}
                            </p>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-6 gap-1 px-2 text-xs text-emerald-400 hover:text-emerald-300'
                              onClick={() => {
                                setAddDateStr(dateStr);
                                setAddOpen(true);
                                setPopoverDate(null);
                              }}
                            >
                              <Plus className='h-3 w-3' />
                              Add
                            </Button>
                          </div>

                          {popoverEvents ? (
                            <div className='max-h-48 space-y-1 overflow-auto'>
                              {[
                                ...(popoverEvents.credits || []),
                                ...(popoverEvents.debits || [])
                              ].map((txn) => (
                                <div
                                  key={txn.id}
                                  className='bg-muted/50 flex items-center justify-between rounded-md px-2 py-1.5'
                                >
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm'>{txn.icon}</span>
                                    <div>
                                      <p className='text-foreground text-xs font-medium'>
                                        {txn.title}
                                      </p>
                                      <p className='text-muted-foreground text-[10px]'>
                                        {txn.category}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={cn(
                                      'text-xs font-semibold',
                                      txn.type === 'credit'
                                        ? 'text-emerald-400'
                                        : 'text-red-400'
                                    )}
                                  >
                                    {txn.type === 'credit' ? '+' : '-'}
                                    {formatINRFull(txn.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className='text-muted-foreground py-2 text-center text-xs'>
                              No transactions on this day.
                            </p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>

              {/* Legend */}
              <div className='mt-2 flex items-center justify-center gap-4'>
                <div className='flex items-center gap-1.5'>
                  <div className='h-2 w-2 rounded-full bg-red-400' />
                  <span className='text-muted-foreground text-[10px]'>
                    Expense
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <div className='h-2 w-2 rounded-full bg-emerald-400' />
                  <span className='text-muted-foreground text-[10px]'>
                    Income
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <div className='h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-red-400' />
                  <span className='text-muted-foreground text-[10px]'>
                    Both
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultDate={addDateStr}
      />
    </>
  );
}
