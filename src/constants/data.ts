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
 * Removed: "Bill & Subscription Reminders". Reminders are not built — the nav
 * entry for them is commented out in this same file.
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
    imageUrl: '/images/feature-images/bill-reminders.png',
    imageAlt:
      'A split expense in BudgetBliss divided across several categories, alongside a credit card utilisation warning'
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
  }
  // NOTE: Reports (/dashboard/reports) is hidden until the page is built.
];

// Hidden until built — Reminders and Settings pages don't exist yet.
export const settingsNavItems: NavItem[] = [];

// Hidden until built — Help page doesn't exist; sign-out lives in the user
// dropdown (see app-sidebar.tsx), so a nav "Logout" link isn't needed.
export const supportNavItems: NavItem[] = [];

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
