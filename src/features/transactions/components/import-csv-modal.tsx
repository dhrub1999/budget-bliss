'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportCsvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ParsedRow {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function ImportCsvModal({
  open,
  onOpenChange,
  onSuccess
}: ImportCsvModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<ParsedRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setParsedRows([]);
      setErrorMsg(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setErrorMsg(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setErrorMsg('CSV file is empty');
          return;
        }

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          setErrorMsg('No data rows found in CSV');
          return;
        }

        const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
        const dataLines = lines.slice(1);

        // Find column indices
        let dateIdx = headers.findIndex((h) => h.includes('date'));
        let descIdx = headers.findIndex(
          (h) =>
            h.includes('desc') ||
            h.includes('merchant') ||
            h.includes('account') ||
            h.includes('payee')
        );
        let catIdx = headers.findIndex((h) => h.includes('cat'));
        let amtIdx = headers.findIndex(
          (h) =>
            h.includes('amt') || h.includes('amount') || h.includes('price')
        );
        let typeIdx = headers.findIndex((h) => h.includes('type'));

        // Fallbacks if no header match
        if (dateIdx === -1) dateIdx = 0;
        if (descIdx === -1) descIdx = 1;
        if (amtIdx === -1) amtIdx = Math.min(2, headers.length - 1);

        const rows: ParsedRow[] = [];

        for (const line of dataLines) {
          const columns = parseCSVLine(line);
          if (columns.length < 2) continue;

          const rawDate =
            columns[dateIdx] || new Date().toISOString().split('T')[0];
          const rawDesc = columns[descIdx] || 'Imported Transaction';
          const rawCat =
            catIdx !== -1 && columns[catIdx] ? columns[catIdx] : 'Others';
          const rawAmtStr = columns[amtIdx]
            ? columns[amtIdx].replace(/[^0-9.-]/g, '')
            : '0';
          const numericAmt = parseFloat(rawAmtStr) || 0;

          let rawType: 'INCOME' | 'EXPENSE' = 'EXPENSE';
          if (typeIdx !== -1 && columns[typeIdx]) {
            const t = columns[typeIdx].toUpperCase();
            if (
              t.includes('INC') ||
              t.includes('CREDIT') ||
              t.includes('DEPOSIT')
            ) {
              rawType = 'INCOME';
            }
          } else if (numericAmt > 0) {
            rawType = 'EXPENSE';
          } else if (numericAmt < 0) {
            rawType = 'INCOME';
          }

          rows.push({
            date: rawDate,
            description: rawDesc,
            category: rawCat,
            amount: Math.abs(numericAmt),
            type: rawType
          });
        }

        if (rows.length === 0) {
          setErrorMsg('Could not parse any valid transaction rows');
        } else {
          setParsedRows(rows);
        }
      } catch (err: any) {
        setErrorMsg('Failed to parse CSV file: ' + err.message);
      }
    };

    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedRows })
      });
      const data = await res.json();
      setLoading(false);

      if (data && data.success) {
        toast.success(`Successfully imported ${data.count} transactions!`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data?.error || 'Failed to import transactions');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || 'Error importing CSV');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[94vw] max-w-[620px] overflow-y-auto rounded-2xl border-zinc-800 bg-[#121214] p-4 text-white sm:p-6'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl font-semibold text-white'>
            <FileSpreadsheet className='h-5 w-5 text-emerald-400' />
            Import Transactions from CSV
          </DialogTitle>
        </DialogHeader>

        {!file ? (
          <div className='my-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-[#18181b] p-8 text-center transition-colors hover:border-zinc-700'>
            <Upload className='mb-3 h-10 w-10 text-zinc-400' />
            <p className='mb-1 text-sm font-medium text-white'>
              Drag &amp; Drop Bank Statement CSV here
            </p>
            <p className='mb-4 text-xs text-zinc-400'>
              Supports CSV files with Date, Description, Category, and Amount
              columns.
            </p>
            <label className='cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400'>
              Browse CSV File
              <input
                type='file'
                accept='.csv'
                onChange={handleFileChange}
                className='hidden'
              />
            </label>
          </div>
        ) : (
          <div className='my-2 space-y-4'>
            <div className='flex items-center justify-between rounded-xl border border-zinc-800 bg-[#18181b] p-3 px-4'>
              <div className='flex items-center gap-3'>
                <FileSpreadsheet className='h-5 w-5 text-emerald-400' />
                <div>
                  <p className='text-sm font-medium text-white'>{file.name}</p>
                  <p className='text-xs text-zinc-400'>
                    Parsed {parsedRows.length} rows
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setFile(null);
                  setParsedRows([]);
                }}
                className='text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white'
              >
                Change File
              </Button>
            </div>

            {errorMsg && (
              <div className='flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-400'>
                <AlertCircle className='h-4 w-4 shrink-0' />
                {errorMsg}
              </div>
            )}

            {parsedRows.length > 0 && (
              <div className='space-y-2'>
                <p className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                  Data Preview (First 5 Rows)
                </p>
                <div className='max-h-56 overflow-auto rounded-xl border border-zinc-800 bg-[#141416]'>
                  <table className='w-full text-left text-xs text-zinc-300'>
                    <thead className='sticky top-0 border-b border-zinc-800 bg-[#18181b] text-[10px] font-bold tracking-wider text-zinc-400 uppercase'>
                      <tr>
                        <th className='p-2.5 px-3'>Date</th>
                        <th className='p-2.5 px-3'>Description</th>
                        <th className='p-2.5 px-3'>Category</th>
                        <th className='p-2.5 px-3'>Type</th>
                        <th className='p-2.5 px-3 text-right'>Amount</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-zinc-800/50'>
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className='hover:bg-zinc-900/50'>
                          <td className='p-2.5 px-3 whitespace-nowrap'>
                            {row.date}
                          </td>
                          <td className='max-w-[140px] truncate p-2.5 px-3'>
                            {row.description}
                          </td>
                          <td className='p-2.5 px-3'>{row.category}</td>
                          <td className='p-2.5 px-3'>
                            <span
                              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                row.type === 'INCOME'
                                  ? 'border border-emerald-800/40 bg-emerald-950/60 text-emerald-400'
                                  : 'border border-rose-800/40 bg-rose-950/60 text-rose-400'
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className='p-2.5 px-3 text-right font-medium text-white'>
                            ₹{row.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className='flex items-center justify-end gap-3 border-t border-zinc-800/60 pt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            Cancel
          </Button>
          <Button
            disabled={parsedRows.length === 0 || loading}
            onClick={handleImport}
            className='bg-emerald-500 font-semibold text-black hover:bg-emerald-400 disabled:opacity-50'
          >
            {loading ? (
              'Importing...'
            ) : (
              <>
                <CheckCircle2 className='mr-1.5 h-4 w-4' />
                Import {parsedRows.length} Transactions
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
