// ─────────────────────────────────────────────────────────────────────────────
// Overview Dashboard — Dummy Data (INR, realistic Indian household)
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

// ─── Spending Categories (last 30 days) ────────────────────────────────────

export const spendingCategories: SpendingCategory[] = [
  { category: 'Groceries', amount: 8450, color: '#4ade80', icon: '🛒' },
  { category: 'Dining Out', amount: 5230, color: '#fb923c', icon: '🍽️' },
  { category: 'Subscriptions', amount: 1840, color: '#f87171', icon: '📺' },
  { category: 'Bills', amount: 12600, color: '#60a5fa', icon: '🧾' },
  { category: 'Transportation', amount: 3180, color: '#c084fc', icon: '🚗' },
  { category: 'Others', amount: 2700, color: '#94a3b8', icon: '📦' }
];

export const totalSpentLast30Days = spendingCategories.reduce(
  (sum, c) => sum + c.amount,
  0
); // ₹34,000

// ─── Goals & Savings ───────────────────────────────────────────────────────

export const goals: Goal[] = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    targetAmount: 300000,
    savedAmount: 185000,
    color: '#4ade80',
    icon: '🛡️',
    deadline: '2025-12-31'
  },
  {
    id: 'g2',
    name: 'House Down Payment',
    targetAmount: 1500000,
    savedAmount: 420000,
    color: '#60a5fa',
    icon: '🏠',
    deadline: '2027-06-30'
  },
  {
    id: 'g3',
    name: 'Goa Vacation',
    targetAmount: 80000,
    savedAmount: 52000,
    color: '#fb923c',
    icon: '✈️',
    deadline: '2025-08-15'
  },
  {
    id: 'g4',
    name: 'New MacBook',
    targetAmount: 150000,
    savedAmount: 45000,
    color: '#c084fc',
    icon: '💻',
    deadline: '2025-11-01'
  }
];

export const totalSavedAmount = goals.reduce(
  (sum, g) => sum + g.savedAmount,
  0
);
export const totalTargetAmount = goals.reduce(
  (sum, g) => sum + g.targetAmount,
  0
);

// ─── Monthly Income/Expense (last 6 months for report chart) ───────────────

export const monthlyFinancials = [
  { month: 'Feb', income: 85000, expense: 38200 },
  { month: 'Mar', income: 85000, expense: 42100 },
  { month: 'Apr', income: 92000, expense: 35800 },
  { month: 'May', income: 85000, expense: 47300 },
  { month: 'Jun', income: 85000, expense: 36900 },
  { month: 'Jul', income: 97000, expense: 34000 }
];

// ─── Transactions (last 30 days) ───────────────────────────────────────────

const now = new Date('2025-07-14T00:00:00');

