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
import { goalIcons } from '@/lib/validations/goal';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

export interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  color: string;
  deadline: string;
  isCompleted?: boolean;
  completedAt?: string | null;
}

interface EditGoalDialogProps {
  goal: GoalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated?: () => void;
}

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
  onGoalUpdated
}: EditGoalDialogProps) {
  const [name, setName] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [saved, setSaved] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [icon, setIcon] = React.useState<string>(goalIcons[0]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (goal && open) {
      setName(goal.name);
      setTarget(goal.targetAmount.toString());
      setSaved(goal.savedAmount.toString());
      setIcon(goal.icon);
      const d = new Date(goal.deadline);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDeadline(`${yyyy}-${mm}-${dd}`);
    }
  }, [goal, open]);

  if (!goal) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          targetAmount: parseFloat(target),
          savedAmount: parseFloat(saved || '0'),
          icon,
          deadline: new Date(deadline).toISOString()
        })
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        toast.success('Goal updated successfully!');
        onOpenChange(false);
        if (onGoalUpdated) onGoalUpdated();
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to update goal');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err.message || 'An error occurred');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border-zinc-800 bg-[#121214] p-6 text-white sm:max-w-[440px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold tracking-tight text-white'>
            Edit Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          {/* Goal Name */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>
              Goal Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. New Laptop'
              required
              className='h-11 rounded-xl border-zinc-800 bg-[#18181b] text-white focus-visible:ring-emerald-500'
            />
          </div>

          {/* Target & Saved grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-sm font-medium text-zinc-400'>
                Target Amount (₹)
              </Label>
              <Input
                type='number'
                min='1'
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className='h-11 rounded-xl border-zinc-800 bg-[#18181b] text-white focus-visible:ring-emerald-500'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-sm font-medium text-zinc-400'>
                Already Saved (₹)
              </Label>
              <Input
                type='number'
                min='0'
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                className='h-11 rounded-xl border-zinc-800 bg-[#18181b] text-white focus-visible:ring-emerald-500'
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>Icon</Label>
            <div className='flex flex-wrap gap-2 pt-1'>
              {goalIcons.map((ic) => (
                <button
                  key={ic}
                  type='button'
                  onClick={() => setIcon(ic)}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all ${
                    icon === ic
                      ? 'scale-105 border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-zinc-800 bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <DynamicIcon emoji={ic} className='h-5 w-5' />
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium text-zinc-400'>
              Target Deadline
            </Label>
            <Input
              type='date'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className='h-11 rounded-xl border-zinc-800 bg-[#18181b] text-white focus-visible:ring-emerald-500'
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
