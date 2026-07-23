'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { CalendarIcon, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  transactionFormSchema,
  type TransactionFormOutput,
  expenseCategories,
  incomeCategories,
  expenseVendors,
  incomeVendors
} from '@/lib/validations/transaction';
import type { AccountOption } from '@/features/accounts/types';
import {
  computeTransactionWarnings,
  type TransactionWarning
} from '@/features/accounts/lib/warnings';
import { formatINR } from '@/features/overview/components/overview-data';
import { SplitAllocations } from './split-allocations';
import { TransactionWarningDialog } from './transaction-warning-dialog';

export interface TransactionRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string | null;
  date: Date | string;
  accountId?: string | null;
  goalId?: string | null;
}

export interface GoalOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: AccountOption[];
  goals?: GoalOption[];
  transactionToEdit?: TransactionRecord | null;
  defaultType?: 'credit' | 'debit';
  defaultAccountId?: string;
  defaultDate?: string;
  onSuccess?: () => void;
}

function parseDate(val: Date | string | undefined): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseDescription(desc: string | null | undefined): {
  vendor: string;
  notes: string;
} {
  if (!desc || typeof desc !== 'string') return { vendor: 'Others', notes: '' };
  const parts = desc.split(': ');
  if (parts.length > 1) {
    return { vendor: parts[0] || 'Others', notes: parts.slice(1).join(': ') };
  }
  return { vendor: desc || 'Others', notes: '' };
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  accounts,
  goals = [],
  transactionToEdit,
  defaultType = 'debit',
  defaultAccountId,
  defaultDate,
  onSuccess
}: TransactionFormDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [warnings, setWarnings] = React.useState<TransactionWarning[]>([]);
  const [warnOpen, setWarnOpen] = React.useState(false);
  const isEditing = Boolean(transactionToEdit);

  const activeAccounts = React.useMemo(
    () => accounts.filter((a) => !a.isArchived),
    [accounts]
  );
  const assetAccounts = React.useMemo(
    () => activeAccounts.filter((a) => a.type !== 'CREDIT_CARD'),
    [activeAccounts]
  );
  const cardAccounts = React.useMemo(
    () => activeAccounts.filter((a) => a.type === 'CREDIT_CARD'),
    [activeAccounts]
  );
  const savingsAccounts = assetAccounts.filter((a) => a.type === 'SAVINGS');
  const walletAccounts = assetAccounts.filter((a) => a.type === 'WALLET');
  const cashAccounts = assetAccounts.filter((a) => a.type === 'CASH');

  const buildDefaults = React.useCallback((): TransactionFormOutput => {
    if (transactionToEdit) {
      const d = parseDescription(transactionToEdit.description);
      const isIncome = transactionToEdit.type === 'INCOME';
      return {
        type: isIncome ? 'credit' : 'debit',
        amount: transactionToEdit.amount as any,
        category: transactionToEdit.category || 'Others',
        vendor: d.vendor || 'Others',
        date: parseDate(transactionToEdit.date),
        notes: d.notes || '',
        destinationAccountId: isIncome
          ? (transactionToEdit.accountId ?? undefined)
          : undefined,
        goalId: transactionToEdit.goalId ?? undefined,
        splitEnabled: false,
        sourceAccountId: !isIncome
          ? (transactionToEdit.accountId ?? undefined)
          : undefined,
        allocations: [],
        override: false
      };
    }
    return {
      type: defaultType,
      amount: '' as any,
      category: 'Others',
      vendor: 'Others',
      date: defaultDate ? parseDate(defaultDate) : new Date(),
      notes: '',
      destinationAccountId:
        defaultType === 'credit' ? defaultAccountId : undefined,
      goalId: undefined,
      splitEnabled: false,
      sourceAccountId: defaultType === 'debit' ? defaultAccountId : undefined,
      allocations: [],
      override: false
    };
  }, [transactionToEdit, defaultType, defaultAccountId, defaultDate]);

  const form = useForm<TransactionFormOutput>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: buildDefaults()
  });

  const type = form.watch('type');
  const category = form.watch('category');
  const vendor = form.watch('vendor');
  const goalId = form.watch('goalId');
  const destinationAccountId = form.watch('destinationAccountId');

  React.useEffect(() => {
    if (open) form.reset(buildDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transactionToEdit]);

  // Keep category/vendor valid when the income/expense type flips.
  React.useEffect(() => {
    if (!open) return;
    const cats = type === 'credit' ? incomeCategories : expenseCategories;
    const vends = type === 'credit' ? incomeVendors : expenseVendors;
    if (!(cats as readonly string[]).includes(category))
      form.setValue('category', 'Others');
    if (!(vends as readonly string[]).includes(vendor))
      form.setValue('vendor', 'Others');
  }, [type, open, category, vendor, form]);

  const availableCategories = React.useMemo(() => {
    const list =
      type === 'credit'
        ? Array.from(incomeCategories)
        : Array.from(expenseCategories);
    if (category && !list.includes(category as any)) list.push(category as any);
    return list;
  }, [type, category]);

  const availableVendors = React.useMemo(() => {
    const list =
      type === 'credit'
        ? Array.from(incomeVendors)
        : Array.from(expenseVendors);
    if (vendor && !list.includes(vendor as any)) list.push(vendor as any);
    return list;
  }, [type, vendor]);

  const destValue = goalId
    ? `goal:${goalId}`
    : destinationAccountId
      ? `acct:${destinationAccountId}`
      : '';

  function onDestChange(value: string) {
    if (value.startsWith('goal:')) {
      form.setValue('goalId', value.slice(5), { shouldValidate: true });
    } else {
      form.setValue('goalId', undefined);
      form.setValue('destinationAccountId', value.slice(5), {
        shouldValidate: true
      });
    }
  }

  function currentWarningInput(values: TransactionFormOutput) {
    return {
      type: values.type,
      amount: Number(values.amount) || 0,
      destinationAccountId: values.destinationAccountId,
      goalId: values.goalId,
      splitEnabled: values.splitEnabled,
      sourceAccountId: values.sourceAccountId,
      allocations: (values.allocations ?? []).map((a) => ({
        accountId: a.accountId,
        amount: Number(a.amount) || 0
      }))
    };
  }

  async function doSubmit(values: TransactionFormOutput, override: boolean) {
    setSubmitting(true);
    try {
      const base = {
        type: values.type,
        category: values.category,
        vendor: values.vendor,
        date: values.date.toISOString(),
        notes: values.notes?.trim() || undefined,
        override
      };

      let response: Response;
      if (isEditing && transactionToEdit) {
        const accountId =
          values.type === 'credit'
            ? values.destinationAccountId
            : values.sourceAccountId;
        response = await fetch(`/api/transactions/${transactionToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...base,
            amount: Number(values.amount),
            accountId: accountId || undefined,
            goalId: values.type === 'credit' ? values.goalId : undefined
          })
        });
      } else {
        const payload: Record<string, unknown> = { ...base };
        if (values.type === 'credit') {
          payload.amount = Number(values.amount);
          payload.destinationAccountId = values.destinationAccountId;
          payload.goalId = values.goalId;
        } else {
          payload.amount = Number(values.amount);
          payload.allocations = values.splitEnabled
            ? (values.allocations ?? []).map((a) => ({
                accountId: a.accountId,
                amount: Number(a.amount)
              }))
            : [
                {
                  accountId: values.sourceAccountId,
                  amount: Number(values.amount)
                }
              ];
        }
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();
      setSubmitting(false);

      if (result?.success) {
        toast.success(
          isEditing
            ? 'Successfully updated transaction!'
            : values.type === 'credit'
              ? `Added income of ${formatINR(Number(values.amount))}!`
              : `Added expense of ${formatINR(Number(values.amount))}!`
        );
        if (result.budgetAlert) {
          const { status, category: catName, pct } = result.budgetAlert;
          if (status === 'EXCEEDED')
            toast.error(
              `⚠️ Budget Alert: You have EXCEEDED your ${catName} budget! (${pct}% spent)`
            );
          else if (status === 'WARNING')
            toast.warning(
              `⚠️ Budget Warning: reached ${pct}% of your ${catName} budget.`
            );
        }
        form.reset(buildDefaults());
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result?.error || 'Failed to save transaction');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err?.message || 'An error occurred while saving');
    }
  }

  function onValid(values: TransactionFormOutput) {
    const found = computeTransactionWarnings(
      currentWarningInput(values),
      accounts
    );
    if (found.length > 0) {
      setWarnings(found);
      setWarnOpen(true);
      return;
    }
    doSubmit(values, false);
  }

  function enableSplitFromWarning() {
    const values = form.getValues();
    form.setValue('splitEnabled', true);
    const src = values.sourceAccountId;
    const total = Number(values.amount) || 0;
    const acc = accounts.find((a) => a.id === src);
    if (acc && acc.type === 'SAVINGS') {
      const capped = Math.max(0, Math.min(total, acc.spendableAboveMin));
      form.setValue('allocations', [
        { accountId: src!, amount: capped as any },
        { accountId: '', amount: Math.max(0, total - capped) as any }
      ]);
    } else if (src) {
      form.setValue('allocations', [{ accountId: src, amount: total as any }]);
    }
  }

  const noAccounts = activeAccounts.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[90vh] w-[94vw] max-w-[440px] overflow-y-auto rounded-2xl border-zinc-800 bg-[#121214] p-4 text-white sm:p-6 [&>button]:hidden'>
          <DialogHeader className='flex-row items-center justify-between space-y-0 pb-2'>
            <DialogTitle className='text-xl font-semibold tracking-tight text-white'>
              {isEditing ? 'Edit Transaction' : 'Add New Record'}
            </DialogTitle>
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'text-sm font-semibold tracking-wide transition-colors duration-200',
                  type === 'credit' ? 'text-green-500' : 'text-rose-500'
                )}
              >
                {type === 'credit' ? 'Income' : 'Expense'}
              </span>
              <div className='flex h-9 items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-1'>
                <button
                  type='button'
                  onClick={() => form.setValue('type', 'credit')}
                  className={cn(
                    'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full p-1.5 transition-all duration-200 focus:outline-none',
                    type === 'credit'
                      ? 'scale-105 bg-[#00c853] text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                  title='Switch to Income'
                >
                  <Download className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => form.setValue('type', 'debit')}
                  className={cn(
                    'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full p-1.5 transition-all duration-200 focus:outline-none',
                    type === 'debit'
                      ? 'scale-105 bg-[#f43f5e] text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                  title='Switch to Expense'
                >
                  <Upload className='h-4 w-4' />
                </button>
              </div>
            </div>
          </DialogHeader>

          {noAccounts && (
            <div className='rounded-xl border border-zinc-800 bg-[#18181b] p-3 text-sm text-zinc-400'>
              You have no accounts yet.{' '}
              <Link
                href='/dashboard/accounts'
                className='font-medium text-emerald-400 hover:underline'
              >
                Add one
              </Link>{' '}
              to track where money comes from and goes.
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onValid)}
              className='space-y-4 pt-2'
            >
              {/* Date */}
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Date
                    </FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className='relative h-12 w-full cursor-pointer justify-between rounded-xl border border-zinc-800/80 bg-[#18181b] px-4 text-left font-normal text-white hover:bg-zinc-900 hover:text-white'
                          >
                            <span className='text-zinc-200'>
                              {field.value
                                ? new Date(field.value).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    }
                                  )
                                : 'Select date'}
                            </span>
                            <CalendarIcon className='absolute right-4 h-5 w-5 text-zinc-400' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-auto border-zinc-800 bg-[#18181b] p-0 text-white'
                        align='start'
                      >
                        <Calendar
                          mode='single'
                          selected={field.value as Date}
                          onSelect={field.onChange}
                          initialFocus
                          className='rounded-xl border border-zinc-800 bg-[#18181b] text-white'
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Amount (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter amount'
                        min='1'
                        {...field}
                        className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category + Vendor */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-sm font-medium text-zinc-400'>
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'Others'}
                      >
                        <FormControl>
                          <SelectTrigger className='!h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                            <SelectValue placeholder='Category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                          {availableCategories.map((c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className='text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                            >
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vendor'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-sm font-medium text-zinc-400'>
                        Vendor / Merchant
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'Others'}
                      >
                        <FormControl>
                          <SelectTrigger className='!h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                            <SelectValue placeholder='Vendor' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                          {availableVendors.map((v) => (
                            <SelectItem
                              key={v}
                              value={v}
                              className='text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                            >
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Account section */}
              {type === 'credit' ? (
                <FormField
                  control={form.control}
                  name='destinationAccountId'
                  render={() => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-sm font-medium text-zinc-400'>
                        Deposited to
                      </FormLabel>
                      <Select value={destValue} onValueChange={onDestChange}>
                        <FormControl>
                          <SelectTrigger className='!h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                            <SelectValue placeholder='Where did it go?' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                          {savingsAccounts.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className='text-zinc-500'>
                                Savings
                              </SelectLabel>
                              {savingsAccounts.map((a) => (
                                <SelectItem
                                  key={a.id}
                                  value={`acct:${a.id}`}
                                  className='text-white focus:bg-zinc-800 focus:text-white'
                                >
                                  {a.name} — {formatINR(a.balance)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {walletAccounts.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className='text-zinc-500'>
                                Wallets
                              </SelectLabel>
                              {walletAccounts.map((a) => (
                                <SelectItem
                                  key={a.id}
                                  value={`acct:${a.id}`}
                                  className='text-white focus:bg-zinc-800 focus:text-white'
                                >
                                  {a.name} — {formatINR(a.balance)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {cashAccounts.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className='text-zinc-500'>
                                Cash
                              </SelectLabel>
                              {cashAccounts.map((a) => (
                                <SelectItem
                                  key={a.id}
                                  value={`acct:${a.id}`}
                                  className='text-white focus:bg-zinc-800 focus:text-white'
                                >
                                  {a.name} — {formatINR(a.balance)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {cardAccounts.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className='text-zinc-500'>
                                Repay a card
                              </SelectLabel>
                              {cardAccounts.map((a) => (
                                <SelectItem
                                  key={a.id}
                                  value={`acct:${a.id}`}
                                  className='text-white focus:bg-zinc-800 focus:text-white'
                                >
                                  Repay {a.name} — {formatINR(a.owed ?? 0)} owed
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {goals.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className='text-zinc-500'>
                                Goals
                              </SelectLabel>
                              {goals.map((g) => (
                                <SelectItem
                                  key={g.id}
                                  value={`goal:${g.id}`}
                                  className='text-white focus:bg-zinc-800 focus:text-white'
                                >
                                  {g.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      {goalId && (
                        <p className='text-xs text-zinc-500'>
                          This reduces the card&apos;s outstanding, or funds a
                          goal.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <SplitAllocations form={form} accounts={activeAccounts} />
              )}

              {/* Backing account for a goal contribution */}
              {type === 'credit' && goalId && (
                <FormField
                  control={form.control}
                  name='destinationAccountId'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-sm font-medium text-zinc-400'>
                        Held in which account?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className='!h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                            <SelectValue placeholder='Choose the backing account' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                          {assetAccounts.map((a) => (
                            <SelectItem
                              key={a.id}
                              value={a.id}
                              className='text-white focus:bg-zinc-800 focus:text-white'
                            >
                              {a.name} — {formatINR(a.balance)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className='text-xs text-zinc-500'>
                        Goal savings are tracked separately, but the money sits
                        in this account.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Notes */}
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Notes (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Additional details...'
                        {...field}
                        className='min-h-[70px] w-full resize-none rounded-xl border-zinc-800/80 bg-[#18181b] p-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex items-center gap-3 pt-2'>
                <Button
                  type='submit'
                  disabled={submitting}
                  className={cn(
                    'h-12 w-[70%] cursor-pointer rounded-xl border-0 text-base font-medium text-white shadow-lg transition-all duration-200',
                    type === 'credit'
                      ? 'bg-[#00c853] hover:bg-[#00b24a]'
                      : 'bg-[#f43f5e] hover:bg-[#e11d48]'
                  )}
                >
                  {submitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Transaction'
                      : type === 'credit'
                        ? 'Add Income'
                        : 'Add Expense'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  className='h-12 w-[30%] cursor-pointer rounded-xl border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <TransactionWarningDialog
        open={warnOpen}
        onOpenChange={setWarnOpen}
        warnings={warnings}
        onProceed={() => {
          setWarnOpen(false);
          doSubmit(form.getValues(), true);
        }}
        onEnableSplit={enableSplitFromWarning}
      />
    </>
  );
}
