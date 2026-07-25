'use client';

import * as React from 'react';
import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Repeat,
  Trash2,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatINRFull } from '@/features/overview/components/overview-data';
import { cn } from '@/lib/utils';
import { BILL_STATUS_STYLES, RECURRENCE_LABELS } from '../constants';
import { parseDueDate } from '../lib/date';
import { formatDueLabel, getBillStatus } from '../lib/status';
import type { BillRecord } from '../types';

interface BillCardProps {
  bill: BillRecord;
  today: Date;
  onMarkPaid: (bill: BillRecord) => void;
  onEdit: (bill: BillRecord) => void;
  onDelete: (bill: BillRecord) => void;
}

export function BillCard({
  bill,
  today,
  onMarkPaid,
  onEdit,
  onDelete
}: BillCardProps) {
  // Local Date purely for display; all comparisons use the calendar-day string.
  const displayDate = parseDueDate(bill.dueDate);
  const status = getBillStatus(bill.dueDate, today);
  const styles = BILL_STATUS_STYLES[status];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 transition-colors sm:p-4',
        styles.border,
        'bg-[#141416] hover:bg-[#18181b]'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          styles.bg
        )}
      >
        <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <p className='truncate text-sm font-semibold text-white'>
            {bill.name}
          </p>
          {bill.recurrence !== 'NONE' && (
            <span className='flex shrink-0 items-center gap-1 text-[10px] text-zinc-500'>
              <Repeat className='h-3 w-3' />
              {RECURRENCE_LABELS[bill.recurrence]}
            </span>
          )}
        </div>
        <div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400'>
          <span className={cn('font-medium', styles.text)}>
            {formatDueLabel(bill.dueDate, today)}
          </span>
          <span className='text-zinc-600'>·</span>
          <span>
            {displayDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <span className='text-zinc-600'>·</span>
          <span>{bill.category}</span>
          {bill.accountName && (
            <>
              <span className='text-zinc-600'>·</span>
              <span className='flex items-center gap-1'>
                <Wallet className='h-3 w-3' />
                {bill.accountName}
              </span>
            </>
          )}
        </div>
      </div>

      <div className='shrink-0 text-right'>
        <p className='text-sm font-bold text-white sm:text-base'>
          {formatINRFull(bill.amount)}
        </p>
      </div>

      <div className='flex shrink-0 items-center gap-1'>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => onMarkPaid(bill)}
          className='h-8 gap-1 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
        >
          <CheckCircle2 className='h-3.5 w-3.5' />
          <span className='hidden sm:inline'>Mark paid</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size='icon'
              variant='ghost'
              className='h-8 w-8 text-zinc-400 hover:text-white'
            >
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Bill actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='border-zinc-800 bg-[#18181b] text-white'
          >
            <DropdownMenuItem onClick={() => onEdit(bill)}>
              <Pencil className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(bill)}
              className='text-rose-400 focus:text-rose-400'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
