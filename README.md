<div align="center">
  <h1>💸 Budget Bliss</h1>
  <strong>A personal finance tracker for people who actually want to know where their money went.</strong>
  <br />
  <em>Built with Next.js 15, and a healthy distrust of "set it and forget it" budgeting.</em>
</div>

## Overview

Budget Bliss is a **manual** personal-finance tracker. Yes, _manual_ — on purpose. There's no bank scraping, no UPI hooks, no shadowy aggregator quietly reading your statements at 3 a.m. You enter your accounts, cards, wallets, and transactions yourself, because the fastest way to stop wondering where your money goes is to type it in and look it in the eye.

The trade-off is honest: a little more effort from you, a lot less of your financial life handed to a third party. If you were hoping for "connect your bank and never think again," this is politely not that app.

Everything is derived, nothing is faked: balances are computed from your transactions rather than stored, so editing or deleting an entry just works — no reconciliation rituals required.

## Features

- **Accounts** — Track Savings, Credit Cards, Wallets, and Cash in one unified model. A default Cash account is created for you the first time you show up, because everyone has cash they can't account for.
- **Transactions** — Income and expenses, each tied to a real account. Supports **split transactions** (that dinner where you covered three friends who _swear_ they'll pay you back) and CSV import.
- **Budgeting** — Set category budgets and watch the "Spending Categories" widget gently judge your life choices.
- **Goals** — Earmark savings toward a goal and track progress.
- **Overview dashboard** — Charts and stats via Recharts, with parallel-route loading so one slow widget doesn't hold the whole page hostage.
- **Gentle, non-blocking warnings** — Credit utilization creeping past 40%, a wallet over its cap, savings below the minimum. It warns; it never nannies you into inaction.
- **Privacy-conscious by design** — Only the **last 4 digits** of a card are ever collected. No full card numbers, no CVV, no PIN. A breach disclaimer is surfaced right on the account form and on the `/privacy` page, because storing financial data and pretending nothing could go wrong is not a personality we aspire to.

## Tech Stack

| Concern            | Choice                                                        |
| :----------------- | :------------------------------------------------------------ |
| Framework          | [Next.js 15](https://nextjs.org) (App Router) + React 19      |
| Language           | [TypeScript](https://www.typescriptlang.org)                  |
| Styling            | [Tailwind CSS v4](https://tailwindcss.com)                    |
| Components         | [shadcn/ui](https://ui.shadcn.com) + Radix                    |
| Auth               | [better-auth](https://better-auth.com) via Neon Auth          |
| Database           | Postgres ([Neon](https://neon.tech)) + [Drizzle ORM](https://orm.drizzle.team) |
| Validation         | [Zod](https://zod.dev)                                        |
| State              | [Zustand](https://zustand-demo.pmnd.rs)                       |
| Search-param state | [Nuqs](https://nuqs.47ng.com/)                                |
| Forms              | [React Hook Form](https://react-hook-form.com)                |
| Charts             | [Recharts](https://recharts.org)                              |
| Command palette    | [kbar](https://kbar.vercel.app/)                              |
| Tables             | [TanStack Table](https://tanstack.com/table)                  |
| Tooling            | ESLint · Prettier · Husky · lint-staged                       |

## Getting Started

> [!NOTE]
> We use **pnpm** (with `legacy-peer-deps=true` in `.npmrc`), **Next 15**, and **React 19**.

1. **Clone & install**

   ```bash
   git clone <your-repo-url>
   cd budget-bliss
   pnpm install
   ```

2. **Set up your environment** — create a `.env.local` with:

   ```bash
   DATABASE_URL=            # your Neon/Postgres connection string
   NEON_AUTH_BASE_URL=      # Neon Auth base URL
   NEON_AUTH_COOKIE_SECRET= # a long random string
   ```

   > [!WARNING]
   > The committed `env.example.txt` still references Clerk from a past life. Ignore it — the variables above are the ones that actually matter.

3. **Push the schema** to your database:

   ```bash
   pnpm db:push
   ```

   > We sync the schema with `db:push` rather than `db:migrate` — the generated migrations are stale. `pnpm db:studio` opens Drizzle Studio if you want to poke at the data.

4. **Run it**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Try the demo

Don't feel like wiring up a database just to look around? Hit **"Continue with demo account"** on the sign-in or sign-up page, or log in manually:

- **Email:** `test@abc.com`
- **Password:** `Password123`

(It's a demo account. Please don't put your real net worth in it.)

## Project Structure

```plaintext
src/
├── app/                # Next.js App Router (routes, API routes, landing page)
│   ├── dashboard/      # accounts, transactions, budgeting, overview, profile
│   ├── api/            # accounts, transactions, budgets, goals, auth
│   ├── privacy/        # privacy + breach disclaimer
│   └── terms/
├── components/         # Shared + ui/ components
├── features/           # Feature modules (accounts, transactions, budgeting, overview, ...)
│   └── <feature>/      #   components / lib / schemas / types
├── db/                 # Drizzle schema (accounts, transactions, budgets, goals)
├── lib/
│   ├── auth/           # better-auth client + server
│   ├── accounts/       # balance derivation
│   └── validations/    # Zod schemas (kept client-safe — no server/db imports)
├── constants/          # shared copy, incl. legal.ts
├── hooks/
├── stores/             # Zustand stores
└── types/
```

## Scripts

| Script             | What it does                          |
| :----------------- | :------------------------------------ |
| `pnpm dev`         | Start the dev server (Turbopack)      |
| `pnpm build`       | Production build                      |
| `pnpm start`       | Serve the production build            |
| `pnpm lint`        | Lint                                  |
| `pnpm lint:fix`    | Lint + format                         |
| `pnpm format`      | Prettier over everything              |
| `pnpm db:push`     | Sync schema to the database           |
| `pnpm db:studio`   | Open Drizzle Studio                   |

## Contributing

Contributions are welcome — bug fixes, features, or just fixing the typo you're about to notice.

1. Branch off `main` with a descriptive name (`feat/…`, `fix/…`, `chore/…`).
2. Keep it clean — Husky + lint-staged run Prettier on commit, so run `pnpm lint` before you push and save everyone the "fix lint" commit.
3. **Keep `src/lib/validations/*` client-safe** — no imports that pull in `@/db` (Postgres needs net/tls/fs and will break the client build). Future you will thank present you.
4. Balances are **derived, not stored** — don't add a running-balance column "for performance." It's a trap.
5. Open a PR against `main` with a short description of the _what_ and the _why_.

> [!NOTE]
> Budget Bliss is intentionally manual. PRs proposing bank/UPI/aggregator auto-sync will be admired for their ambition and then respectfully declined — it's a design choice, not a missing feature.

Cheers! 🥂
