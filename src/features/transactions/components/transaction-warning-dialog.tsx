'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CreditCard,
  Banknote,
  Wallet,
  Landmark
} from 'lucide-react';
import type { TransactionWarning } from '@/features/accounts/lib/warnings';

const ICONS: Record<TransactionWarning['id'], React.ElementType> = {
  'card-util': CreditCard,
  'cash-large': Banknote,
  'wallet-cap': Wallet,
  'below-min': Landmark
};

interface TransactionWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warnings: TransactionWarning[];
  onProceed: () => void;
  onEnableSplit?: () => void;
}

export function TransactionWarningDialog({
  open,
  onOpenChange,
  warnings,
  onProceed,
  onEnableSplit
}: TransactionWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='rounded-2xl border-zinc-800 bg-[#121214] text-white'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-white'>
            <AlertTriangle className='h-5 w-5 text-amber-400' />
            {warnings.length > 1 ? 'A few things to check' : 'Just checking'}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-zinc-400'>
            Review before you continue — you can still proceed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='space-y-3'>
          {warnings.map((w, i) => {
            const Icon = ICONS[w.id] ?? AlertTriangle;
            return (
              <div
                key={`${w.id}-${i}`}
                className='flex gap-3 rounded-xl border border-zinc-800 bg-[#18181b] p-3'
              >
                <Icon className='mt-0.5 h-5 w-5 shrink-0 text-amber-400' />
                <div className='space-y-1'>
                  <p className='text-sm font-semibold text-white'>{w.title}</p>
                  <p className='text-xs leading-relaxed text-zinc-400'>
                    {w.body}
                  </p>
                  {w.action?.kind === 'enable-split' && onEnableSplit && (
                    <button
                      type='button'
                      onClick={() => {
                        onEnableSplit();
                        onOpenChange(false);
                      }}
                      className='mt-1 text-xs font-medium text-emerald-400 underline-offset-2 hover:underline'
                    >
                      {w.action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <AlertDialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='h-10 rounded-xl border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            Go back
          </Button>
          <Button
            type='button'
            onClick={onProceed}
            className='h-10 rounded-xl bg-amber-500 text-black hover:bg-amber-400'
          >
            Proceed anyway
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
