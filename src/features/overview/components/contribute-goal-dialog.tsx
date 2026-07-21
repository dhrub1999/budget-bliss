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
import { toast } from 'sonner';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { formatINR } from './overview-data';

export interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  color: string;
}

interface ContributeGoalDialogProps {
  goal: GoalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetAmount?: number;
  onSuccess?: () => void;
}

export function ContributeGoalDialog({
  goal,
  open,
  onOpenChange,
  presetAmount,
  onSuccess
}: ContributeGoalDialogProps) {
  const [amount, setAmount] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAmount(presetAmount ? presetAmount.toString() : '');
    }
  }, [open, presetAmount]);

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/goals/${goal.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount })
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        toast.success(
          `Successfully added ${formatINR(parsedAmount)} to ${goal.name}!`
        );
        if (data.isCompleted) {
          toast.success(
            `🎉 Congratulations! You have achieved your goal: ${goal.name}!`
          );
        }
        onOpenChange(false);
        if (onSuccess) onSuccess();
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to contribute to goal');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err.message || 'An error occurred');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border-zinc-800 bg-[#121214] p-6 text-white sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2.5 text-xl font-semibold tracking-tight text-white'>
            <div
              className='flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800'
              style={{ color: goal.color }}
            >
              <DynamicIcon emoji={goal.icon} className='h-5 w-5' />
            </div>
            <span>Top-up Goal: {goal.name}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5 rounded-xl border border-zinc-800/80 bg-[#18181b] p-4 text-xs text-zinc-400'>
            <div className='flex justify-between'>
              <span>Current Progress:</span>
              <span className='font-semibold text-white'>
                {formatINR(goal.savedAmount)} of {formatINR(goal.targetAmount)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Remaining Needed:</span>
              <span className='font-semibold text-emerald-400'>
                {formatINR(remaining)}
              </span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>
              Contribution Amount (₹)
            </Label>
            <Input
              type='number'
              min='1'
              step='any'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='Enter amount to add...'
              required
              autoFocus
              className='h-12 rounded-xl border-zinc-800 bg-[#18181b] text-lg text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500'
            />
          </div>

          {/* Quick preset buttons */}
          <div className='flex items-center gap-2 pt-1'>
            {[500, 1000, 5000, remaining].map((preset, idx) => {
              if (preset <= 0) return null;
              const label =
                idx === 3
                  ? 'Full Remaining'
                  : `+₹${preset.toLocaleString('en-IN')}`;
              return (
                <button
                  key={idx}
                  type='button'
                  onClick={() => setAmount(preset.toString())}
                  className='flex-1 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 text-center text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400'
                >
                  {label}
                </button>
              );
            })}
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
              {submitting ? 'Saving...' : 'Add Contribution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
