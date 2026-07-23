'use client';

import * as React from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountOption } from '@/features/accounts/types';
import type { TransactionFormOutput } from '@/lib/validations/transaction';
import { formatINR } from '@/features/overview/components/overview-data';

interface SplitAllocationsProps {
  form: UseFormReturn<TransactionFormOutput>;
  /** Eligible expense sources (non-archived assets + cards). */
  accounts: AccountOption[];
}

function sourceMeta(acc: AccountOption): string {
  if (acc.type === 'CREDIT_CARD') {
    const pct = Math.round((acc.utilization ?? 0) * 100);
    return `${formatINR(acc.available)} available · ${pct}% used`;
  }
  if (acc.type === 'SAVINGS') {
    return `${formatINR(acc.available)} available · ${formatINR(acc.spendableAboveMin)} spendable`;
  }
  return `${formatINR(acc.available)} available`;
}

export function SplitAllocations({ form, accounts }: SplitAllocationsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'allocations'
  });

  const splitEnabled = form.watch('splitEnabled');
  const amount = Number(form.watch('amount')) || 0;
  const allocations = form.watch('allocations') || [];
  const byId = React.useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const allocatedSum = allocations.reduce(
    (s, a) => s + (Number(a?.amount) || 0),
    0
  );
  const remaining = amount - allocatedSum;
  const chosenIds = allocations.map((a) => a?.accountId).filter(Boolean);

  function toggleSplit(checked: boolean) {
    form.setValue('splitEnabled', checked, { shouldValidate: false });
    if (checked) {
      if (fields.length === 0) {
        const src = form.getValues('sourceAccountId');
        append({
          accountId: src || '',
          amount: (src ? amount : '') as any
        });
      }
    } else {
      const first = form.getValues('allocations')?.[0];
      if (first?.accountId) form.setValue('sourceAccountId', first.accountId);
      form.setValue('allocations', []);
    }
  }

  return (
    <div className='space-y-2.5'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-zinc-400'>Paid from</span>
        <label className='flex cursor-pointer items-center gap-2 text-xs text-zinc-400'>
          Split across accounts
          <Switch checked={!!splitEnabled} onCheckedChange={toggleSplit} />
        </label>
      </div>

      {!splitEnabled ? (
        <FormField
          control={form.control}
          name='sourceAccountId'
          render={({ field }) => (
            <FormItem className='space-y-1.5'>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger className='!h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                    <SelectValue placeholder='Choose an account' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                  {accounts.map((a) => (
                    <SelectItem
                      key={a.id}
                      value={a.id}
                      className='text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                    >
                      <span className='flex flex-col'>
                        <span>{a.name}</span>
                        <span className='text-xs text-zinc-500'>
                          {sourceMeta(a)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className='space-y-2.5'>
          {fields.map((f, index) => {
            const rowAccountId = allocations[index]?.accountId;
            const rowAmount = Number(allocations[index]?.amount) || 0;
            const acc = rowAccountId ? byId.get(rowAccountId) : undefined;
            const over =
              acc && acc.type !== 'CREDIT_CARD'
                ? rowAmount - acc.spendableAboveMin
                : 0;
            return (
              <div
                key={f.id}
                className='rounded-xl border border-zinc-800 bg-[#161618] p-2.5'
              >
                <div className='flex items-start gap-2'>
                  <FormField
                    control={form.control}
                    name={`allocations.${index}.accountId`}
                    render={({ field }) => (
                      <FormItem className='flex-1 space-y-1'>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger className='!h-11 w-full rounded-lg border-zinc-800/80 bg-[#18181b] px-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                              <SelectValue placeholder='Account' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                            {accounts.map((a) => (
                              <SelectItem
                                key={a.id}
                                value={a.id}
                                disabled={
                                  a.id !== rowAccountId &&
                                  chosenIds.includes(a.id)
                                }
                                className='text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                              >
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`allocations.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className='w-28 space-y-1'>
                        <FormControl>
                          <Input
                            type='number'
                            min='1'
                            placeholder='₹'
                            {...field}
                            value={field.value ?? ''}
                            className='h-11 rounded-lg border-zinc-800/80 bg-[#18181b] px-3 text-sm text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <button
                    type='button'
                    onClick={() => remove(index)}
                    className='mt-1.5 text-zinc-500 hover:text-rose-400'
                    aria-label='Remove account'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
                <div className='mt-1.5 flex items-center justify-between pl-1'>
                  <span
                    className={cn(
                      'text-xs',
                      over > 0 ? 'text-rose-400' : 'text-zinc-500'
                    )}
                  >
                    {acc
                      ? over > 0
                        ? `Exceeds spendable by ${formatINR(over)}`
                        : sourceMeta(acc)
                      : 'Select an account'}
                  </span>
                  <button
                    type='button'
                    onClick={() =>
                      form.setValue(
                        `allocations.${index}.amount`,
                        Math.max(0, remaining + rowAmount) as any,
                        { shouldValidate: true }
                      )
                    }
                    className='text-xs font-medium text-emerald-400 hover:underline'
                  >
                    Fill remaining
                  </button>
                </div>
              </div>
            );
          })}

          <Button
            type='button'
            variant='outline'
            onClick={() => append({ accountId: '', amount: '' as any })}
            className='h-9 w-full gap-1.5 rounded-lg border-dashed border-zinc-700 bg-transparent text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            <Plus className='h-3.5 w-3.5' />
            Add account
          </Button>

          {/* Allocation summary */}
          <div className='space-y-1.5 rounded-xl border border-zinc-800 bg-[#18181b] p-3'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-zinc-400'>
                Allocated {formatINR(allocatedSum)} of {formatINR(amount)}
              </span>
              <span
                className={cn(
                  'font-medium',
                  Math.abs(remaining) < 0.5
                    ? 'text-emerald-400'
                    : remaining < 0
                      ? 'text-rose-400'
                      : 'text-amber-400'
                )}
              >
                {Math.abs(remaining) < 0.5
                  ? 'Fully allocated ✓'
                  : remaining < 0
                    ? `Over by ${formatINR(-remaining)}`
                    : `${formatINR(remaining)} left`}
              </span>
            </div>
            <Progress
              value={
                amount > 0 ? Math.min(100, (allocatedSum / amount) * 100) : 0
              }
              className='h-1.5 bg-zinc-800'
            />
          </div>

          <FormField
            control={form.control}
            name='allocations'
            render={() => (
              <FormItem className='space-y-0'>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
