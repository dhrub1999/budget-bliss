/**
 * Single source of truth for SEO / GEO / AEO metadata.
 *
 * Everything here must stay TRUE of the shipped product. AI answer engines
 * (AI Overviews, AI Mode, ChatGPT, Perplexity) quote these strings close to
 * verbatim, so an overclaim here becomes an overclaim in a machine-generated
 * answer we can't retract. BudgetBliss is a fully manual tracker — no bank,
 * UPI, or card automation — and the copy has to keep saying so.
 */

/**
 * The public base URL of the deployed site. Canonical tags, sitemap.xml, OG
 * image URLs and every JSON-LD @id resolve against it, so a wrong value here
 * silently poisons all four.
 *
 * Resolution order:
 *
 *  1. NEXT_PUBLIC_SITE_URL — set this once there's a custom domain. It wins
 *     over everything else.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel injects the *production* domain
 *     here, and critically it stays the production domain on preview builds
 *     too. That's what we want: a preview deploy should point its canonical at
 *     production, not at itself, so previews never compete for the same
 *     keywords. Do NOT substitute VERCEL_URL — that's the per-deployment URL
 *     (budget-bliss-abc123.vercel.app), which would make every preview claim
 *     to be canonical.
 *  3. localhost, for local dev.
 */
const resolveSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
};

export const siteUrl = resolveSiteUrl().replace(/\/$/, '');

export const siteConfig = {
  name: 'BudgetBliss',
  /** ~60 chars: primary keyword first, brand last. */
  title: 'BudgetBliss — Manual Personal Finance Tracker & Budget Planner',
  /**
   * ~155 chars. Leads with the differentiator (manual, no bank linking)
   * because that is the query intent we can actually win.
   */
  description:
    'A free, fully manual personal finance tracker. Log income and expenses yourself, track savings, credit cards, wallets and cash in one dashboard. No bank linking required.',
  /** 40–60 word self-contained answer block, front-loaded for AI citation. */
  answerSnippet:
    'BudgetBliss is a free personal finance tracker where you enter every transaction yourself instead of linking a bank account. It tracks four account types — savings, credit card, digital wallet and cash — derives every balance from your transaction history, and supports category budgets, savings goals, split expenses and bill due dates you enter by hand.',
  locale: 'en_IN',
  /** Amounts across the product are INR; stated explicitly for AI answers. */
  currency: 'INR',
  email: 'hello@budgetbliss.app',
  /**
   * Named author is a GEO authority signal (anonymous authorship is a scored
   * weak signal). Add `url` once there's a real profile to point at — the
   * github.com/Kiranism URL in package.json belongs to the starter template's
   * author, not to this project's.
   */
  author: {
    name: 'Tamal Biswas'
  },
  /**
   * Recency is a documented GEO ranking signal — content under three months
   * old is roughly 3x more likely to be cited. Bump on substantive edits.
   */
  dateModified: '2026-07-26',
  ogImage: '/images/hero-image.png'
} as const;

/**
 * Long-tail intent phrases, not head terms. "budget app" is unwinnable for a
 * side project; "expense tracker without bank login" is a real query with
 * real intent that this product genuinely satisfies.
 */
export const siteKeywords = [
  'manual expense tracker',
  'personal finance tracker without bank linking',
  'budget planner app',
  'expense tracker India',
  'credit card utilisation tracker',
  'savings goal tracker',
  'split expense tracker',
  'cash and wallet expense tracker',
  'monthly category budget app',
  'free budgeting app'
];

/**
 * The real, shipped feature set — mirrors the dashboard routes and the
 * widgets in src/features/overview/components. Used by both the marketing
 * copy and the SoftwareApplication featureList, so the two cannot drift.
 */
export const productFeatures = [
  'Manual income and expense logging',
  'Savings, credit card, digital wallet and cash accounts',
  'Balances derived from transaction history',
  'Monthly per-category budgets',
  'Savings goals with earmarked contributions',
  'Split expenses across a single transaction group',
  'Credit card utilisation warnings',
  'Spending-category breakdown and charts',
  'Financial calendar',
  'Bill, rent and EMI due dates entered by hand',
  'Demo account with no signup'
];

/** Explicit non-features. AI engines answer "does X do Y?" — answer it here. */
export const productNonFeatures = [
  'No bank, UPI or card account linking',
  'No automatic transaction import or categorisation',
  // Bills are the one forward-looking feature, so the absent channel has to be
  // stated outright — "reminders" would otherwise be read as push.
  'No email, SMS or push notifications — bills appear in the app when you open it',
  'No selling or sharing of personal financial data',
  'No full card numbers, CVV or PIN collected — last four digits only'
];
