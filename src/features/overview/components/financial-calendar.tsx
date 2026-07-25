'use client';

import * as React from 'react';
import Link from 'next/link';
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
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  CalendarClock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  formatINRFull,
  categoryConfig,
  type TransactionCategory
} from './overview-data';
import { AddTransactionDialog } from './add-transaction-dialog';
import type { BillRecord } from '@/features/bills/types';

function getDateType(
  events: Record<string, { debits: any[]; credits: any[] }>,
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
  /**
   * Bills the user has entered. These are the only forward-looking markers on
   * the calendar — everything else here is recorded history.
   */
  dbBills?: BillRecord[];
}

export function FinancialCalendar({
  dbTransactions = [],
  dbBills = []
}: FinancialCalendarProps) {
  const [today, setToday] = React.useState<Date>(() => new Date('2026-07-21'));
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    () => new Date('2026-07-21')
  );
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [popoverDate, setPopoverDate] = React.useState<Date | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addDateStr, setAddDateStr] = React.useState<string>('');
  const [hasError] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrentMonth(now);
    setIsClient(true);
  }, []);

  const events = React.useMemo(() => {
    const result: Record<string, { debits: any[]; credits: any[] }> = {};

    dbTransactions.forEach((dt) => {
      const d = new Date(dt.date);
      if (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      ) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;

        if (!result[key]) {
          result[key] = { debits: [], credits: [] };
        }

        const config = categoryConfig[dt.category as TransactionCategory] || {
          color: '#94a3b8',
          icon: '📦'
        };
        const frontendTxn = {
          id: dt.id,
          title: dt.description || dt.category,
          category: dt.category as any,
          amount: dt.amount,
          type: dt.type === 'INCOME' ? ('credit' as const) : ('debit' as const),
          date: dt.date,
          icon: config.icon
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

  /**
   * Bills due in the displayed month, keyed yyyy-MM-dd. bill.dueDate is already
   * a calendar-day string, so the month test is a string prefix — parsing it
   * into a Date first would risk a timezone shifting it into a neighbouring
   * month.
   */
  const billsByDate = React.useMemo(() => {
    const result: Record<string, BillRecord[]> = {};
    const monthPrefix = format(currentMonth, 'yyyy-MM');
    dbBills.forEach((bill) => {
      if (!bill.dueDate.startsWith(monthPrefix)) return;
      if (!result[bill.dueDate]) result[bill.dueDate] = [];
      result[bill.dueDate].push(bill);
    });
    return result;
  }, [currentMonth, dbBills]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Sunday = 0 (pad days before month starts)
  const startPadding = getDay(monthStart);

  // Forward navigation reaches one month past the current one, because that's
  // where next cycle's bills live. Beyond that there is nothing to show.
  const canGoForward = !isSameMonth(currentMonth, addMonths(today, 1));

  function handlePrevMonth() {
    setCurrentMonth((m) => subMonths(m, 1));
  }

  function handleNextMonth() {
    if (canGoForward) setCurrentMonth((m) => addMonths(m, 1));
  }

  function handleDayClick(day: Date) {
    // Future days stay inert unless a bill is due — there's nothing recorded to
    // show and nothing sensible to add.
    if (!isDayInteractive(day)) return;
    setSelectedDate(day);
    setPopoverDate(day);
  }

  function isDayInteractive(day: Date) {
    const isFuture = isAfter(startOfDay(day), startOfDay(today));
    if (!isFuture) return true;
    return (billsByDate[format(day, 'yyyy-MM-dd')]?.length ?? 0) > 0;
  }

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6'>
          <AlertTriangle className='h-10 w-10 text-red-500' />
          <p className='text-muted-foreground text-center text-sm'>
            Failed to load calendar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const popoverDateStr = popoverDate ? format(popoverDate, 'yyyy-MM-dd') : '';
  const popoverEvents = popoverDateStr ? events[popoverDateStr] : null;
  const popoverBills = popoverDateStr ? billsByDate[popoverDateStr] : null;

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
            {format(today, 'EEEE, do MMMM')}
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
                  const isFuture = isAfter(startOfDay(day), startOfDay(today));
                  const isToday = isSameDay(day, today);
                  const isSelected = selectedDate
                    ? isSameDay(day, selectedDate)
                    : false;
                  const type = getDateType(events, dateStr);
                  const dayBills = billsByDate[dateStr] ?? [];
                  const hasBill = dayBills.length > 0;
                  const isInert = isFuture && !hasBill;

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
                          disabled={isInert}
                          className={cn(
                            'relative flex h-8 w-full flex-col items-center justify-center rounded-md text-sm font-medium transition-all duration-150',
                            isInert
                              ? 'text-muted-foreground/30 cursor-not-allowed'
                              : 'hover:bg-muted cursor-pointer',
                            isToday &&
                              !type &&
                              'text-foreground ring-border ring-1',
                            isSelected && 'bg-muted',
                            type === 'debit' && 'text-red-400',
                            type === 'credit' && 'text-emerald-400',
                            type === 'both' && 'text-emerald-400',
                            // A due bill takes the colour only when there's no
                            // recorded activity competing for it.
                            !type && hasBill && 'text-amber-400'
                          )}
                        >
                          {format(day, 'd')}
                          {(type || hasBill) && (
                            <span className='absolute bottom-0.5 flex items-center gap-0.5'>
                              {type && (
                                <span
                                  className={cn(
                                    'h-1 w-1 rounded-full',
                                    type === 'debit' && 'bg-red-400',
                                    (type === 'credit' || type === 'both') &&
                                      'bg-emerald-400'
                                  )}
                                />
                              )}
                              {hasBill && (
                                <span className='h-1 w-1 rounded-full bg-amber-400' />
                              )}
                            </span>
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

                          {popoverBills && popoverBills.length > 0 && (
                            <div className='space-y-1'>
                              <p className='text-[10px] font-semibold tracking-wider text-amber-400 uppercase'>
                                Due
                              </p>
                              {popoverBills.map((bill) => (
                                <div
                                  key={bill.id}
                                  className='flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5'
                                >
                                  <div className='flex items-center gap-2'>
                                    <CalendarClock className='h-4 w-4 text-amber-400' />
                                    <div>
                                      <p className='text-foreground text-xs font-medium'>
                                        {bill.name}
                                      </p>
                                      <p className='text-muted-foreground text-[10px]'>
                                        {bill.category}
                                        {bill.accountName
                                          ? ` · ${bill.accountName}`
                                          : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <span className='text-xs font-semibold text-amber-400'>
                                    {formatINRFull(bill.amount)}
                                  </span>
                                </div>
                              ))}
                              <p className='text-muted-foreground pt-0.5 text-[10px]'>
                                Mark bills paid on the{' '}
                                <Link
                                  href='/dashboard/bills'
                                  className='text-emerald-400 hover:text-emerald-300'
                                >
                                  Bills page
                                </Link>
                                .
                              </p>
                            </div>
                          )}

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
                                    <DynamicIcon
                                      emoji={txn.icon}
                                      className='h-4 w-4'
                                      style={{
                                        color:
                                          categoryConfig[
                                            txn.category as TransactionCategory
                                          ]?.color
                                      }}
                                    />
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
                            !popoverBills?.length && (
                              <p className='text-muted-foreground py-2 text-center text-xs'>
                                No transactions on this day.
                              </p>
                            )
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
                <div className='flex items-center gap-1.5'>
                  <div className='h-2 w-2 rounded-full bg-amber-400' />
                  <span className='text-muted-foreground text-[10px]'>Due</span>
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