function daysAgo(days: number, hour = 10, min = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const transactions: Transaction[] = [
  // ── Today (Jul 14)
  {
    id: 't1',
    title: 'Salary Credit',
    category: 'Salary',
    amount: 85000,
    type: 'credit',
    date: daysAgo(0, 9, 0),
    icon: '💼'
  },
  {
    id: 't2',
    title: 'Swiggy Order',
    category: 'Dining Out',
    amount: 340,
    type: 'debit',
    date: daysAgo(0, 13, 20),
    icon: '🍔'
  },

  // ── Jul 13
  {
    id: 't3',
    title: 'Netflix Subscription',
    category: 'Subscriptions',
    amount: 649,
    type: 'debit',
    date: daysAgo(1, 11, 0),
    icon: '📺'
  },
  {
    id: 't4',
    title: 'Ola Cab',
    category: 'Transportation',
    amount: 180,
    type: 'debit',
    date: daysAgo(1, 9, 30),
    icon: '🚕'
  },

  // ── Jul 12
  {
    id: 't5',
    title: 'Big Basket Groceries',
    category: 'Groceries',
    amount: 2140,
    type: 'debit',
    date: daysAgo(2, 17, 15),
    icon: '🛒'
  },
  {
    id: 't6',
    title: 'Freelance Payment',
    category: 'Freelance',
    amount: 12000,
    type: 'credit',
    date: daysAgo(2, 14, 0),
    icon: '💻'
  },

  // ── Jul 11
  {
    id: 't7',
    title: 'Electricity Bill',
    category: 'Bills',
    amount: 1840,
    type: 'debit',
    date: daysAgo(3, 10, 0),
    icon: '⚡'
  },
  {
    id: 't8',
    title: 'Petrol',
    category: 'Transportation',
    amount: 2500,
    type: 'debit',
    date: daysAgo(3, 8, 30),
    icon: '⛽'
  },

  // ── Jul 10
  {
    id: 't9',
    title: 'Zomato Dinner',
    category: 'Dining Out',
    amount: 890,
    type: 'debit',
    date: daysAgo(4, 20, 45),
    icon: '🍕'
  },
  {
    id: 't10',
    title: 'Spotify Premium',
    category: 'Subscriptions',
    amount: 119,
    type: 'debit',
    date: daysAgo(4, 12, 0),
    icon: '🎵'
  },

  // ── Jul 9
  {
    id: 't11',
    title: 'SBI Credit Card Bill',
    category: 'Bills',
    amount: 8200,
    type: 'debit',
    date: daysAgo(5, 11, 0),
    icon: '💳'
  },
  {
    id: 't12',
    title: 'Mutual Fund SIP',
    category: 'Investment',
    amount: 5000,
    type: 'debit',
    date: daysAgo(5, 9, 0),
    icon: '📈'
  },

  // ── Jul 8
  {
    id: 't13',
    title: 'Clinic Visit',
    category: 'Healthcare',
    amount: 600,
    type: 'debit',
    date: daysAgo(6, 16, 30),
    icon: '🏥'
  },
  {
    id: 't14',
    title: 'Amazon Shopping',
    category: 'Shopping',
    amount: 3490,
    type: 'debit',
    date: daysAgo(6, 14, 20),
    icon: '📦'
  },

  // ── Jul 7
  {
    id: 't15',
    title: 'D-Mart Groceries',
    category: 'Groceries',
    amount: 3200,
    type: 'debit',
    date: daysAgo(7, 11, 0),
    icon: '🛒'
  },
  {
    id: 't16',
    title: 'Bus Pass',
    category: 'Transportation',
    amount: 500,
    type: 'debit',
    date: daysAgo(7, 9, 0),
    icon: '🚌'
  },

  // ── Jul 5
  {
    id: 't17',
    title: 'Pizza Hut',
    category: 'Dining Out',
    amount: 1100,
    type: 'debit',
    date: daysAgo(9, 20, 0),
    icon: '🍕'
  },
  {
    id: 't18',
    title: 'YouTube Premium',
    category: 'Subscriptions',
    amount: 189,
    type: 'debit',
    date: daysAgo(9, 10, 0),
    icon: '▶️'
  },

  // ── Jul 3
  {
    id: 't19',
    title: 'Water Bill',
    category: 'Bills',
    amount: 340,
    type: 'debit',
    date: daysAgo(11, 10, 0),
    icon: '💧'
  },
  {
    id: 't20',
    title: 'Dividend Credit',
    category: 'Investment',
    amount: 2067,
    type: 'credit',
    date: daysAgo(11, 14, 30),
    icon: '📊'
  },

  // ── Jul 1
  {
    id: 't21',
    title: 'Rapido Bike',
    category: 'Transportation',
    amount: 180,
    type: 'debit',
    date: daysAgo(13, 8, 0),
    icon: '🛵'
  },
  {
    id: 't22',
    title: 'Blinkit Groceries',
    category: 'Groceries',
    amount: 1890,
    type: 'debit',
    date: daysAgo(13, 19, 0),
    icon: '🟡'
  },

  // ── Jun 28
  {
    id: 't23',
    title: 'Broadband Bill',
    category: 'Bills',
    amount: 999,
    type: 'debit',
    date: daysAgo(16, 11, 0),
    icon: '🌐'
  },
  {
    id: 't24',
    title: 'Movie Tickets (PVR)',
    category: 'Entertainment',
    amount: 620,
    type: 'debit',
    date: daysAgo(16, 18, 0),
    icon: '🎬'
  },

  // ── Jun 25
  {
    id: 't25',
    title: 'Reliance Smart',
    category: 'Groceries',
    amount: 1220,
    type: 'debit',
    date: daysAgo(19, 17, 0),
    icon: '🛒'
  },
  {
    id: 't26',
    title: 'Uber',
    category: 'Transportation',
    amount: 320,
    type: 'debit',
    date: daysAgo(19, 9, 30),
    icon: '🚗'
  },

  // ── Jun 22
  {
    id: 't27',
    title: 'Gas Bill (PNG)',
    category: 'Bills',
    amount: 850,
    type: 'debit',
    date: daysAgo(22, 10, 0),
    icon: '🔥'
  },
  {
    id: 't28',
    title: 'Behance Client',
    category: 'Freelance',
    amount: 8500,
    type: 'credit',
    date: daysAgo(22, 15, 0),
    icon: '🎨'
  },

  // ── Jun 18
  {
    id: 't29',
    title: 'Pharmacy',
    category: 'Healthcare',
    amount: 430,
    type: 'debit',
    date: daysAgo(26, 14, 0),
    icon: '💊'
  },
  {
    id: 't30',
    title: 'Myntra Sale',
    category: 'Shopping',
    amount: 1750,
    type: 'debit',
    date: daysAgo(26, 16, 0),
    icon: '👕'
  }
];

// ─── Credit Cards ──────────────────────────────────────────────────────────

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

// ─── Quick Insights ─────────────────────────────────────────────────────────

export const insights = [
  {
    id: 'i1',
    type: 'goal' as const,
    icon: '🎯',
    color: '#4ade80',
    text: 'You are on track to reach your Emergency Fund goal within 4 months at the current saving rate.'
  },
  {
    id: 'i2',
    type: 'warning' as const,
    icon: '⚠️',
    color: '#fb923c',
    text: 'You spent 15% more on dining this month vs last month (₹5,230 vs ₹4,550). Want to set a cap?'
  },
  {
    id: 'i3',
    type: 'bill' as const,
    icon: '📅',
    color: '#60a5fa',
    text: 'SBI Credit Card bill of ₹8,200 is due on Jul 20. Ensure funds are available.'
  },
  {
    id: 'i4',
    type: 'savings' as const,
    icon: '💰',
    color: '#c084fc',
    text: 'Save ₹3,500 more this month to stay on track for your Goa Vacation goal.'
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

export function getTransactionsForDate(dateStr: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(dateStr));
}

export function getCalendarEventsForMonth(
  year: number,
  month: number
): Record<string, { debits: Transaction[]; credits: Transaction[] }> {
  const result: Record<
    string,
    { debits: Transaction[]; credits: Transaction[] }
  > = {};

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.toISOString().split('T')[0];
      if (!result[key]) result[key] = { debits: [], credits: [] };
      if (t.type === 'debit') result[key].debits.push(t);
      else result[key].credits.push(t);
    }
  });

  return result;
}
