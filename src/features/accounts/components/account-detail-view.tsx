'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionTable } from '@/features/transactions/components/transaction-table';
import {
  TransactionFormDialog,
  type TransactionRecord
} from '@/features/transactions/components/transaction-form-dialog';
import { formatINRFull } from '@/features/overview/components/overview-data';
import { ACCOUNT_TYPE_SINGULAR } from '@/features/accounts/constants';
import type { AccountOption } from '@/features/accounts/types';
import { toast } from 'sonner';

interface AccountDetailViewProps {
  account: AccountOption;
  balance: number;
  transactions: TransactionRecord[];
  accounts: AccountOption[];
}

interface Stat {
  title: string;
  value: string;
  color?: string;
  hint?: string;
}

export function AccountDetailView({
  account,
  transactions,
  accounts
}: AccountDetailViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedTxn, setSelectedTxn] =
    React.useState<TransactionRecord | null>(null);

  const handleAddNew = () => {
    setSelectedTxn(null);
    setFormOpen(true);
  };

  const handleEdit = (txn: TransactionRecord) => {
    setSelectedTxn(txn);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data && data.success) {
        toast.success('Transaction deleted');
        router.refresh();
      } else {
        toast.error(data?.error || 'Failed to delete transaction');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting transaction');
    }
  };

  const stats: Stat[] = React.useMemo(() => {
    if (account.type === 'CREDIT_CARD') {
      const utilPct = Math.round((account.utilization ?? 0) * 100);
      return [
        {
          title: 'Outstanding',
          value: formatINRFull(account.owed ?? 0),
          color: 'text-rose-400',
          hint: 'Amount owed'
        },
        {
          title: 'Available',
          value: formatINRFull(account.available),
          color: 'text-emerald-400',
          hint: `Limit ${formatINRFull(account.creditLimit ?? 0)}`
        },
        {
          title: 'Utilization',
          value: `${utilPct}%`,
          color: 'text-white',
          hint: 'Of credit limit'
        }
      ];
    }
    if (account.type === 'SAVINGS') {
      return [
        {
          title: 'Balance',
          value: formatINRFull(account.balance),
          color: 'text-emerald-400'
        },
        {
          title: 'Spendable',
          value: formatINRFull(account.spendableAboveMin),
          color: 'text-white',
          hint: 'Above minimum balance'
        },
        {
          title: 'Min Balance',
          value: formatINRFull(account.minimumBalance ?? 0),
          color: 'text-white'
        }
      ];
    }
    // WALLET / CASH
    return [
      {
        title: 'Balance',
        value: formatINRFull(account.balance),
        color: 'text-emerald-400'
      },
      {
        title: 'Available',
        value: formatINRFull(account.available),
        color: 'text-white'
      }
    ];
  }, [account]);

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-4 pb-8 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-3'>
          <Link
            href='/dashboard/accounts'
            className='flex w-fit items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Back to accounts
          </Link>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl'>
                {account.name}
              </h1>
              <p className='mt-0.5 text-xs text-zinc-400 sm:mt-1 sm:text-sm'>
                {account.provider ? `${account.provider} · ` : ''}
                {ACCOUNT_TYPE_SINGULAR[account.type]}
              </p>
            </div>

            <Button
              onClick={handleAddNew}
              className='h-9 w-full cursor-pointer gap-1.5 bg-[#4ade80] text-xs font-semibold text-black hover:bg-[#22c55e] sm:h-10 sm:w-auto sm:text-sm'
            >
              <Plus className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              Add transaction
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className='grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3'>
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className='border-zinc-800 bg-[#141416] p-3 sm:p-4'
            >
              <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
                <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div
                  className={`truncate text-base font-bold sm:text-2xl ${
                    stat.color ?? 'text-white'
                  }`}
                >
                  {stat.value}
                </div>
                {stat.hint && (
                  <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                    {stat.hint}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions */}
        <TransactionTable
          data={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={() => router.refresh()}
        />
      </div>

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        accounts={accounts}
        transactionToEdit={selectedTxn}
        defaultAccountId={account.id}
        onSuccess={() => router.refresh()}
      />
    </PageContainer>
  );
}
