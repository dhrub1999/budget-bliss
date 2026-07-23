'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Tag
} from 'lucide-react';
import { TransactionRecord } from './transaction-form-dialog';
import { getTransactionColumns } from './columns';
import {
  expenseCategories,
  incomeCategories
} from '@/lib/validations/transaction';
import { formatINRFull } from '@/features/overview/components/overview-data';
import { toast } from 'sonner';

interface TransactionTableProps {
  data: TransactionRecord[];
  onEdit: (transaction: TransactionRecord) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export function TransactionTable({
  data,
  onEdit,
  onDelete,
  onRefresh
}: TransactionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  const columns = React.useMemo(
    () => getTransactionColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    const selectedIds = selectedRows.map((r) => r.original.id);

    if (
      !confirm(
        `Are you sure you want to delete ${selectedCount} selected transaction(s)?`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      const res = await fetch('/api/transactions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const result = await res.json();
      setBulkDeleting(false);

      if (result && result.success) {
        toast.success(`Deleted ${selectedCount} transactions`);
        setRowSelection({});
        if (onRefresh) onRefresh();
      } else {
        toast.error(result?.error || 'Failed to bulk delete');
      }
    } catch (err: any) {
      setBulkDeleting(false);
      toast.error(err?.message || 'Error executing bulk delete');
    }
  };

  const allCategories = React.useMemo(() => {
    return Array.from(
      new Set([...expenseCategories, ...incomeCategories])
    ).sort();
  }, []);

  const typeFilterValue =
    (table.getColumn('type')?.getFilterValue() as string) || 'ALL';
  const categoryFilterValue =
    (table.getColumn('category')?.getFilterValue() as string) || 'ALL';

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Top Filter Bar */}
      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
        {/* Left Search & Dropdown Filters */}
        <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          {/* Search Box */}
          <div className='relative w-full sm:w-64'>
            <Search className='absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:h-4 sm:w-4' />
            <Input
              placeholder='Search transactions...'
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className='h-9 w-full rounded-xl border-zinc-800 bg-[#141416] pr-8 pl-9 text-xs text-white placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 sm:h-10'
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className='absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-white'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>

          {/* Type & Category Filters in a 2-column grid on mobile */}
          <div className='grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3'>
            {/* Type Filter Dropdown */}
            <Select
              value={typeFilterValue}
              onValueChange={(val) =>
                table
                  .getColumn('type')
                  ?.setFilterValue(val === 'ALL' ? undefined : val)
              }
            >
              <SelectTrigger className='h-9 w-full rounded-xl border-zinc-800 bg-[#141416] text-xs text-white focus:ring-emerald-500 sm:h-10 sm:w-[130px]'>
                <SelectValue placeholder='All Types' />
              </SelectTrigger>
              <SelectContent className='border-zinc-800 bg-[#18181b] text-white'>
                <SelectItem value='ALL'>All Types</SelectItem>
                <SelectItem value='INCOME'>Income</SelectItem>
                <SelectItem value='EXPENSE'>Expense</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter Dropdown */}
            <Select
              value={categoryFilterValue}
              onValueChange={(val) =>
                table
                  .getColumn('category')
                  ?.setFilterValue(val === 'ALL' ? undefined : val)
              }
            >
              <SelectTrigger className='h-9 w-full rounded-xl border-zinc-800 bg-[#141416] text-xs text-white focus:ring-emerald-500 sm:h-10 sm:w-[150px]'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent className='max-h-60 border-zinc-800 bg-[#18181b] text-white'>
                <SelectItem value='ALL'>All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters button */}
          {(globalFilter ||
            typeFilterValue !== 'ALL' ||
            categoryFilterValue !== 'ALL') && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setGlobalFilter('');
                table.resetColumnFilters();
              }}
              className='h-9 self-start text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white sm:self-auto'
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Bulk Actions Banner */}
        {selectedCount > 0 && (
          <div className='flex w-full items-center justify-between gap-3 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 sm:w-auto sm:justify-start'>
            <span className='text-xs font-medium text-rose-300'>
              {selectedCount} selected
            </span>
            <Button
              size='sm'
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
              className='h-7 gap-1 bg-rose-600 px-2.5 text-xs text-white hover:bg-rose-500'
            >
              <Trash2 className='h-3.5 w-3.5' />
              {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </div>
        )}
      </div>

      {/* Desktop / Tablet Data Table View (hidden on small screens) */}
      <div className='hidden overflow-hidden rounded-xl border border-zinc-800 bg-[#141416] md:block'>
        <div className='overflow-x-auto'>
          <Table className='min-w-[650px]'>
            <TableHeader className='border-b border-zinc-800 bg-[#18181b] text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className='border-zinc-800 hover:bg-transparent'
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='py-3.5 text-zinc-400'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className='divide-y divide-zinc-800/60'>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='border-zinc-800/60 transition-colors hover:bg-zinc-900/60'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='py-3'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-32 text-center text-sm text-zinc-500'
                  >
                    No transactions found matching criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card List View (visible only on mobile screens < md) */}
      <div className='block space-y-2.5 md:hidden'>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const item = row.original;
            const isIncome = item.type === 'INCOME';
            const formattedDate = new Date(item.date).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }
            );

            return (
              <div
                key={row.id}
                className={`rounded-xl border p-3.5 transition-colors ${
                  row.getIsSelected()
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-zinc-800/80 bg-[#141416]'
                }`}
              >
                {/* Mobile Card Header */}
                <div className='flex items-center justify-between border-b border-zinc-800/50 pb-2'>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(val) => row.toggleSelected(!!val)}
                      aria-label='Select row'
                      className='border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black'
                    />
                    <span className='text-xs font-medium text-zinc-400'>
                      {formattedDate}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-7 w-7 p-0 text-zinc-400 hover:text-white'
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
                          onClick={() => onEdit(item)}
                          className='cursor-pointer gap-2'
                        >
                          <Pencil className='h-3.5 w-3.5 text-blue-400' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className='bg-zinc-800' />
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id)}
                          className='cursor-pointer gap-2 text-rose-400'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Mobile Card Content */}
                <div className='flex items-end justify-between pt-2'>
                  <div className='max-w-[65%] space-y-1'>
                    <p className='truncate text-xs font-semibold text-white sm:text-sm'>
                      {item.description || 'No description'}
                    </p>
                    <div className='flex items-center gap-1 text-[11px] text-zinc-400'>
                      <Tag className='h-3 w-3 text-zinc-500' />
                      <span className='py-0.2 rounded border border-zinc-800 bg-zinc-900 px-1.5'>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className='text-right'>
                    <span
                      className={`text-sm font-bold ${
                        isIncome ? 'text-emerald-400' : 'text-zinc-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatINRFull(item.amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className='rounded-xl border border-zinc-800 bg-[#141416] p-8 text-center text-xs text-zinc-500'>
            No transactions found matching criteria.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className='flex items-center justify-between px-1 pt-1 text-xs text-zinc-400'>
        <div className='text-[11px] sm:text-xs'>
          {table.getFilteredRowModel().rows.length} total transactions
        </div>
        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='flex items-center gap-1 text-[11px] sm:text-xs'>
            <span>Page</span>
            <span className='font-semibold text-white'>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount() || 1}
            </span>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='h-7 w-7 border-zinc-800 bg-[#18181b] p-0 text-white hover:bg-zinc-800 disabled:opacity-30 sm:h-8 sm:w-8'
            >
              <ChevronLeft className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className='h-7 w-7 border-zinc-800 bg-[#18181b] p-0 text-white hover:bg-zinc-800 disabled:opacity-30 sm:h-8 sm:w-8'
            >
              <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
