'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Landmark,
  CreditCard as CreditCardIcon,
  Wallet,
  Banknote
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  accountSchema,
  walletProviders,
  cardBrands,
  type AccountSchemaInput,
  type AccountSchemaOutput
} from '@/lib/validations/account';
import { WALLET_CAP } from '@/features/accounts/constants';
import type { AccountOption } from '@/features/accounts/types';
import type { AccountType } from '@/lib/accounts/balances';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddEditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: AccountOption | null;
  onSuccess?: () => void;
}

const TYPE_TILES: {
  value: AccountType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'SAVINGS', label: 'Savings', icon: Landmark },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCardIcon },
  { value: 'WALLET', label: 'Wallet', icon: Wallet },
  { value: 'CASH', label: 'Cash', icon: Banknote }
];

const inputClass =
  'h-12 w-full rounded-xl border-zinc-800/80 bg-[#18181b] px-4 text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500';
const labelClass = 'text-sm font-medium text-zinc-400';

function buildDefaults(a?: AccountOption | null): AccountSchemaInput {
  if (!a) {
    return {
      name: '',
      type: 'SAVINGS',
      provider: '',
      openingBalance: '' as unknown as number,
      minimumBalance: '' as unknown as number,
      creditLimit: '' as unknown as number,
      currentOutstanding: '' as unknown as number,
      last4: '',
      cardHolder: '',
      validThru: '',
      brand: undefined,
      maxBalance: '' as unknown as number,
      isDefault: false
    };
  }
  return {
    name: a.name,
    type: a.type,
    provider: a.provider ?? '',
    openingBalance: '' as unknown as number,
    minimumBalance: (a.minimumBalance ?? '') as unknown as number,
    creditLimit: (a.creditLimit ?? '') as unknown as number,
    currentOutstanding: '' as unknown as number,
    last4: a.last4 ?? '',
    cardHolder: a.cardHolder ?? '',
    validThru: a.validThru ?? '',
    brand: (a.brand as AccountSchemaInput['brand']) ?? undefined,
    maxBalance: (a.maxBalance ?? '') as unknown as number,
    isDefault: a.isDefault
  };
}

