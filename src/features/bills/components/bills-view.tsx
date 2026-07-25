'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlarmClock, CalendarClock, Plus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertModal } from '@/components/modal/alert-modal';
import { AddTransactionDialog } from '@/features/overview/components/add-transaction-dialog';
import { formatINRFull } from '@/features/overview/components/overview-data';
import { expenseVendors } from '@/lib/validations/transaction';
import type { AccountOption } from '@/features/accounts/types';
import { toast } from 'sonner';
import {
  BILL_STATUS_LABELS,
  BILL_STATUS_STYLES,
  UPCOMING_HORIZON_DAYS
} from '../constants';
import { parseDueDate } from '../lib/date';
import { groupBillsByStatus, summariseBills } from '../lib/status';
import type { BillRecord } from '../types';
import { AddEditBillDialog } from './add-edit-bill-dialog';
import { BillCard } from './bill-card';

interface BillsViewProps {
  bills: BillRecord[];
  accounts: AccountOption[];
  /** Server's clock, ISO. Seeds `today` so SSR and first client paint agree. */
  serverNow: string;
}

export function BillsView({ bills, accounts, serverNow }: BillsViewProps) {
  const router = useRouter();

  // Seeded from the server so hydration matches, then corrected on mount in
  // case the tab has been open across a date boundary.
  const [today, setToday] = React.useState<Date>(() => new Date(serverNow));
  React.useEffect(() => {
    setToday(new Date());
  }, []);

  const [formOpen, setFormOpen] = React.useState(false);
  const [billToEdit, setBillToEdit] = React.useState<BillRecord | null>(null);
  const [payingBill, setPayingBill] = React.useState<BillRecord | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);
  const [billToDelete, setBillToDelete] = React.useState<BillRecord | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  const groups = React.useMemo(
    () => groupBillsByStatus(bills, today),
    [bills, today]
  );
  const summary = React.useMemo(
    () => summariseBills(bills, today),
    [bills, today]
  );

  function handleAdd() {
    setBillToEdit(null);
    setFormOpen(true);
  }

  function handleEdit(bill: BillRecord) {
    setBillToEdit(bill);
    setFormOpen(true);
  }

  function handleMarkPaid(bill: BillRecord) {
    setPayingBill(bill);
    setPayOpen(true);
  }

  /**
   * Runs after the transaction has been created. The transaction is the source
   * of truth for the money; this second call only advances the bill's cycle, so
   * a failure here is recoverable by marking paid again.
   */
  async function settleBill(bill: BillRecord) {
    try {
      const res = await fetch(`/api/bills/${bill.id}/paid`, { method: 'POST' });
      const data = await res.json();
      if (data?.success) {
        toast.success(
          data.archived
            ? `${bill.name} paid and archived`
            : `${bill.name} paid — next due ${parseDueDate(
                data.nextDueDate
              ).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}`
        );
      } else {
        toast.error(
          data?.error ||
            'Transaction saved, but the bill was not advanced. Mark it paid again.'
        );
      }
    } catch {
      toast.error(
        'Transaction saved, but the bill was not advanced. Mark it paid again.'
      );
    }
    setPayingBill(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!billToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/bills/${billToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('Bill deleted');
        setBillToDelete(null);
        router.refresh();
      } else {
        toast.error(data?.error || 'Failed to delete bill');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting bill');
    } finally {
      setDeleting(false);
    }
  }

  // A bill named "Netflix" matches the vendor enum and sticks; anything else is
  // normalised to "Others" by the form, so send it through as a note instead.
  // When the vendor already carries the name, skip the note — the transaction
  // description is built as `vendor: notes` and would read "Netflix: Netflix".
  const payVendor =
    payingBill &&
    (expenseVendors as readonly string[]).includes(payingBill.name)
      ? payingBill.name
      : undefined;
  const payNotes = payVendor ? undefined : payingBill?.name;

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-4 pb-8 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl'>
              Bills &amp; Upcoming
            </h1>
            <p className='mt-0.5 text-xs text-zinc-400 sm:mt-1 sm:text-sm'>
              What&apos;s due, and what you&apos;ve already paid. Shown here
              when you open the app — no emails, texts or push notifications.
            </p>
          </div>

          <Button
            onClick={handleAdd}
            className='h-9 w-full cursor-pointer gap-1.5 bg-[#4ade80] text-xs font-semibold text-black hover:bg-[#22c55e] sm:h-10 sm:w-auto sm:text-sm'
          >
            <Plus className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
            Add Bill
          </Button>
        </div>

        {/* Summary */}
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4'>
          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Overdue
              </CardTitle>
              <AlarmClock className='h-3.5 w-3.5 shrink-0 text-rose-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-rose-400 sm:text-2xl'>
                {formatINRFull(summary.overdueTotal)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                {summary.overdueCount === 0
                  ? 'Nothing past its due date'
                  : `${summary.overdueCount} bill${
                      summary.overdueCount === 1 ? '' : 's'
                    } past due`}
              </p>
            </CardContent>
          </Card>

          <Card className='border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 pb-1.5 sm:pb-2'>
              <CardTitle className='truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-xs'>
                Next {UPCOMING_HORIZON_DAYS} days
              </CardTitle>
              <CalendarClock className='h-3.5 w-3.5 shrink-0 text-amber-400 sm:h-4 sm:w-4' />
            </CardHeader>
            <CardContent className='p-0'>
              <div className='truncate text-base font-bold text-amber-400 sm:text-2xl'>
                {formatINRFull(summary.upcomingTotal)}
              </div>
              <p className='mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs'>
                {summary.upcomingCount === 0
                  ? 'Nothing due this month'
                  : `${summary.upcomingCount} bill${
                      summary.upcomingCount === 1 ? '' : 's'
                    } expected`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grouped bills */}
        {bills.length === 0 ? (
          <div className='rounded-xl border border-dashed border-zinc-800 bg-[#141416] p-10 text-center'>
            <CalendarClock className='mx-auto h-10 w-10 text-zinc-500' />
            <p className='mt-3 text-sm font-medium text-zinc-400'>
              No bills yet.
            </p>
            <p className='mx-auto mt-1 max-w-sm text-xs text-zinc-500'>
              Add the things you pay on a schedule — rent, an EMI, a
              subscription — and they&apos;ll show up here and on your dashboard
              as their due dates approach.
            </p>
            <Button
              onClick={handleAdd}
              variant='outline'
              className='mt-4 gap-1.5 border-zinc-800 bg-[#18181b] text-white hover:bg-zinc-800'
            >
              <Plus className='h-4 w-4' />
              Add your first bill
            </Button>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.status} className='space-y-3'>
              <h2
                className={`text-xs font-semibold tracking-wider uppercase ${
                  BILL_STATUS_STYLES[group.status].text
                }`}
              >
                {BILL_STATUS_LABELS[group.status]}
                <span className='ml-1.5 text-zinc-600'>
                  ({group.bills.length})
                </span>
              </h2>
              <div className='flex flex-col gap-2.5'>
                {group.bills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    today={today}
                    onMarkPaid={handleMarkPaid}
                    onEdit={handleEdit}
                    onDelete={setBillToDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <AddEditBillDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        accounts={accounts}
        billToEdit={billToEdit}
        onSuccess={() => router.refresh()}
      />

      {payingBill && (
        <AddTransactionDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          defaultType='debit'
          // The dialog parses this with `new Date(...)`, so hand it a local
          // midnight instant — a bare "2026-01-31" would be read as UTC and
          // show as the 30th to anyone west of Greenwich.
          defaultDate={parseDueDate(payingBill.dueDate).toISOString()}
          defaultAccountId={payingBill.accountId ?? undefined}
          defaultAmount={payingBill.amount}
          defaultCategory={payingBill.category}
          defaultVendor={payVendor}
          defaultNotes={payNotes}
          onSuccess={() => settleBill(payingBill)}
        />
      )}

      <AlertModal
        isOpen={Boolean(billToDelete)}
        onClose={() => setBillToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </PageContainer>
  );
}
