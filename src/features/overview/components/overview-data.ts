// ─────────────────────────────────────────────────────────────────────────────
// Overview Dashboard — Clean Types and Config (No Mock Data)
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionCategory =
  | 'Groceries'
  | 'Dining Out'
  | 'Subscriptions'
  | 'Bills'
  | 'Transportation'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Others';

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  title: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  icon: string; // emoji
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  color: string;
  icon: string;
  deadline: string;
}

export interface SpendingCategory {
  category: TransactionCategory;
  amount: number;
  color: string;
  icon: string;
}

export interface CreditCard {
  id: string;
  cardNumber: string; // last 4 digits
  cardHolder: string;
  validThru: string;
  brand: 'mastercard' | 'visa' | 'rupay' | 'amex';
  gradient: string;
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  transactions: Transaction[];
}

// ─── Category Configuration (Colors and Icons) ───────────────────────────────

export const categoryConfig: Record<
  TransactionCategory,
  { color: string; icon: string }
> = {
  Groceries: { color: '#4ade80', icon: '🛒' },
  'Dining Out': { color: '#fb923c', icon: '🍽️' },
  Subscriptions: { color: '#f87171', icon: '📺' },
  Bills: { color: '#60a5fa', icon: '🧾' },
  Transportation: { color: '#c084fc', icon: '🚗' },
  Entertainment: { color: '#cbd5e1', icon: '🎬' },
  Healthcare: { color: '#f43f5e', icon: '🏥' },
  Shopping: { color: '#ec4899', icon: '🛍️' },
  Salary: { color: '#10b981', icon: '💼' },
  Freelance: { color: '#8b5cf6', icon: '💻' },
  Investment: { color: '#3b82f6', icon: '📈' },
  Others: { color: '#94a3b8', icon: '📦' }
};

// ─── Credit Cards (Cosmetic Visual Component Data Only) ──────────────────────

export const creditCards: CreditCard[] = [
  {
    id: 'cc1',
    cardNumber: '4521',
    cardHolder: 'Tamal Biswas',
    validThru: '04/28',
    brand: 'mastercard',
    gradient: 'from-slate-800 via-slate-700 to-slate-900'
  },
  {
    id: 'cc2',
    cardNumber: '7834',
    cardHolder: 'Tamal Biswas',
    validThru: '11/26',
    brand: 'visa',
    gradient: 'from-blue-900 via-blue-800 to-indigo-900'
  },
  {
    id: 'cc3',
    cardNumber: '2291',
    cardHolder: 'Tamal Biswas',
    validThru: '07/27',
    brand: 'rupay',
    gradient: 'from-emerald-900 via-emerald-800 to-teal-900'
  }
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
