import { NavItem } from '@/types';

export type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Arnab Ahmed',
    role: 'Freelance Designer',
    avatar: 'https://api.slingacademy.com/public/sample-users/6.png',
    quote:
      "Before I started using BudgetBliss, I was constantly stressed about money. I'd lose track of my expenses and panic at the end of the month. Now, I have full visibility into my spending, and I actually enjoy checking in on my finances. It's become a habit I look forward to."
  },
  {
    name: 'Maya Rodriguez',
    role: 'Graphic Designer',
    avatar: 'https://api.slingacademy.com/public/sample-users/7.png',
    quote:
      'Using BudgetBliss has transformed my financial life. I used to feel overwhelmed with bills and payments, but now I have a clear roadmap for my expenditures. I can finally budget for fun things like vacations without guilt!'
  },
  {
    name: 'James Lee',
    role: 'UX/UI Designer',
    avatar: 'https://api.slingacademy.com/public/sample-users/8.png',
    quote:
      "I was hesitant to track my finances, thinking it would be tedious, but BudgetBliss made it so easy. I can categorize my expenses effortlessly and see where I can save more. It's helped me plan for my future goals!"
  },
  {
    name: 'Sofia Patel',
    role: 'Product Manager',
    avatar: 'https://api.slingacademy.com/public/sample-users/9.png',
    quote:
      "Managing projects was always chaotic for me. Deadlines would slip, and communication was a nightmare. Since integrating BudgetBliss into our workflow, I'm not only on top of my tasks, but my team feels more aligned and productive. It's transformed our approach to project management."
  },
  {
    name: 'Jamal Thompson',
    role: 'Content Strategist',
    avatar: 'https://api.slingacademy.com/public/sample-users/10.png',
    quote:
      'Since I started using BudgetBliss, my approach to managing finances has completely shifted. I can easily track my spending habits and save for my goals. The insights are invaluable, making financial planning enjoyable!'
  },
  {
    name: 'Maria Gonzalez',
    role: 'Product Manager',
    avatar: 'https://api.slingacademy.com/public/sample-users/11.png',
    quote:
      "Before using BudgetBliss, I struggled to maintain a clear overview of my project budgets. Now, I can analyze spending trends and adjust forecasts in real-time. It's a game-changer for my workflow!"
  },
  {
    name: 'Liam Nguyen',
    role: 'Marketing Specialist',
    avatar: 'https://api.slingacademy.com/public/sample-users/12.png',
    quote:
      "Tracking my marketing budget used to be a daunting task. I often found myself overspending on campaigns without realizing it. Since I started using BudgetBliss, I can analyze my spending trends and reallocate funds smarter. It's empowering to see my ROI improve!"
  },
  {
    name: 'Priya Singh',
    role: 'Web Developer',
    avatar: 'https://api.slingacademy.com/public/sample-users/13.png',
    quote:
      "BudgetBliss has made it possible for me to build my savings while still enjoying life. I love how it helps me prioritize my expenses and plan for future investments confidently. It's a game-changer!"
  },
  {
    name: 'Daniel Kim',
    role: 'Software Engineer',
    avatar: 'https://api.slingacademy.com/public/sample-users/14.png',
    quote:
      'Tracking my subscriptions was always a hassle until I found BudgetBliss. The reminders and insights it provides help me stay on top of expenses I often forget about, making budgeting a breeze!'
  },
  {
    name: 'Ethan Chen',
    role: 'SEO Specialist',
    avatar: 'https://api.slingacademy.com/public/sample-users/15.png',
    quote:
      "Using BudgetBliss has been a revelation. I no longer dread financial tasks; I actually look forward to reviewing my budget and seeing my progress. It's empowering to have control over my finances!"
  },
  {
    name: 'Sophie Chen',
    role: 'Graphic Designer',
    avatar: 'https://api.slingacademy.com/public/sample-users/16.png',
    quote:
      "I never thought budgeting could actually be fun! BudgetBliss's visual charts and easy-to-use interface have transformed how I view my finances. It's empowering to see my savings grow!"
  }
];

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
};

// Feature Cards Data
export const featureCards: FeatureCardProps[] = [
  {
    title: 'Effortless Expense Tracking',
    description:
      'Track your daily spending with ease. Quickly log transactions, auto-categorize them, and view everything in one clean dashboard.',
    imageUrl: '/images/feature-images/expense-tracking.png'
  },
  {
    title: 'Smart Budget Planning',
    description:
      'Set monthly budgets by category and let BudgetBliss guide your spending with real-time insights and alerts before you overspend.',
    imageUrl: '/images/feature-images/budget-planning.png'
  },
  {
    title: 'Savings Goals & Progress Tracker',
    description:
      'Create financial goals and watch your progress grow with visual trackers and personalised saving tips.',
    imageUrl: '/images/feature-images/savings-goals.png'
  },
  {
    title: 'Bill & Subscription Reminders',
    description:
      'Never miss a payment again. Get notified before due dates for rent, subscriptions, EMIs, and more.',
    imageUrl: '/images/feature-images/bill-reminders.png'
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
    title: 'Reports',
    url: '/dashboard/reports',
    icon: 'reports',
    isActive: false,
    shortcut: ['r', 'r'],
    items: []
  }
];

export const settingsNavItems: NavItem[] = [
  {
    title: 'Reminders',
    url: '/dashboard/reminders',
    icon: 'reminder',
    isActive: false,
    shortcut: ['r', 'r'],
    items: []
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: 'settings',
    isActive: false,
    shortcut: ['s', 's'],
    items: []
  }
];

export const supportNavItems: NavItem[] = [
  {
    title: 'Help',
    url: '/dashboard/help',
    icon: 'help',
    isActive: false,
    shortcut: ['h', 'h'],
    items: []
  },
  {
    title: 'Logout',
    url: '/dashboard/logout',
    icon: 'logout',
    isActive: false,
    shortcut: ['l', 'l'],
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
