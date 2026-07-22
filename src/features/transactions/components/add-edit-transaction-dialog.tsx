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
  SelectItem,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  transactionSchema,
  type TransactionSchemaOutput,
  expenseCategories,
  incomeCategories,
  expenseVendors,
  incomeVendors
} from '@/lib/validations/transaction';

export interface TransactionRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string | null;
  date: Date | string;
}

interface AddEditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: TransactionRecord | null;
  onSuccess?: () => void;
}

function parseDate(val: Date | string | undefined): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseDescription(desc: string | null | undefined): {
  account: string;
  notes: string;
} {
  if (!desc || typeof desc !== 'string')
    return { account: 'Others', notes: '' };
  const parts = desc.split(': ');
  if (parts.length > 1) {
    return { account: parts[0] || 'Others', notes: parts.slice(1).join(': ') };
  }
  return { account: desc || 'Others', notes: '' };
}

export function AddEditTransactionDialog({
  open,
  onOpenChange,
  transactionToEdit,
  onSuccess
}: AddEditTransactionDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const isEditing = Boolean(transactionToEdit);

  const parsedDesc = React.useMemo(() => {
    return parseDescription(transactionToEdit?.description);
  }, [transactionToEdit]);

  const form = useForm<TransactionSchemaOutput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transactionToEdit?.type === 'INCOME' ? 'credit' : 'debit',
      amount: transactionToEdit?.amount ?? ('' as any),
      category: transactionToEdit?.category || 'Others',
      account: parsedDesc.account || 'Others',
      date: parseDate(transactionToEdit?.date),
      notes: parsedDesc.notes || ''
    }
  });

  const type = form.watch('type');
  const category = form.watch('category');
  const account = form.watch('account');

  // Reset form when dialog opens or editing transaction changes
  React.useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        const descInfo = parseDescription(transactionToEdit.description);
        form.reset({
          type: transactionToEdit.type === 'INCOME' ? 'credit' : 'debit',
          amount: transactionToEdit.amount,
          category: transactionToEdit.category || 'Others',
          account: descInfo.account || 'Others',
          date: parseDate(transactionToEdit.date),
          notes: descInfo.notes || ''
        });
      } else {
        form.reset({
          type: 'debit',
          amount: '' as any,
          category: 'Others',
          account: 'Others',
          date: new Date(),
          notes: ''
        });
      }
    }
  }, [open, transactionToEdit, form]);

  // Adjust Category and Account selections if type changes
  React.useEffect(() => {
    if (!open) return;
    if (type === 'debit') {
      const isCatValid = (expenseCategories as readonly string[]).includes(
        category
      );
      if (!isCatValid) {
        form.setValue('category', 'Others');
      }
      const isAccValid = (expenseVendors as readonly string[]).includes(
        account
      );
      if (!isAccValid) {
        form.setValue('account', 'Others');
      }
    } else {
      const isCatValid = (incomeCategories as readonly string[]).includes(
        category
      );
      if (!isCatValid) {
        form.setValue('category', 'Others');
      }
      const isAccValid = (incomeVendors as readonly string[]).includes(account);
      if (!isAccValid) {
        form.setValue('account', 'Others');
      }
    }
  }, [type, open, category, account, form]);

  const availableCategories = React.useMemo(() => {
    const list =
      type === 'credit'
        ? Array.from(incomeCategories)
        : Array.from(expenseCategories);
    if (category && !list.includes(category as any)) {
      list.push(category as any);
    }
    return list;
  }, [type, category]);

  const availableAccounts = React.useMemo(() => {
    const list =
      type === 'credit'
        ? Array.from(incomeVendors)
        : Array.from(expenseVendors);
    if (account && !list.includes(account as any)) {
      list.push(account as any);
    }
    return list;
  }, [type, account]);

  async function onSubmit(values: TransactionSchemaOutput) {
    setSubmitting(true);
    try {
      let response;
      if (isEditing && transactionToEdit) {
        response = await fetch(`/api/transactions/${transactionToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: values.amount,
            type: values.type,
            category: values.category,
            account: values.account,
            date: values.date.toISOString(),
            notes: values.notes?.trim() || undefined
          })
        });
      } else {
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: values.amount,
            type: values.type,
            category: values.category,
            account: values.account,
            date: values.date.toISOString(),
            notes: values.notes?.trim() || undefined
          })
        });
      }

      const result = await response.json();
      setSubmitting(false);

      if (result && result.success) {
        const successMessage = isEditing
          ? 'Successfully updated transaction!'
          : values.type === 'credit'
            ? `Successfully added income of ₹${Number(values.amount).toLocaleString('en-IN')}!`
            : `Successfully added expense of ₹${Number(values.amount).toLocaleString('en-IN')}!`;

        toast.success(successMessage);

        if (result.budgetAlert) {
          const { status, category: catName, pct } = result.budgetAlert;
          if (status === 'EXCEEDED') {
            toast.error(
              `⚠️ Budget Alert: You have EXCEEDED your ${catName} budget! (${pct}% spent)`
            );
          } else if (status === 'WARNING') {
            toast.warning(
              `⚠️ Budget Warning: You have reached ${pct}% of your ${catName} budget limit.`
            );
          }
        }

        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result?.error || 'Failed to save transaction');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err?.message || 'An error occurred while saving');
    }
  }

  return (
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 pt-2'
          >
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
                        selected={field.value}
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
                name='account'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Account / Vendor
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'Others'}
                    >
                      <FormControl>
                        <SelectTrigger className='!h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
                          <SelectValue placeholder='Account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                        {availableAccounts.map((v) => (
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
                      className='min-h-[90px] w-full resize-none rounded-xl border-zinc-800/80 bg-[#18181b] p-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center gap-3 pt-3'>
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
  );
}
