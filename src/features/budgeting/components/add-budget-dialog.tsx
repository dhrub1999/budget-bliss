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
import { toast } from 'sonner';
import { expenseCategories } from '@/lib/validations/transaction';

interface AddBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
  defaultPeriod?: 'MONTHLY' | 'YEARLY';
  defaultAmount?: number;
  onSuccess?: () => void;
}

export function AddBudgetDialog({
  open,
  onOpenChange,
  defaultCategory = 'TOTAL',
  defaultPeriod = 'MONTHLY',
  defaultAmount,
  onSuccess
}: AddBudgetDialogProps) {
  const [category, setCategory] = React.useState('TOTAL');
  const [period, setPeriod] = React.useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [amount, setAmount] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCategory(defaultCategory);
      setPeriod(defaultPeriod);
      setAmount(defaultAmount ? defaultAmount.toString() : '');
    }
  }, [open, defaultCategory, defaultPeriod, defaultAmount]);

  const categoriesList = ['TOTAL', ...expenseCategories];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid positive budget amount');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: parsedAmount,
          period
        })
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        toast.success(
          `Budget limit set for ${category === 'TOTAL' ? 'Total Expenses' : category} (${period.toLowerCase()})!`
        );
        onOpenChange(false);
        if (onSuccess) onSuccess();
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to save budget');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err.message || 'An error occurred while saving');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border-zinc-800 bg-[#121214] p-6 text-white sm:max-w-[440px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold tracking-tight text-white'>
            Set Budget Limit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          {/* Period Selection (Monthly vs Yearly) */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>
              Budget Frequency
            </Label>
            <div className='grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-[#18181b] p-1'>
              <button
                type='button'
                onClick={() => setPeriod('MONTHLY')}
                className={`cursor-pointer rounded-lg py-2 text-xs font-semibold transition-all ${
                  period === 'MONTHLY'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly Budget
              </button>
              <button
                type='button'
                onClick={() => setPeriod('YEARLY')}
                className={`cursor-pointer rounded-lg py-2 text-xs font-semibold transition-all ${
                  period === 'YEARLY'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Yearly Budget
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className='!h-11 w-full rounded-xl border-zinc-800 bg-[#18181b] text-white focus:ring-emerald-500'>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                {categoriesList.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className='hover:bg-zinc-800 focus:bg-zinc-800'
                  >
                    {cat === 'TOTAL' ? '🎯 Overall Total Budget' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>
              Budget Limit Amount (₹)
            </Label>
            <Input
              type='number'
              min='1'
              step='any'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='e.g. 15000'
              required
              className='h-11 rounded-xl border-zinc-800 bg-[#18181b] text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500'
            />
          </div>

          <div className='flex items-center justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-11 border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={submitting}
              className='h-11 bg-[#4ade80] font-semibold text-black hover:bg-[#22c55e]'
            >
              {submitting ? 'Saving...' : 'Set Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
