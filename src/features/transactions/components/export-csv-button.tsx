'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export interface TransactionForExport {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string | null;
  date: Date | string;
}

interface ExportCsvButtonProps {
  data: TransactionForExport[];
  filename?: string;
}

export function ExportCsvButton({
  data,
  filename = 'budgetbliss_transactions.csv'
}: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('No transactions available to export');
      return;
    }

    const headers = [
      'ID',
      'Date',
      'Type',
      'Category',
      'Description',
      'Amount (INR)'
    ];
    const rows = data.map((t) => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      const desc = t.description
        ? `"${t.description.replace(/"/g, '""')}"`
        : '""';
      return [t.id, dateStr, t.type, `"${t.category}"`, desc, t.amount];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${data.length} transactions to ${filename}`);
  };

  return (
    <Button
      variant='outline'
      onClick={handleExport}
      className='h-10 cursor-pointer gap-2 border-zinc-800 bg-[#18181b] text-white hover:bg-zinc-800'
    >
      <Download className='h-4 w-4 text-emerald-400' />
      Export CSV
    </Button>
  );
}
