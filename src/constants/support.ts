/**
 * Links and copy for the /dashboard/support page.
 *
 * Deliberately NOT in src/config/site.ts. That file is the SEO/GEO surface —
 * its strings get quoted near-verbatim by AI answer engines, and it is imported
 * by structured-data.ts, robots.ts, sitemap.ts and the landing page, so
 * everything added there widens the blast radius of the public JSON-LD graph.
 * A maintainer's LinkedIn URL is not SEO copy. This follows the same pattern as
 * constants/legal.ts: shared copy in one place so it can't drift.
 *
 * The contributing rules below are a SUMMARY of README.md § Contributing.
 * README is the source of truth — change a rule there, change it here too.
 */

/** Canonical repository. Every other GitHub link is derived from it. */
export const REPO_URL = 'https://github.com/dhrub1999/budget-bliss';

/**
 * GitHub issue-*form* deep links.
 *
 * `template` must match a filename in .github/ISSUE_TEMPLATE/ **on the default
 * branch**. If it doesn't, GitHub silently drops the visitor into the template
 * chooser rather than 404-ing — so a link that appears to "work" is not proof
 * the template actually shipped. Open one and check the fields render.
 *
 * These forms also accept prefill params keyed by field `id`, e.g.
 * `&area=Bills+%26+Upcoming`. Useful later if we want a contextual "report a
 * problem with this page" link from individual routes.
 */
const newIssue = (template: string) =>
  `${REPO_URL}/issues/new?template=${template}`;

export const SUPPORT_LINKS = {
  bugReport: newIssue('bug_report.yml'),
  featureRequest: newIssue('feature_request.yml'),
  openIssues: `${REPO_URL}/issues`,
  goodFirstIssues: `${REPO_URL}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
  repo: REPO_URL,
  contributing: `${REPO_URL}#contributing`,
  license: `${REPO_URL}/blob/main/LICENSE`
} as const;

export interface MaintainerProfile {
  name: string;
  /** GitHub handle, without the @. */
  handle: string;
  email: string;
  github: string;
  /** Optional. Undefined means "no profile yet" — the UI omits it entirely. */
  linkedin?: string;
  /** Optional. Full profile URL, not the handle. */
  x?: string;
}

/**
 * Annotated with the interface rather than `as const`, so the optional fields
 * keep the type `string | undefined`. With `as const` TypeScript narrows them
 * to `undefined` and the truthiness guard in the view becomes dead code.
 */
export const maintainer: MaintainerProfile = {
  name: 'Tamal Biswas',
  handle: 'dhrub1999',
  email: 'contact.tamalbiswas@gmail.com',
  github: 'https://github.com/dhrub1999',
  // Fill these in when the profiles exist. Left undefined on purpose — the view
  // skips them rather than rendering a link to '#', which is worse than absent.
  linkedin: undefined,
  x: undefined
};

export interface ContributingRule {
  title: string;
  detail: string;
}

/** Mirrors README.md § Contributing. Keep the two in sync. */
export const CONTRIBUTING_RULES: ContributingRule[] = [
  {
    title: 'Branch off main',
    detail:
      'Use a descriptive prefix — feat/…, fix/… or chore/… — and open the PR back against main with a short note on the what and the why.'
  },
  {
    title: 'Let Prettier win',
    detail:
      'Husky and lint-staged run Prettier on commit. Run pnpm lint before you push and save everyone the follow-up "fix lint" commit.'
  },
  {
    title: 'Keep src/lib/validations/* client-safe',
    detail:
      'Nothing in there may import @/db. Postgres needs net, tls and fs, and pulling it into a form component breaks the client build.'
  },
  {
    title: 'Balances are derived, never stored',
    detail:
      'No running-balance column for performance. Bills work the same way: there is no isPaid column, because the next due date already tells you it was paid.'
  },
  {
    title: 'Don’t overclaim in src/config/site.ts',
    detail:
      'productFeatures and productNonFeatures feed both the marketing copy and the JSON-LD featureList, and AI answer engines quote them near-verbatim. Ship the feature first, then describe it there.'
  }
];

/** The one class of PR that gets declined. Better said up front than later. */
export const CONTRIBUTING_DECLINED =
  'BudgetBliss is intentionally manual. Pull requests that add bank, UPI or aggregator auto-sync will be declined — that is a design choice, not a missing feature. Notifications are the same story: there is no email, SMS or push channel anywhere in this codebase, and bills are due dates you type in, not charges we detect.';
