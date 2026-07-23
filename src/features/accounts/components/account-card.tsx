'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Landmark,
  CreditCard as CreditCardIcon,
  Wallet,
  Banknote,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  formatINR,
  formatINRFull
} from '@/features/overview/components/overview-data';
import {
  UTIL_AMBER,
  UTIL_ROSE,
  WALLET_CAP
} from '@/features/accounts/constants';
import type { AccountOption } from '@/features/accounts/types';
import type { AccountType } from '@/lib/accounts/balances';
import { AddEditAccountDialog } from './add-edit-account-dialog';

const TYPE_ICON: Record<
  AccountType,
  React.ComponentType<{ className?: string }>
> = {
  SAVINGS: Landmark,
  CREDIT_CARD: CreditCardIcon,
  WALLET: Wallet,
  CASH: Banknote
};

function utilizationColor(util: number) {
  if (util < UTIL_AMBER) return 'emerald';
  if (util < UTIL_ROSE) return 'amber';
  return 'rose';
}

interface AccountCardProps {
  account: AccountOption;
}

export function AccountCard({ account }: AccountCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const TypeIcon = TYPE_ICON[account.type];
  const badgeText =
    account.provider ||
    (account.type === 'CREDIT_CARD' && account.brand
      ? account.brand
      : account.type.replace('_', ' ').toLowerCase());

  const goToDetail = () => router.push(`/dashboard/accounts/${account.id}`);

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete "${account.name}"? Accounts with history are archived instead.`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setDeleting(false);
      if (data && data.success) {
        toast.success(data.archived ? 'Account archived' : 'Account deleted');
        router.refresh();
      } else {
        toast.error(data?.error || 'Failed to delete account');
      }
    } catch (err: any) {
      setDeleting(false);
      toast.error(err?.message || 'Error deleting account');
    }
  };

  const util = account.utilization ?? 0;
  const utilPct = Math.round(util * 100);
  const utilColor = utilizationColor(util);

  const walletCap = account.maxBalance || WALLET_CAP;
  const walletPct =
    walletCap > 0 ? Math.min(100, (account.balance / walletCap) * 100) : 0;

  const savingsMin = account.minimumBalance ?? 0;
  const savingsPct =
    account.balance > 0
      ? Math.min(100, (account.spendableAboveMin / account.balance) * 100)
      : 0;

  return (
    <>
      <Card
        onClick={goToDetail}
        className='cursor-pointer gap-0 border-zinc-800 bg-[#141416] p-4 transition-colors hover:border-zinc-700 hover:bg-[#18181b]'
      >
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex min-w-0 items-center gap-2.5'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] text-emerald-400'>
              <TypeIcon className='h-4 w-4' />
            </span>
            <div className='min-w-0'>
              <div className='flex items-center gap-1.5'>
                <p className='truncate text-sm font-semibold text-white'>
                  {account.name}
                </p>
                {account.isDefault && (
                  <Star className='h-3 w-3 shrink-0 fill-emerald-400 text-emerald-400' />
                )}
              </div>
              <p className='truncate text-[11px] text-zinc-400 capitalize'>
                {badgeText}
              </p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-7 w-7 shrink-0 p-0 text-zinc-400 hover:text-white'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='border-zinc-800 bg-[#18181b] text-white'
              >
                <DropdownMenuLabel className='text-xs text-zinc-400'>
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setEditOpen(true)}
                  className='cursor-pointer gap-2'
                >
                  <Pencil className='h-3.5 w-3.5 text-blue-400' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator className='bg-zinc-800' />
                <DropdownMenuItem
                  disabled={deleting}
                  onClick={handleDelete}
                  className='cursor-pointer gap-2 text-rose-400'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body */}
        <div className='mt-4 space-y-2'>
          {account.type === 'SAVINGS' && (
            <>
              <div className='truncate text-xl font-bold text-white'>
                {formatINRFull(account.balance)}
              </div>
              <p className='text-xs text-emerald-400'>
                Available {formatINRFull(account.available)}
              </p>
              <Progress
                value={savingsPct}
                className='h-1.5 bg-zinc-800 [&>*]:bg-emerald-500'
              />
              <p className='text-[11px] text-zinc-500'>
                Min balance {formatINRFull(savingsMin)}
              </p>
            </>
          )}

          {account.type === 'CREDIT_CARD' && (
            <>
              <div className='flex items-end justify-between'>
                <div className='truncate text-xl font-bold text-rose-400'>
                  {formatINRFull(account.owed ?? 0)}
                </div>
                <div className='shrink-0 text-xs text-zinc-400'>
                  / {formatINRFull(account.creditLimit ?? 0)}
                </div>
              </div>
              <Progress
                value={utilPct}
                className={cn(
                  'h-1.5 bg-zinc-800',
                  utilColor === 'emerald' && '[&>*]:bg-emerald-500',
                  utilColor === 'amber' && '[&>*]:bg-amber-500',
                  utilColor === 'rose' && '[&>*]:bg-rose-500'
                )}
              />
              <div className='flex items-center justify-between text-[11px]'>
                <span
                  className={cn(
                    utilColor === 'emerald' && 'text-emerald-400',
                    utilColor === 'amber' && 'text-amber-400',
                    utilColor === 'rose' && 'text-rose-400'
                  )}
                >
                  {utilPct}% used
                </span>
                <span className='text-zinc-500'>
                  {formatINRFull(account.available)} available
                </span>
              </div>
            </>
          )}

          {account.type === 'WALLET' && (
            <>
              <div className='truncate text-xl font-bold text-white'>
                {formatINRFull(account.balance)}
              </div>
              <Progress
                value={walletPct}
                className='h-1.5 bg-zinc-800 [&>*]:bg-emerald-500'
              />
              <p className='text-[11px] text-zinc-500'>
                {formatINR(account.balance)} / {formatINR(walletCap)}
              </p>
            </>
          )}

          {account.type === 'CASH' && (
            <div className='truncate text-xl font-bold text-white'>
              {formatINRFull(account.balance)}
            </div>
          )}
        </div>
      </Card>

      <AddEditAccountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        accountToEdit={account}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
