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
import { type TransactionCategory } from './overview-data';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultType?: 'debit' | 'credit';
}

const categories: TransactionCategory[] = [
  'Groceries',
  'Dining Out',
  'Subscriptions',
  'Bills',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Salary',
  'Freelance',
  'Investment',
  'Others'
];

export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultType
}: AddTransactionDialogProps) {
  const [type, setType] = React.useState<'debit' | 'credit'>(
    defaultType ?? 'debit'
  );
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<TransactionCategory>('Others');
  const [date, setDate] = React.useState(
    defaultDate ?? new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (defaultDate) setDate(defaultDate);
    if (defaultType) setType(defaultType);
  }, [defaultDate, defaultType]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission (no real DB in this demo)
    setTimeout(() => {
      setSubmitting(false);
      setTitle('');
      setAmount('');
      setCategory('Others');
      onOpenChange(false);
    }, 600);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Type toggle */}
          <div className='grid grid-cols-2 gap-2'>
            <Button
              type='button'
              variant={type === 'debit' ? 'default' : 'outline'}
              onClick={() => setType('debit')}
              className={
                type === 'debit' ? 'bg-red-500 text-white hover:bg-red-600' : ''
              }
            >
              💸 Expense
            </Button>
            <Button
              type='button'
              variant={type === 'credit' ? 'default' : 'outline'}
              onClick={() => setType('credit')}
              className={
                type === 'credit'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : ''
              }
            >
              💰 Income
            </Button>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='txn-title'>Title</Label>
            <Input
              id='txn-title'
              placeholder='e.g. Swiggy Order'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='txn-amount'>Amount (₹)</Label>
            <Input
              id='txn-amount'
              type='number'
              placeholder='0'
              min='1'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='txn-category'>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as TransactionCategory)}
            >
              <SelectTrigger id='txn-category'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='txn-date'>Date</Label>
            <Input
              id='txn-date'
              type='date'
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type='submit' className='w-full' disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
