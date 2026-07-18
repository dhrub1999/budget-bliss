'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { CalendarIcon, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { type TransactionCategory } from './overview-data';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultType?: 'debit' | 'credit';
}

const expenseCategories: TransactionCategory[] = [
  'Groceries',
  'Dining Out',
  'Subscriptions',
  'Bills',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Others'
];

const incomeCategories: TransactionCategory[] = [
  'Salary',
  'Freelance',
  'Investment',
  'Others'
];

const expenseVendors = [
  'Swiggy',
  'Zomato',
  'Amazon',
  'Netflix',
  'Uber',
  'Ola Cabs',
  'Blinkit',
  'Big Basket',
  'Myntra',
  'Spotify',
  'Others'
];

const incomeVendors = [
  'Company Salary',
  'Freelance Client',
  'Stock Dividend',
  'Investment Return',
  'Others'
];

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
  const [type, setType] = React.useState<'debit' | 'credit'>(
    defaultType ?? 'debit'
  );
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<TransactionCategory>('Others');
  const [account, setAccount] = React.useState('Others');
  const [date, setDate] = React.useState<Date>(
    defaultDate ? parseDateString(defaultDate) : new Date()
  );
  const [notes, setNotes] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Sync with default values when dialog opens or defaults change
  React.useEffect(() => {
    if (defaultDate) setDate(parseDateString(defaultDate));
    if (defaultType) setType(defaultType);
  }, [defaultDate, defaultType, open]);

  // Adjust Category and Account selections if type changes
  React.useEffect(() => {
    if (type === 'debit') {
      if (!expenseCategories.includes(category)) {
        setCategory('Others');
      }
      if (!expenseVendors.includes(account)) {
        setAccount('Others');
      }
    } else {
      if (!incomeCategories.includes(category)) {
        setCategory('Others');
      }
      if (!incomeVendors.includes(account)) {
        setAccount('Others');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function formatFriendlyDate(dateObj: Date) {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission (no real DB in this demo)
    setTimeout(() => {
      setSubmitting(false);

      const successMessage =
        type === 'credit'
          ? `Successfully added income of ₹${Number(amount).toLocaleString('en-IN')} from ${account}!`
          : `Successfully added expense of ₹${Number(amount).toLocaleString('en-IN')} to ${account}!`;

      toast.success(successMessage);

      // Reset form fields
      setAmount('');
      setCategory('Others');
      setAccount('Others');
      setNotes('');
      setDate(new Date());
      onOpenChange(false);
    }, 600);
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
                onClick={() => setType('credit')}
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
                onClick={() => setType('debit')}
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

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          {/* Date Picker */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='txn-date'
              className='text-sm font-medium text-zinc-400'
            >
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='txn-date'
                  variant='outline'
                  className='relative h-12 w-full cursor-pointer justify-between rounded-xl border border-zinc-800/80 bg-[#18181b] px-4 text-left font-normal text-white hover:bg-zinc-900 hover:text-white focus:ring-1 focus:ring-emerald-500'
                >
                  <span className='text-zinc-200'>
                    {formatFriendlyDate(date)}
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
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className='rounded-xl border border-zinc-800 bg-[#18181b] text-white'
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount Input */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='txn-amount'
              className='text-sm font-medium text-zinc-400'
            >
              Amount
            </Label>
            <Input
              id='txn-amount'
              type='number'
              placeholder='Enter amount here'
              min='1'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0'
            />
          </div>

          {/* Category & Account Grid */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label
                htmlFor='txn-category'
                className='text-sm font-medium text-zinc-400'
              >
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TransactionCategory)}
              >
                <SelectTrigger
                  id='txn-category'
                  className='h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:ring-offset-0'
                >
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
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
            </div>

            <div className='space-y-1.5'>
              <Label
                htmlFor='txn-account'
                className='text-sm font-medium text-zinc-400'
              >
                Account
              </Label>
              <Select value={account} onValueChange={(v) => setAccount(v)}>
                <SelectTrigger
                  id='txn-account'
                  className='h-12 rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:ring-offset-0'
                >
                  <SelectValue placeholder='Select the vendor' />
                </SelectTrigger>
                <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                  {(type === 'credit' ? incomeVendors : expenseVendors).map(
                    (v) => (
                      <SelectItem
                        key={v}
                        value={v}
                        className='text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                      >
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes Field */}
          <div className='space-y-1.5'>
            <Label
              htmlFor='txn-notes'
              className='text-sm font-medium text-zinc-400'
            >
              Notes
            </Label>
            <Textarea
              id='txn-notes'
              placeholder='Anything for later..'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='min-h-[100px] w-full resize-none rounded-xl border-zinc-800/80 bg-[#18181b] p-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0'
            />
          </div>

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
      </DialogContent>
    </Dialog>
  );
}
