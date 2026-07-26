'use client';

import * as React from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { goalSchema, goalIcons } from '@/lib/validations/goal';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FieldErrors = Partial<
  Record<'name' | 'targetAmount' | 'savedAmount' | 'icon' | 'deadline', string>
>;

const inputClass =
  'h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500';
const labelClass = 'text-sm font-medium text-zinc-400';
const errorClass = 'text-xs text-rose-400';

export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const [name, setName] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [saved, setSaved] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [icon, setIcon] = React.useState<string>(goalIcons[0]);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  function resetForm() {
    setName('');
    setTarget('');
    setSaved('');
    setDeadline('');
    setIcon(goalIcons[0]);
    setErrors({});
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // ── Client-side Zod validation ──────────────────────────────────────
    const rawData = {
      name,
      targetAmount: target,
      savedAmount: saved || '0',
      icon,
      deadline
    };

    const parsed = goalSchema.safeParse(rawData);

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    // ── Submit to API route ─────────────────────────────────────────────
    setSubmitting(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawData)
      });

      const result = await response.json();

      if (!result) {
        toast.error('Session expired. Please refresh the page and try again.');
        return;
      }

      if (result.success) {
        toast.success('Goal created successfully!');
        resetForm();
        onOpenChange(false);
        // Trigger a page refresh to show new data
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to create goal');
      }
    } catch (err) {
      console.error('Goal creation failed:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[94vw] max-w-[440px] rounded-2xl border-zinc-800 bg-[#121214] p-4 text-white sm:p-6 [&>button]:hidden'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-white'>
            Add New Goal
          </DialogTitle>
          <DialogDescription className='text-xs text-zinc-400'>
            Set something you&apos;re saving towards. Progress updates when you
            add to it.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='flex min-h-0 flex-1 flex-col gap-4'
        >
          <DialogBody className='space-y-4 pt-2 pr-1'>
            {/* Goal name */}
            <div className='space-y-1.5'>
              <Label htmlFor='goal-name' className={labelClass}>
                Goal Name
              </Label>
              <Input
                id='goal-name'
                placeholder='e.g. Emergency Fund'
                className={inputClass}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            {/* Target & saved */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='goal-target' className={labelClass}>
                  Target Amount (₹)
                </Label>
                <Input
                  id='goal-target'
                  type='number'
                  placeholder='300000'
                  min='1'
                  className={inputClass}
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value);
                    clearError('targetAmount');
                  }}
                />
                {errors.targetAmount && (
                  <p className={errorClass}>{errors.targetAmount}</p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='goal-saved' className={labelClass}>
                  Already Saved (₹)
                </Label>
                <Input
                  id='goal-saved'
                  type='number'
                  placeholder='0'
                  min='0'
                  className={inputClass}
                  value={saved}
                  onChange={(e) => {
                    setSaved(e.target.value);
                    clearError('savedAmount');
                  }}
                />
                {errors.savedAmount && (
                  <p className={errorClass}>{errors.savedAmount}</p>
                )}
              </div>
            </div>

            {/* Icon picker */}
            <div className='space-y-1.5'>
              <Label className={labelClass}>Icon</Label>
              <div className='flex flex-wrap gap-2 pt-1'>
                {goalIcons.map((ic) => (
                  <button
                    key={ic}
                    type='button'
                    onClick={() => {
                      setIcon(ic);
                      clearError('icon');
                    }}
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
              {errors.icon && <p className={errorClass}>{errors.icon}</p>}
            </div>

            {/* Deadline */}
            <div className='space-y-1.5'>
              <Label htmlFor='goal-deadline' className={labelClass}>
                Target Deadline
              </Label>
              <Input
                id='goal-deadline'
                type='date'
                min={new Date().toISOString().split('T')[0]}
                className={inputClass}
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  clearError('deadline');
                }}
              />
              {errors.deadline && (
                <p className={errorClass}>{errors.deadline}</p>
              )}
            </div>
          </DialogBody>

          <DialogFooter className='flex-row gap-2 border-t border-zinc-800/60 pt-4 sm:justify-end'>
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
              {submitting ? 'Saving...' : 'Create goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
