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

import { goalSchema, goalIcons, iconColorMap } from '@/lib/validations/goal';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FieldErrors = Partial<
  Record<'name' | 'targetAmount' | 'savedAmount' | 'icon' | 'deadline', string>
>;

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
    console.log(parsed, rawData + ' ' + 'The data');

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
      console.log(
        '[DEBUG] createGoal API result:',
        JSON.stringify(result),
        typeof result,
        result
      );

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
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Icon picker */}
          <div className='space-y-2'>
            <Label>Icon</Label>
            <div className='flex flex-wrap gap-2'>
              {goalIcons.map((i) => (
                <button
                  key={i}
                  type='button'
                  onClick={() => {
                    setIcon(i);
                    if (errors.icon) {
                      setErrors((prev) => ({ ...prev, icon: undefined }));
                    }
                  }}
                  className={`rounded-md p-2 text-xl transition-colors ${
                    icon === i ? 'ring-1' : 'bg-muted hover:bg-muted/80'
                  }`}
                  style={
                    icon === i
                      ? {
                          backgroundColor: `${iconColorMap[i]}33`,
                          borderColor: iconColorMap[i],
                          boxShadow: `0 0 0 1px ${iconColorMap[i]}`
                        }
                      : undefined
                  }
                >
                  <DynamicIcon emoji={i} className='h-5 w-5' />
                </button>
              ))}
            </div>
            {errors.icon && (
              <p className='text-destructive text-xs'>{errors.icon}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='goal-name'>Goal Name</Label>
            <Input
              id='goal-name'
              placeholder='e.g. Emergency Fund'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
            />
            {errors.name && (
              <p className='text-destructive text-xs'>{errors.name}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='goal-target'>Target Amount (₹)</Label>
              <Input
                id='goal-target'
                type='number'
                placeholder='300000'
                min='1'
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  if (errors.targetAmount) {
                    setErrors((prev) => ({
                      ...prev,
                      targetAmount: undefined
                    }));
                  }
                }}
              />
              {errors.targetAmount && (
                <p className='text-destructive text-xs'>
                  {errors.targetAmount}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='goal-saved'>Already Saved (₹)</Label>
              <Input
                id='goal-saved'
                type='number'
                placeholder='0'
                min='0'
                value={saved}
                onChange={(e) => {
                  setSaved(e.target.value);
                  if (errors.savedAmount) {
                    setErrors((prev) => ({
                      ...prev,
                      savedAmount: undefined
                    }));
                  }
                }}
              />
              {errors.savedAmount && (
                <p className='text-destructive text-xs'>{errors.savedAmount}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='goal-deadline'>Target Date</Label>
            <Input
              id='goal-deadline'
              type='date'
              min={new Date().toISOString().split('T')[0]}
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                if (errors.deadline) {
                  setErrors((prev) => ({ ...prev, deadline: undefined }));
                }
              }}
            />
            {errors.deadline && (
              <p className='text-destructive text-xs'>{errors.deadline}</p>
            )}
          </div>

          <Button type='submit' className='w-full' disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
