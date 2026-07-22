'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Tag
} from 'lucide-react';
import { TransactionRecord } from './add-edit-transaction-dialog';
import { formatINRFull } from '@/features/overview/components/overview-data';

interface ColumnsProps {
  onEdit: (transaction: TransactionRecord) => void;
  onDelete: (id: string) => void;
}

export function getTransactionColumns({
  onEdit,
  onDelete
}: ColumnsProps): ColumnDef<TransactionRecord>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black'
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const d = new Date(row.getValue('date'));
        return (
          <div className='text-xs font-medium whitespace-nowrap text-zinc-300 sm:text-sm'>
            {d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const isIncome = type === 'INCOME';
        return (
          <div className='flex items-center'>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                isIncome
                  ? 'border-emerald-800/40 bg-emerald-950/60 text-emerald-400'
                  : 'border-rose-800/40 bg-rose-950/60 text-rose-400'
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className='h-3 w-3' />
              ) : (
                <ArrowUpRight className='h-3 w-3' />
              )}
              {isIncome ? 'Income' : 'Expense'}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.getValue('category') as string;
        return (
          <div className='flex items-center gap-1.5 text-xs font-medium text-zinc-300'>
            <Tag className='h-3.5 w-3.5 text-zinc-500' />
            <span className='rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5'>
              {cat}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'description',
      header: 'Description / Account',
      cell: ({ row }) => {
        const desc = row.getValue('description') as string | null;
        if (!desc) return <span className='text-xs text-zinc-500'>-</span>;
        return (
          <div className='max-w-[240px] truncate text-xs text-zinc-200 sm:text-sm'>
            {desc}
          </div>
        );
      }
    },
    {
      accessorKey: 'amount',
      header: () => <div className='text-right'>Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const type = row.getValue('type') as string;
        const isIncome = type === 'INCOME';

        return (
          <div
            className={`text-right text-xs font-bold sm:text-sm ${
              isIncome ? 'text-emerald-400' : 'text-zinc-100'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatINRFull(amount)}
          </div>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <div className='text-right'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                >
                  <span className='sr-only'>Open menu</span>
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
                  onClick={() => onEdit(transaction)}
                  className='cursor-pointer gap-2 hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white'
                >
                  <Pencil className='h-3.5 w-3.5 text-blue-400' />
                  Edit Transaction
                </DropdownMenuItem>
                <DropdownMenuSeparator className='bg-zinc-800' />
                <DropdownMenuItem
                  onClick={() => onDelete(transaction.id)}
                  className='cursor-pointer gap-2 text-rose-400 hover:bg-rose-950/40 focus:bg-rose-950/40 focus:text-rose-300'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Delete Transaction
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];
}
