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

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultType?: 'debit' | 'credit';
}

// Helper to safely parse YYYY-MM-DD local dates
function parseDateString(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultType
}: AddTransactionDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<TransactionSchemaOutput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType ?? 'debit',
      amount: '' as any,
      category: 'Others',
      account: 'Others',
      date: defaultDate ? parseDateString(defaultDate) : new Date(),
      notes: ''
    }
  });

  const type = form.watch('type');
  const category = form.watch('category');
  const account = form.watch('account');

  // Reset form when dialog visibility or defaults change
  React.useEffect(() => {
    if (open) {
      form.reset({
        type: defaultType ?? 'debit',
        amount: '' as any,
        category: 'Others',
        account: 'Others',
        date: defaultDate ? parseDateString(defaultDate) : new Date(),
        notes: ''
      });
    }
  }, [defaultDate, defaultType, open, form]);

  // Adjust Category and Account selections if type changes
  React.useEffect(() => {
    if (type === 'debit') {
      if (!expenseCategories.includes(category as any)) {
        form.setValue('category', 'Others');
      }
      if (!expenseVendors.includes(account as any)) {
        form.setValue('account', 'Others');
      }
    } else {
      if (!incomeCategories.includes(category as any)) {
        form.setValue('category', 'Others');
      }
      if (!incomeVendors.includes(account as any)) {
        form.setValue('account', 'Others');
      }
    }
  }, [type, category, account, form]);

  function formatFriendlyDate(dateObj: Date) {
    if (!dateObj) return '';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    const isYesterday =
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  async function onSubmit(values: TransactionSchemaOutput) {
    setSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
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

      const result = await response.json();
      console.log('Transaction API response:', result);
      setSubmitting(false);

      if (result && result.success) {
        const successMessage =
          values.type === 'credit'
            ? `Successfully added income of ₹${Number(values.amount).toLocaleString('en-IN')} from ${values.account}!`
            : `Successfully added expense of ₹${Number(values.amount).toLocaleString('en-IN')} to ${values.account}!`;

        toast.success(successMessage);

        form.reset();
        onOpenChange(false);

        // Trigger a page refresh to show new data
        window.location.reload();
      } else {
        toast.error(result?.error || 'Failed to add transaction');
      }
    } catch (error: any) {
      setSubmitting(false);
      toast.error(error.message || 'An error occurred while saving');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border-zinc-800 bg-[#121214] p-6 text-white sm:max-w-[440px] [&>button]:hidden'>
        <DialogHeader className='flex-row items-center justify-between space-y-0 pb-2'>
          <DialogTitle className='text-xl font-semibold tracking-tight text-white'>
            Add New Record
          </DialogTitle>

          {/* Switch Trigger */}
          <div className='flex items-center gap-2'>
            <span
              className={cn(
                'text-sm font-semibold tracking-wide transition-colors duration-200',
                type === 'credit' ? 'text-green-500' : 'text-rose-500'
              )}
            >
              {type === 'credit' ? 'Income' : 'Expense'}
            </span>
            <div className='border-zinc-850 flex h-9 items-center gap-1 rounded-full border bg-zinc-900 p-1'>
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
            {/* Date Picker */}
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
                          id='txn-date'
                          variant='outline'
                          className='relative h-12 w-full cursor-pointer justify-between rounded-xl border border-zinc-800/80 bg-[#18181b] px-4 text-left font-normal text-white hover:bg-zinc-900 hover:text-white focus:ring-1 focus:ring-emerald-500'
                        >
                          <span className='text-zinc-200'>
                            {formatFriendlyDate(field.value)}
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

            {/* Amount Input */}
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='text-sm font-medium text-zinc-400'>
                    Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='txn-amount'
                      type='number'
                      placeholder='Enter amount here'
                      min='1'
                      {...field}
                      className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category & Account Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          id='txn-category'
                          className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:ring-offset-0'
                        >
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                        {(type === 'credit'
                          ? incomeCategories
                          : expenseCategories
                        ).map((c) => (
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
                      Account
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          id='txn-account'
                          className='h-12 rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:ring-offset-0'
                        >
                          <SelectValue placeholder='Select the vendor' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                        {(type === 'credit'
                          ? incomeVendors
                          : expenseVendors
                        ).map((v) => (
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

            {/* Notes Field */}
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='text-sm font-medium text-zinc-400'>
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id='txn-notes'
                      placeholder='Anything for later..'
                      {...field}
                      className='min-h-[100px] w-full resize-none rounded-xl border-zinc-800/80 bg-[#18181b] p-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className='flex items-center gap-3 pt-4'>
              <Button
                type='submit'
                disabled={submitting}
                className={cn(
                  'h-12 w-[72%] cursor-pointer rounded-xl border-0 text-base font-medium text-white shadow-lg transition-all duration-200 focus:outline-none',
                  type === 'credit'
                    ? 'bg-[#00c853] hover:bg-[#00b24a] active:scale-[0.98]'
                    : 'bg-[#f43f5e] hover:bg-[#e11d48] active:scale-[0.98]'
                )}
              >
                {submitting
                  ? 'Saving...'
                  : type === 'credit'
                    ? 'Add Income'
                    : 'Add Expense'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='h-12 w-[28%] cursor-pointer rounded-xl border border-zinc-800 bg-transparent text-base font-medium text-zinc-300 transition-all duration-200 hover:bg-zinc-800/40 hover:text-white active:scale-[0.98]'
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
