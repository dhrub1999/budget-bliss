'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Scale
} from 'lucide-react';
import {
  TransactionRecord,
  TransactionFormDialog,
  type GoalOption
} from './transaction-form-dialog';
import { ImportCsvModal } from './import-csv-modal';
import { ExportCsvButton } from './export-csv-button';
import { TransactionTable } from './transaction-table';
import { formatINRFull } from '@/features/overview/components/overview-data';
import type { AccountOption } from '@/features/accounts/types';
import { toast } from 'sonner';

interface TransactionsViewProps {
  initialTransactions: TransactionRecord[];
  accounts?: AccountOption[];
  goals?: GoalOption[];
}

export function TransactionsView({
  initialTransactions,
  accounts = [],
  goals = []
}: TransactionsViewProps) {
  const router = useRouter();
  const [addEditOpen, setAddEditOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [selectedTxn, setSelectedTxn] =
    React.useState<TransactionRecord | null>(null);

  const handleEdit = (txn: TransactionRecord) => {
    setSelectedTxn(txn);
    setAddEditOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTxn(null);
    setAddEditOpen(true);
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
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

  const totalIncome = React.useMemo(() => {
    return initialTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [initialTransactions]);

  const totalExpense = React.useMemo(() => {
    return initialTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [initialTransactions]);

  const netCashFlow = totalIncome - totalExpense;

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-4 pb-8 sm:gap-6'>
        {/* Header Title & Primary Action Buttons */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl'>
              Transaction Management Hub
            </h1>
            <p className='mt-0.5 text-xs text-zinc-400 sm:mt-1 sm:text-sm'>
              Search, filter, manage, import, and export all your cash flow
              records.
            </p>
          </div>

          <div className='grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5'>
            <ExportCsvButton data={initialTransactions} />
            <Button
              onClick={() => setImportOpen(true)}
              variant='outline'
              className='h-9 cursor-pointer gap-1.5 border-zinc-800 bg-[#18181b] text-xs text-white hover:bg-zinc-800 sm:h-10 sm:text-sm'
            >
              <Upload className='h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4' />
              Import CSV
            </Button>
            <Button
              onClick={handleCreateNew}
              className='col-span-2 h-9 cursor-pointer gap-1.5 bg-[#4ade80] text-xs font-semibold text-black hover:bg-[#22c55e] sm:col-span-1 sm:h-10 sm:text-sm'
            >
              <Plus className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className='grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4'>
          {/* Card 1: Net Cash Flow */}
          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Net Cash Flow
              </CardTitle>
              <Scale className='h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div
                className={`truncate text-base font-bold sm:text-2xl ${
                  netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netCashFlow >= 0 ? '+' : ''}
                {formatINRFull(netCashFlow)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                {netCashFlow >= 0 ? 'Surplus cash flow' : 'Deficit cash flow'}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Income */}
          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Total Income
              </CardTitle>
              <ArrowDownLeft className='h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-emerald-400 sm:text-2xl'>
                {formatINRFull(totalIncome)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                {initialTransactions.filter((t) => t.type === 'INCOME').length}{' '}
                income records
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Total Expenses */}
          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Total Expenses
              </CardTitle>
              <ArrowUpRight className='h-3.5 w-3.5 shrink-0 text-rose-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-rose-400 sm:text-2xl'>
                {formatINRFull(totalExpense)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                {initialTransactions.filter((t) => t.type === 'EXPENSE').length}{' '}
                expense records
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Total Records Count */}
          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Total Records
              </CardTitle>
              <Receipt className='h-3.5 w-3.5 shrink-0 text-blue-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-white sm:text-2xl'>
                {initialTransactions.length}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                Logged in database
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <TransactionTable
          data={initialTransactions}
          onEdit={handleEdit}
          onDelete={handleDeleteSingle}
          onRefresh={() => router.refresh()}
        />
      </div>

      {/* Modals */}
      <TransactionFormDialog
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        accounts={accounts}
        goals={goals}
        transactionToEdit={selectedTxn}
        onSuccess={() => router.refresh()}
      />

      <ImportCsvModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => router.refresh()}
      />
    </PageContainer>
  );
}
