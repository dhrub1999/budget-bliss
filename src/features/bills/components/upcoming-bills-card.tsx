'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatINRFull } from '@/features/overview/components/overview-data';
import { cn } from '@/lib/utils';
import { BILL_STATUS_STYLES, UPCOMING_HORIZON_DAYS } from '../constants';
import { formatDueLabel, getBillStatus, daysUntilDue } from '../lib/status';
import type { BillRecord } from '../types';

interface UpcomingBillsCardProps {
  bills?: BillRecord[];
  /** Server's clock, ISO. Seeds `today` so SSR and first client paint agree. */
  serverNow: string;
  /** How many rows to show before deferring to the full page. */
  limit?: number;
}

/**
 * Dashboard widget: the next few bills due. Read-only — paying happens on the
 * Bills page, so this stays a glance rather than another place to mutate money.
 */
export function UpcomingBillsCard({
  bills = [],
  serverNow,
  limit = 4
}: UpcomingBillsCardProps) {
  const [today, setToday] = React.useState<Date>(() => new Date(serverNow));
  React.useEffect(() => {
    setToday(new Date());
  }, []);

  const visible = React.useMemo(() => {
    return (
      bills
        .filter((b) => daysUntilDue(b.dueDate, today) <= UPCOMING_HORIZON_DAYS)
        // Calendar-day strings sort correctly as plain strings.
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, limit)
    );
  }, [bills, today, limit]);

  const total = visible.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card className='bg-card h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>
            Upcoming Bills
          </CardTitle>
          <Link
            href='/dashboard/bills'
            className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors'
          >
            All bills
            <ArrowRight className='h-3 w-3' />
          </Link>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-2 px-4 pb-4'>
        {visible.length === 0 ? (
          <div className='flex h-[140px] flex-col items-center justify-center gap-2 text-center'>
            <CalendarClock className='text-muted-foreground h-8 w-8' />
            <p className='text-muted-foreground text-sm'>
              Nothing due in the next {UPCOMING_HORIZON_DAYS} days.
            </p>
            <Link
              href='/dashboard/bills'
              className='text-xs text-emerald-400 hover:text-emerald-300'
            >
              Add a bill
            </Link>
          </div>
        ) : (
          <>
            {visible.map((bill) => {
              const styles =
                BILL_STATUS_STYLES[getBillStatus(bill.dueDate, today)];
              return (
                <div
                  key={bill.id}
                  className='border-border/50 bg-muted/30 hover:bg-muted/60 flex items-center gap-3 rounded-lg border p-2.5 transition-colors'
                >
                  <span
                    className={cn('h-2 w-2 shrink-0 rounded-full', styles.dot)}
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-foreground truncate text-sm font-medium'>
                      {bill.name}
                    </p>
                    <p className={cn('text-[11px]', styles.text)}>
                      {formatDueLabel(bill.dueDate, today)}
                    </p>
                  </div>
                  <span className='text-foreground shrink-0 text-sm font-semibold'>
                    {formatINRFull(bill.amount)}
                  </span>
                </div>
              );
            })}
            <div className='border-border/50 mt-1 flex items-center justify-between border-t pt-2'>
              <span className='text-muted-foreground text-xs'>
                {visible.length === bills.length
                  ? 'Total'
                  : `Total of ${visible.length} shown`}
              </span>
              <span className='text-foreground text-sm font-semibold'>
                {formatINRFull(total)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
