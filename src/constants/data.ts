import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export type FeatureCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  /** Descriptive alt text. Falls back to title, but every card should set it. */
  imageAlt?: string;
};

/**
 * Feature cards — each must describe something that actually ships today.
 *
 * Headings are noun phrases containing the search term people use, because
 * "Track every account in one place" earns nothing while "Savings, cards,
 * wallets and cash in one place" matches real queries. Descriptions lead with a
 * concrete, quotable fact rather than an adjective, which is what makes a
 * passage extractable by AI answer engines.
 *
 * Bills & Upcoming ships as a *manual* due-date ledger: the user enters the
 * bill and the date, and the app surfaces it in-app. It sends nothing — no
 * email, SMS or push — so no card here may imply that it does.
 *
 * NOTE: bill-reminders.png now illustrates the bills card, which is what it
 * actually depicts. The split-expenses card reuses expense-tracking.png until
 * a dedicated asset exists — swap it when one does.
 */
export const featureCards: FeatureCardProps[] = [
  {
    title: 'Savings, credit cards, wallets and cash in one place',
    description:
      'Every transaction is tied to a real money source. Track four account types — savings accounts with a minimum-balance threshold, credit cards with a limit, digital wallets with a cap, and plain cash. Balances are calculated from your transaction history, so correcting a mistake never leaves a stale number behind.',
    imageUrl: '/images/feature-images/expense-tracking.png',
    imageAlt:
      'BudgetBliss accounts screen listing a savings account, credit card, digital wallet and cash account with their current balances'
  },
  {
    title: 'Monthly budgets by category',
    description:
      'Set a spending limit per category for the month and watch the remaining balance fall as you log expenses. The spending-categories widget breaks down where the money actually went, so the gap between plan and reality is visible while you can still act on it.',
    imageUrl: '/images/feature-images/budget-planning.png',
    imageAlt:
      'Monthly category budgets in BudgetBliss showing progress bars for each spending category'
  },
  {
    title: 'Savings goals with earmarked money',
    description:
      'Create a goal, then contribute to it from real income rather than a wish-list number. Contributions are earmarked against the goal and reversed automatically if you edit or delete the underlying transaction, so progress always reflects money you genuinely have.',
    imageUrl: '/images/feature-images/savings-goals.png',
    imageAlt:
      'A savings goal in BudgetBliss with a progress bar showing the amount saved against the target'
  },
  {
    title: 'Split expenses and credit utilisation warnings',
    description:
      'Divide one bill into several linked entries that still reconcile to a single payment — useful for a shared dinner or a mixed grocery run. Separately, when a card passes 40 percent of its limit the dashboard flags it, giving you room to pay down before the figure reaches a credit bureau.',
    imageUrl: '/images/feature-images/expense-tracking.png',
    imageAlt:
      'A split expense in BudgetBliss divided across several categories, alongside a credit card utilisation warning'
  },
  {
    title: 'Bill, rent and EMI due dates',
    description:
      'Enter a bill once with its amount and due date and it appears on the dashboard as the date approaches, sorted into overdue, due this week and later. Marking it paid logs a real transaction against the account you chose, then moves a recurring bill to its next cycle. BudgetBliss shows this when you open it — it sends no email, text or push notification.',
    imageUrl: '/images/feature-images/bill-reminders.png',
    imageAlt:
      'The BudgetBliss bills screen listing rent, an EMI and a subscription with their amounts and due dates'
  }
];

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const overviewNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  }
];

export const managementNavItems: NavItem[] = [
  {
    title: 'Accounts',
    url: '/dashboard/accounts',
    icon: 'accounts',
    isActive: false,
    shortcut: ['a', 'a'],
    items: []
  },
  {
    title: 'Transactions',
    url: '/dashboard/transactions',
    icon: 'transaction',
    isActive: false,
    shortcut: ['t', 't'],
    items: []
  },
  {
    title: 'Budgeting',
    url: '/dashboard/budgeting',
    icon: 'budgeting',
    isActive: false,
    shortcut: ['b', 'b'],
    items: []
  },
  {
    title: 'Bills & Upcoming',
    url: '/dashboard/bills',
    icon: 'reminder',
    isActive: false,
    shortcut: ['b', 'i'],
    items: []
  }
  // NOTE: Reports (/dashboard/reports) is hidden until the page is built.
];

// Hidden until built — the Settings page doesn't exist yet.
export const settingsNavItems: NavItem[] = [];

// Rendered in the sidebar footer (see app-sidebar.tsx) and as the "Support"
// section of the ⌘K palette. Sign-out lives in the user dropdown, so there's
// no nav "Logout" link here.
export const supportNavItems: NavItem[] = [
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: 'help',
    isActive: false,
    // First claim on 's'. Following the convention above, a later Settings page
    // disambiguates with ['s', 'e'] the way Bills took ['b', 'i'] after
    // Budgeting had already claimed ['b', 'b'].
    shortcut: ['s', 's'],
    items: []
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
