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

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalIcons = ['🎯', '🏠', '✈️', '💻', '🚗', '🎓', '💍', '🌴'];

export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const [name, setName] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [saved, setSaved] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [icon, setIcon] = React.useState(goalIcons[0]);
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setName('');
      setTarget('');
      setSaved('');
      setDeadline('');
      setIcon(goalIcons[0]);
      onOpenChange(false);
    }, 600);
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
                  onClick={() => setIcon(i)}
                  className={`rounded-md p-2 text-xl transition-colors ${
                    icon === i
                      ? 'bg-primary/20 ring-primary ring-1'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='goal-name'>Goal Name</Label>
            <Input
              id='goal-name'
              placeholder='e.g. Emergency Fund'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='goal-saved'>Already Saved (₹)</Label>
              <Input
                id='goal-saved'
                type='number'
                placeholder='0'
                min='0'
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='goal-deadline'>Target Date</Label>
            <Input
              id='goal-deadline'
              type='date'
              min={new Date().toISOString().split('T')[0]}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <Button type='submit' className='w-full' disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