export function AddEditAccountDialog({
  open,
  onOpenChange,
  accountToEdit,
  onSuccess
}: AddEditAccountDialogProps) {
  const isEditing = Boolean(accountToEdit);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AccountSchemaInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: buildDefaults(accountToEdit)
  });

  React.useEffect(() => {
    if (open) reset(buildDefaults(accountToEdit));
  }, [open, accountToEdit, reset]);

  const type = watch('type') as AccountType;
  const brand = watch('brand');
  const isDefault = watch('isDefault');

  const handleLast4 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setValue('last4', value, { shouldValidate: true });
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    setValue('validThru', value, { shouldValidate: true });
  };

  async function onSubmit(values: AccountSchemaOutput) {
    setSubmitting(true);
    try {
      let res: Response;
      if (isEditing && accountToEdit) {
        // Never re-seed opening balance / outstanding on edit — would double-count.
        const payload: Record<string, unknown> = {
          name: values.name,
          isDefault: values.isDefault ?? false
        };
        if (values.type === 'SAVINGS') {
          payload.provider = values.provider || null;
          payload.minimumBalance = values.minimumBalance ?? null;
        } else if (values.type === 'CREDIT_CARD') {
          payload.provider = values.provider || null;
          payload.creditLimit = values.creditLimit ?? null;
          payload.last4 = values.last4 || null;
          payload.cardHolder = values.cardHolder || null;
          payload.validThru = values.validThru || null;
          payload.brand = values.brand ?? null;
        } else if (values.type === 'WALLET') {
          payload.provider = values.provider || null;
          payload.maxBalance = values.maxBalance ?? null;
        }
        res = await fetch(`/api/accounts/${accountToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
      }
      const data = await res.json();
      setSubmitting(false);
      if (data && data.success) {
        toast.success(isEditing ? 'Account updated' : 'Account created');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data?.error || 'Failed to save account');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err?.message || 'Error saving account');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[94vw] max-w-[440px] overflow-y-auto rounded-2xl border-zinc-800 bg-[#121214] p-4 text-white sm:p-6 [&>button]:hidden'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-white'>
            {isEditing ? 'Edit Account' : 'Add Account'}
          </DialogTitle>
          <DialogDescription className='text-xs text-zinc-400'>
            {isEditing
              ? 'Update the details of this account.'
              : 'Add a savings account, credit card, wallet, or cash to track.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit as any)}
          className='space-y-4 pt-2'
        >
          {/* Type picker */}
          <div className='space-y-2'>
            <Label className={labelClass}>Account type</Label>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {TYPE_TILES.map((tile) => {
                const TileIcon = tile.icon;
                const active = type === tile.value;
                return (
                  <button
                    key={tile.value}
                    type='button'
                    disabled={isEditing}
                    onClick={() =>
                      setValue('type', tile.value, { shouldValidate: true })
                    }
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors',
                      active
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-zinc-800 bg-[#18181b] text-zinc-400 hover:bg-zinc-800',
                      isEditing && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <TileIcon className='h-5 w-5' />
                    {tile.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div className='space-y-1.5'>
            <Label htmlFor='acct-name' className={labelClass}>
              Account name
            </Label>
            <Input
              id='acct-name'
              placeholder='e.g. HDFC Savings'
              className={inputClass}
              {...register('name')}
            />
            {errors.name && (
              <p className='text-xs text-rose-400'>{errors.name.message}</p>
            )}
          </div>

          {/* SAVINGS */}
          {type === 'SAVINGS' && (
            <>
              <div className='space-y-1.5'>
                <Label htmlFor='acct-provider' className={labelClass}>
                  Bank (optional)
                </Label>
                <Input
                  id='acct-provider'
                  placeholder='e.g. HDFC Bank'
                  className={inputClass}
                  {...register('provider')}
                />
              </div>
              {!isEditing && (
                <div className='space-y-1.5'>
                  <Label htmlFor='acct-opening' className={labelClass}>
                    Opening balance
                  </Label>
                  <Input
                    id='acct-opening'
                    type='number'
                    step='0.01'
                    placeholder='0'
                    className={inputClass}
                    {...register('openingBalance')}
                  />
                  {errors.openingBalance && (
                    <p className='text-xs text-rose-400'>
                      {errors.openingBalance.message}
                    </p>
                  )}
                </div>
              )}
              <div className='space-y-1.5'>
                <Label htmlFor='acct-min' className={labelClass}>
                  Minimum balance (optional)
                </Label>
                <Input
                  id='acct-min'
                  type='number'
                  step='0.01'
                  placeholder='0'
                  className={inputClass}
                  {...register('minimumBalance')}
                />
                {errors.minimumBalance && (
                  <p className='text-xs text-rose-400'>
                    {errors.minimumBalance.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* CREDIT_CARD */}
          {type === 'CREDIT_CARD' && (
            <>
              <div className='space-y-1.5'>
                <Label htmlFor='acct-issuer' className={labelClass}>
                  Issuer (optional)
                </Label>
                <Input
                  id='acct-issuer'
                  placeholder='e.g. HDFC'
                  className={inputClass}
                  {...register('provider')}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='acct-limit' className={labelClass}>
                  Credit limit
                </Label>
                <Input
                  id='acct-limit'
                  type='number'
                  step='0.01'
                  placeholder='0'
                  className={inputClass}
                  {...register('creditLimit')}
                />
                {errors.creditLimit && (
                  <p className='text-xs text-rose-400'>
                    {errors.creditLimit.message}
                  </p>
                )}
              </div>
              {!isEditing && (
                <div className='space-y-1.5'>
                  <Label htmlFor='acct-outstanding' className={labelClass}>
                    Current outstanding (optional)
                  </Label>
                  <Input
                    id='acct-outstanding'
                    type='number'
                    step='0.01'
                    placeholder='0'
                    className={inputClass}
                    {...register('currentOutstanding')}
                  />
                  {errors.currentOutstanding && (
                    <p className='text-xs text-rose-400'>
                      {errors.currentOutstanding.message}
                    </p>
                  )}
                </div>
              )}
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='acct-last4' className={labelClass}>
                    Last 4 digits
                  </Label>
                  <Input
                    id='acct-last4'
                    inputMode='numeric'
                    placeholder='1234'
                    className={cn(inputClass, 'font-mono')}
                    value={watch('last4') ?? ''}
                    onChange={handleLast4}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='acct-expiry' className={labelClass}>
                    Valid thru
                  </Label>
                  <Input
                    id='acct-expiry'
                    inputMode='numeric'
                    placeholder='MM/YY'
                    className={cn(inputClass, 'font-mono')}
                    value={watch('validThru') ?? ''}
                    onChange={handleExpiry}
                  />
                </div>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='acct-holder' className={labelClass}>
                  Card holder (optional)
                </Label>
                <Input
                  id='acct-holder'
                  placeholder='e.g. Tamal Biswas'
                  className={inputClass}
                  {...register('cardHolder')}
                />
              </div>
              <div className='space-y-1.5'>
                <Label className={labelClass}>Brand</Label>
                <Select
                  value={brand ?? ''}
                  onValueChange={(val) =>
                    setValue('brand', val as AccountSchemaInput['brand'], {
                      shouldValidate: true
                    })
                  }
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder='Select brand' />
                  </SelectTrigger>
                  <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                    {cardBrands.map((b) => (
                      <SelectItem
                        key={b}
                        value={b}
                        className='text-white capitalize hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                      >
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* WALLET */}
          {type === 'WALLET' && (
            <>
              <div className='space-y-1.5'>
                <Label className={labelClass}>Provider</Label>
                <Select
                  value={watch('provider') ?? ''}
                  onValueChange={(val) =>
                    setValue('provider', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder='Select wallet provider' />
                  </SelectTrigger>
                  <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                    {walletProviders.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className='text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.provider && (
                  <p className='text-xs text-rose-400'>
                    {errors.provider.message}
                  </p>
                )}
              </div>
              {!isEditing && (
                <div className='space-y-1.5'>
                  <Label htmlFor='acct-wallet-opening' className={labelClass}>
                    Opening balance
                  </Label>
                  <Input
                    id='acct-wallet-opening'
                    type='number'
                    step='0.01'
                    placeholder='0'
                    className={inputClass}
                    {...register('openingBalance')}
                  />
                  {errors.openingBalance && (
                    <p className='text-xs text-rose-400'>
                      {errors.openingBalance.message}
                    </p>
                  )}
                </div>
              )}
              <div className='space-y-1.5'>
                <Label htmlFor='acct-max' className={labelClass}>
                  Wallet cap (optional)
                </Label>
                <Input
                  id='acct-max'
                  type='number'
                  step='0.01'
                  placeholder={String(WALLET_CAP)}
                  className={inputClass}
                  {...register('maxBalance')}
                />
                {errors.maxBalance && (
                  <p className='text-xs text-rose-400'>
                    {errors.maxBalance.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* CASH */}
          {type === 'CASH' && !isEditing && (
            <div className='space-y-1.5'>
              <Label htmlFor='acct-cash-opening' className={labelClass}>
                Opening balance
              </Label>
              <Input
                id='acct-cash-opening'
                type='number'
                step='0.01'
                placeholder='0'
                className={inputClass}
                {...register('openingBalance')}
              />
              {errors.openingBalance && (
                <p className='text-xs text-rose-400'>
                  {errors.openingBalance.message}
                </p>
              )}
            </div>
          )}

          {/* Default toggle */}
          <div className='flex items-center justify-between rounded-xl border border-zinc-800 bg-[#18181b] px-4 py-3'>
            <div>
              <p className='text-sm font-medium text-white'>Default account</p>
              <p className='text-xs text-zinc-400'>
                Use this account by default for new transactions.
              </p>
            </div>
            <Switch
              checked={!!isDefault}
              onCheckedChange={(val) =>
                setValue('isDefault', val, { shouldValidate: true })
              }
            />
          </div>

          <DialogFooter className='flex-row gap-2 pt-2 sm:justify-end'>
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
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Add account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
