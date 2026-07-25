/**
 * JSON-LD graph for the marketing pages.
 *
 * Type choices follow the schema-type status list current as of June 2026:
 *   - WebApplication / Organization / WebSite / Offer / BreadcrumbList: active.
 *   - FAQPage: Google retired FAQ rich results for ALL sites on 2026-05-07.
 *     Kept anyway — it still helps non-Google AI answer engines parse the Q&A,
 *     and it costs nothing. Do NOT expect SERP rich results from it.
 *   - HowTo: deprecated (rich results removed Sept 2023). The "How it works"
 *     section deliberately gets NO HowTo markup.
 *
 * These objects are rendered into the initial server HTML rather than injected
 * client-side: AI crawlers do not execute JavaScript, and Google's Dec 2025 JS
 * SEO guidance warns that JS-injected structured data may be processed late.
 */
import {
  siteConfig,
  siteUrl,
  productFeatures,
  productNonFeatures
} from '@/config/site';

const orgId = `${siteUrl}/#organization`;
const siteId = `${siteUrl}/#website`;
const appId = `${siteUrl}/#webapp`;

export const organizationSchema = {
  '@type': 'Organization',
  '@id': orgId,
  name: siteConfig.name,
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/logo/Logo.svg`
  },
  email: siteConfig.email,
  founder: {
    '@type': 'Person',
    name: siteConfig.author.name
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: siteConfig.email,
    contactType: 'customer support'
  }
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': siteId,
  url: siteUrl,
  name: siteConfig.name,
  description: siteConfig.description,
  inLanguage: 'en',
  publisher: { '@id': orgId }
};

/**
 * WebApplication (a SoftwareApplication subtype) is the accurate type for a
 * browser-based tool. `offers` advertises ONLY the free plan — the paid tiers
 * on the pricing section are roadmap, not purchasable, and advertising an
 * unbuyable Offer is exactly the kind of thing that earns a manual action.
 */
export const webApplicationSchema = {
  '@type': 'WebApplication',
  '@id': appId,
  name: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any modern web browser',
  browserRequirements: 'Requires JavaScript and a modern browser',
  inLanguage: 'en',
  isAccessibleForFree: true,
  publisher: { '@id': orgId },
  author: {
    '@type': 'Person',
    name: siteConfig.author.name
  },
  featureList: [...productFeatures],
  offers: {
    '@type': 'Offer',
    price: 0,
    priceCurrency: siteConfig.currency,
    availability: 'https://schema.org/InStock',
    description: 'Free plan — unlimited manual transactions, budgets and goals'
  },
  /**
   * No aggregateRating / review properties. There are no real user ratings,
   * and fabricating them is both a policy violation and a spam signal.
   */
  screenshot: `${siteUrl}${siteConfig.ogImage}`,
  dateModified: siteConfig.dateModified
};

/**
 * FAQ content. Each answer is written to stand alone when lifted out of the
 * page — that extractability is what AI answer engines actually reward, and
 * it is the reason these are full sentences rather than fragments.
 */
export const faqs = [
  {
    question: 'Is BudgetBliss free?',
    answer:
      'Yes. The free plan covers unlimited manual income and expense entries, monthly category budgets, savings goals, spending-category tracking and reports. Paid tiers shown on the pricing page are planned but not yet available, so there is nothing to buy today.'
  },
  {
    question: 'Does BudgetBliss connect to my bank account?',
    answer:
      'No, and it is not planned. BudgetBliss is a deliberately manual tracker: you enter every account, card and transaction yourself. Nothing links to a bank, UPI handle or card network, so no third-party aggregator ever holds your credentials.'
  },
  {
    question:
      'Why would I enter transactions manually instead of syncing them?',
    answer:
      'Manual entry is slower by design. Typing an amount forces a two-second review of a purchase you would otherwise never look at again, which is where most of the behaviour change in budgeting comes from. It also means the app needs no access to your bank credentials.'
  },
  {
    question: 'What kinds of accounts can I track?',
    answer:
      'Four types: savings accounts (with a minimum-balance threshold), credit cards (with a credit limit and utilisation warnings), digital wallets (with a balance cap) and cash. Every transaction is tied to one of them, and balances are calculated from your transaction history rather than stored.'
  },
  {
    question: 'Can I split one expense across categories or people?',
    answer:
      'Yes. A split expense is recorded as several linked rows sharing one split group, so a single restaurant bill can be divided across categories or participants while still reconciling to one payment.'
  },
  {
    question: 'How does BudgetBliss handle credit card utilisation?',
    answer:
      'Card balances are tracked as amount owed, computed from expenses minus repayments. When utilisation reaches 40 percent of the credit limit, the dashboard raises a non-blocking warning so you can pay down before the figure is reported to a bureau.'
  },
  {
    question: 'Can BudgetBliss remind me about bills, rent and EMIs?',
    answer:
      'It tracks them but it does not contact you. Enter a bill once with its amount, due date and how often it repeats, and it appears on the Bills page and your dashboard as the date approaches, grouped into overdue, due this week and later. BudgetBliss sends no email, SMS or push notification — you see what is due when you open the app. Marking a bill paid logs a real transaction and moves a recurring bill to its next cycle.'
  },
  {
    question: 'Can I try BudgetBliss without signing up?',
    answer:
      'Yes. Both the sign-in and sign-up screens offer a "Continue with demo account" option that signs you straight into a shared demo workspace, so you can look around before creating your own account.'
  },
  {
    question: 'How is my financial data protected?',
    answer:
      'Data is scoped per user and never sold or shared. Only the last four digits of a card are ever collected — never the full number, CVV or PIN. Because the app stores personal financial information, a plain-language breach disclaimer is shown on the account form and on the privacy page rather than buried in terms.'
  }
];

export const faqPageSchema = {
  '@type': 'FAQPage',
  '@id': `${siteUrl}/#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
};

/** One @graph keeps node cross-references (@id) resolvable in one payload. */
export const landingPageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    websiteSchema,
    webApplicationSchema,
    faqPageSchema
  ]
};

/** Non-features surface as a plain list for the "what it doesn't do" section. */
export const nonFeatureList = productNonFeatures;
