'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  billSchema,
  expenseCategories,
  recurrenceOptions,
  type BillSchemaInput,
  type BillSchemaOutput
} from '@/lib/validations/bill';
import type { AccountOption } from '@/features/accounts/types';
import { RECURRENCE_LABELS } from '../constants';
import { parseDueDate, toDueDateString, todayDueDateString } from '../lib/date';
import type { BillRecord } from '../types';
import { toast } from 'sonner';

interface AddEditBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: AccountOption[];
  billToEdit?: BillRecord | null;
  onSuccess?: () => void;
}

/** Sentinel for the "no account chosen" option — Radix Select rejects "". */
const NO_ACCOUNT = '__none__';

export function AddEditBillDialog({
  open,
  onOpenChange,
  accounts,
  billToEdit,
  onSuccess
}: AddEditBillDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const isEditing = Boolean(billToEdit);

  const activeAccounts = React.useMemo(
    () => accounts.filter((a) => !a.isArchived),
    [accounts]
  );

  const buildDefaults = React.useCallback(
    (bill?: BillRecord | null): BillSchemaInput => ({
      name: bill?.name ?? '',
      amount: (bill?.amount ?? '') as any,
      category: bill?.category ?? 'Bills',
      recurrence: bill?.recurrence ?? 'MONTHLY',
      // Calendar-day string end to end; never a Date on the wire.
      dueDate: bill?.dueDate ?? todayDueDateString(),
      accountId: bill?.accountId ?? undefined,
      notes: bill?.notes ?? ''
    }),
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BillSchemaInput>({
    resolver: zodResolver(billSchema) as any,
    defaultValues: buildDefaults(billToEdit)
  });

  React.useEffect(() => {
    if (open) reset(buildDefaults(billToEdit));
  }, [open, billToEdit, reset, buildDefaults]);

  const dueDate = watch('dueDate');
  const recurrence = watch('recurrence');
  const category = watch('category');
  const accountId = watch('accountId');

  async function onSubmit(values: BillSchemaOutput) {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        amount: values.amount,
        category: values.category,
        recurrence: values.recurrence,
        dueDate: values.dueDate,
        accountId: values.accountId || null,
        notes: values.notes?.trim() || null
      };

      const res =
        isEditing && billToEdit
          ? await fetch(`/api/bills/${billToEdit.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
          : await fetch('/api/bills', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

      const data = await res.json();
      setSubmitting(false);
      if (data?.success) {
        toast.success(isEditing ? 'Bill updated' : 'Bill added');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data?.error || 'Failed to save bill');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err?.message || 'Error saving bill');
    }
  }

  const parsedDueDate =
    typeof dueDate === 'string' ? parseDueDate(dueDate) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[94vw] max-w-[440px] overflow-y-auto rounded-2xl border-zinc-800 bg-[#121214] p-4 text-white sm:p-6 [&>button]:hidden'>
        <DialogHeader>
          <div className='flex items-center gap-1.5'>
            <DialogTitle className='text-lg font-semibold text-white'>
              {isEditing ? 'Edit Bill' : 'Add Bill'}
            </DialogTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type='button'
                  aria-label='How bills work'
                  className='rounded-full text-zinc-400 transition-colors hover:text-zinc-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500'
                >
                  <Info className='h-4 w-4' />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className='w-72 border-zinc-800 bg-[#18181b] text-xs text-zinc-300'>
                <p className='mb-1 font-semibold text-white'>
                  Bills appear in the app, not your inbox
                </p>
                <p>
                  BudgetBliss shows what&apos;s due when you open it. There are
                  no emails, texts or push notifications — nothing here contacts
                  you or your bank.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <DialogDescription className='text-xs text-zinc-400'>
            Record something you expect to pay. Marking it paid logs a real
            transaction.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit as any)}
          className='space-y-4 pt-2'
        >
          {/* Name */}
          <div className='space-y-1.5'>
            <Label htmlFor='bill-name' className='text-sm text-zinc-400'>
              Name
            </Label>
            <Input
              id='bill-name'
              placeholder='Rent, Netflix, Car EMI…'
              className='h-12 rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white'
              {...register('name')}
            />
            {errors.name && (
              <p className='text-xs text-rose-400'>{errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className='space-y-1.5'>
            <Label htmlFor='bill-amount' className='text-sm text-zinc-400'>
              Amount (₹)
            </Label>
            <Input
              id='bill-amount'
              type='number'
              step='0.01'
              min='0'
              placeholder='0.00'
              className='h-12 rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white'
              {...register('amount')}
            />
            {errors.amount && (
              <p className='text-xs text-rose-400'>{errors.amount.message}</p>
            )}
          </div>

          {/* Due date */}
          <div className='space-y-1.5'>
            <Label className='text-sm text-zinc-400'>Next due date</Label>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className='relative h-12 w-full cursor-pointer justify-between rounded-xl border border-zinc-800/80 bg-[#18181b] px-4 text-left font-normal text-white hover:bg-zinc-900 hover:text-white'
                >
                  <span className='text-zinc-200'>
                    {parsedDueDate
                      ? parsedDueDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Select date'}
                  </span>
                  <CalendarIcon className='absolute right-4 h-5 w-5 text-zinc-400' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto border-zinc-800 bg-[#18181b] p-0 text-white'
                align='start'
              >
                <Calendar
                  mode='single'
                  selected={parsedDueDate}
                  onSelect={(d) =>
                    d &&
                    setValue('dueDate', toDueDateString(d), {
                      shouldValidate: true
                    })
                  }
                  initialFocus
                  className='rounded-xl border border-zinc-800 bg-[#18181b] text-white'
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className='text-xs text-rose-400'>
                {errors.dueDate.message as string}
              </p>
            )}
          </div>

          {/* Recurrence */}
          <div className='space-y-1.5'>
            <Label className='text-sm text-zinc-400'>Repeats</Label>
            <Select
              value={recurrence ?? 'MONTHLY'}
              onValueChange={(v) =>
                setValue('recurrence', v as any, { shouldValidate: true })
              }
            >
              <SelectTrigger className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                {recurrenceOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {RECURRENCE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-[11px] text-zinc-500'>
              {recurrence === 'NONE'
                ? 'Archived once you mark it paid.'
                : 'The due date moves to the next cycle when you mark it paid.'}
            </p>
          </div>

          {/* Category */}
          <div className='space-y-1.5'>
            <Label className='text-sm text-zinc-400'>Category</Label>
            <Select
              value={category ?? 'Bills'}
              onValueChange={(v) =>
                setValue('category', v, { shouldValidate: true })
              }
            >
              <SelectTrigger className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                {expenseCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid from */}
          <div className='space-y-1.5'>
            <Label className='text-sm text-zinc-400'>
              Usually paid from{' '}
              <span className='text-zinc-600'>(optional)</span>
            </Label>
            <Select
              value={accountId || NO_ACCOUNT}
              onValueChange={(v) =>
                setValue('accountId', v === NO_ACCOUNT ? undefined : v, {
                  shouldValidate: true
                })
              }
            >
              <SelectTrigger className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white'>
                <SelectValue placeholder='Choose later' />
              </SelectTrigger>
              <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                <SelectItem value={NO_ACCOUNT}>Choose later</SelectItem>
                {activeAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-[11px] text-zinc-500'>
              Prefills the account when you mark this bill paid.
            </p>
          </div>

          {/* Notes */}
          <div className='space-y-1.5'>
            <Label htmlFor='bill-notes' className='text-sm text-zinc-400'>
              Notes <span className='text-zinc-600'>(optional)</span>
            </Label>
            <Input
              id='bill-notes'
              placeholder='Landlord, policy number…'
              className='h-12 rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white'
              {...register('notes')}
            />
          </div>

          <DialogFooter className='gap-2 pt-2 sm:gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-10 border-zinc-800 bg-[#18181b] text-white hover:bg-zinc-800'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={submitting}
              className='h-10 bg-[#4ade80] font-semibold text-black hover:bg-[#22c55e]'
            >
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
