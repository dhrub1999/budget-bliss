# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

BudgetBliss is a **manual** personal finance tracker. Users type in every account,
card, wallet and transaction themselves. There is no bank, UPI or aggregator sync,
and there is no email, SMS or push channel anywhere in the codebase.

Both are deliberate product decisions, not gaps in the roadmap. Do not propose,
scaffold or "helpfully" add either one.

## Commands

```bash
pnpm dev              # dev server (turbopack)
pnpm build            # production build
pnpm lint             # next lint
pnpm lint:strict      # eslint --max-warnings=0 src
pnpm format           # prettier over everything
pnpm db:push          # sync schema to the DB — use this
pnpm db:studio        # Drizzle Studio
```

### There is no CI, no test suite, and no typecheck script

`.github/` has no workflows. `.husky/pre-push` is an empty file. `lint-staged` runs
Prettier only — not ESLint, not `tsc`. Nothing will catch a broken build for you.

**After making changes, run these manually:**

```bash
npx tsc --noEmit
pnpm lint:strict
```

### Schema changes: `db:push`, not `db:migrate`

`drizzle/migrations/` holds a single migration from early in the project's life and
it is stale. Syncing happens through `pnpm db:push`. Don't run `db:migrate`, and
don't try to "repair" the migration history unless that is the explicit task.

### Package manager: three lockfiles are committed

`bun.lock`, `pnpm-lock.yaml` and `package-lock.json` are all tracked. The README and
the `lint:fix` script say pnpm; `bun.lock` is the only one touched since 2026-07-11
and is the one actually in use.

Run scripts with `pnpm`. If you install a dependency, mention the lockfile situation
rather than silently regenerating the other two.

## Stack

|            |                                                               |
| :--------- | :------------------------------------------------------------ |
| Framework  | Next.js 15.2.8 App Router, React 19                           |
| Language   | TypeScript 5.7, `strict: true`                                |
| Styling    | Tailwind **v4**, CSS-first                                    |
| Components | shadcn/ui (new-york) + Radix                                  |
| Auth       | Neon Auth / better-auth — **not Clerk**                       |
| DB         | Postgres (Neon) + Drizzle ORM                                 |
| Validation | Zod **v3**                                                    |
| Other      | React Hook Form, nuqs, Recharts, kbar, sonner, TanStack Table |

Things that will mislead you if you don't know them:

- **There is no `tailwind.config.js`**, despite `components.json` naming one. Tailwind
  v4 is configured in CSS — see `src/app/globals.css` and `src/app/theme.css`.
- **Clerk is gone.** The `.clerk/` directory is dead weight from before the migration.
  Auth is `createNeonAuth` in `src/lib/auth/server.ts`.
- **Zod is v3, not v4.** `z.coerce.number({ invalid_type_error })`,
  `parsed.error.errors[0]`, `.superRefine`. v4 idioms will not compile.
- `framer-motion` and `motion` are both installed; three icon libraries are too
  (`lucide-react`, `@tabler/icons-react`, `@radix-ui/react-icons`). Match whatever
  the neighbouring file uses.

## Layout

```
src/
├── app/                  # routes; api/*/route.ts holds ALL mutations
│   ├── dashboard/        # the app (accounts, transactions, budgeting, bills, overview, support)
│   ├── api/              # REST route handlers
│   └── actions/          # LEGACY server actions (transactions, goals) — don't add here
├── features/<x>/
│   ├── components/       # *-view.tsx page shell, cards, add-edit-*-dialog.tsx
│   ├── lib/get-<x>.ts    # server read helper, called from Server Components
│   ├── lib/*.ts          # pure helpers (always take `today: Date` as a param)
│   ├── types.ts          # serialized record + summary shapes
│   └── constants.ts      # thresholds, label maps, style maps
├── lib/validations/<x>.ts  # Zod schemas — MUST stay client-safe
├── db/                   # exactly two files: index.ts (client) and schema.ts
├── config/site.ts        # SEO/GEO single source of truth
├── constants/            # data.ts (nav), legal.ts, support.ts
├── components/ui/        # shadcn primitives
└── components/layout/    # app-sidebar, header, page-container, providers
```

Aliases: `@/*` → `src/*`, `~/*` → `public/*`.

`src/features/kanban/` and `src/features/products/` (plus `/dashboard/kanban` and
`/dashboard/product`) are leftover starter-template demos. Don't treat them as
reference patterns and don't extend them.

## Adding a feature

Follow `bills` — it is the newest and cleanest example. The order matters:

1. `src/db/schema.ts` — add the `pgTable` after a banner comment explaining the
   domain rationale, plus `$inferSelect`/`$inferInsert` types at the bottom. Then
   `pnpm db:push`.
2. `src/lib/validations/<x>.ts` — `xSchema`, `updateXSchema = xSchema.partial()`,
   option tuples for selects, and the `z.input`/`z.output` type exports.
3. `src/features/<x>/types.ts` — the serialized record shape (Dates as ISO strings).
4. `src/features/<x>/constants.ts` — label and style maps.
5. `src/features/<x>/lib/get-<x>.ts` — `getXs(userId): Promise<XData>`.
6. `src/app/api/<x>/route.ts` (GET, POST) and `[id]/route.ts` (GET, PATCH, DELETE).
7. `src/features/<x>/components/` — `x-view.tsx`, `x-card.tsx`, `add-edit-x-dialog.tsx`.
8. `src/app/dashboard/<x>/page.tsx` — thin server page.
9. `src/constants/data.ts` — nav entry with an icon key from `src/components/icons.tsx`
   and a non-colliding two-key shortcut.

## Conventions that aren't obvious from the code

**Mutations are REST route handlers, not server actions.** Everything lives in
`src/app/api/<x>/route.ts`. The two files in `src/app/actions/` are legacy; don't add
to them and don't convert existing routes to actions.

**Every handler has the same shape:**

- Response envelope is always `{ success: boolean, error?: string, <entity>?: … }`.
  Never return bare data.
- `try/catch` around the whole body, `console.error('Error <verb>ing <entity>:', error)`,
  500 with `error.message || 'Failed to …'`.
- Zod `safeParse`, and surface only `parsed.error.errors[0]?.message`.
- Next 15 dynamic params are async: `{ params }: { params: Promise<{ id: string }> }`.
- **There are no foreign keys in the database at all.** Cross-entity references
  (`accountId`, `goalId`) are by convention. Ownership must be re-checked with a
  `select` scoped to `userId` before every update or delete.
- `revalidatePath()` every affected route at the end of a mutation.

**Auth, copied verbatim into each route/page — there is no `requireUser()` wrapper:**

```ts
const { data: session } = await auth.getSession();
if (!session?.user?.id) {
  /* 401 in a route handler, redirect('/auth/sign-in') in a page */
}
```

**Reads happen in Server Components** via `features/<x>/lib/get-<x>.ts`. Pages are
`export const dynamic = 'force-dynamic'`, await everything with `Promise.all`, and
hand props to a single client view. No Suspense on feature pages — the only
streaming is `/dashboard/overview`, which uses parallel routes.

**Schema conventions:** ids are cuid2 `text` via `createId()`; `userId` is `uuid`
(the type mismatch is intentional — it comes from `neon_auth.user`); money is
`doublePrecision`; enums are `text` with a JSDoc union, never `pgEnum`; `updatedAt`
is set manually on every PATCH, it does not auto-update.

**Forms** in bills and accounts use plain `register`/`watch`/`setValue` with
`zodResolver`, not shadcn `<Form>`/`<FormField>`. Errors render manually. Radix
`Select` rejects `""`, hence the `__none__` sentinel. One dialog handles both create
and edit via `isEditing = Boolean(entityToEdit)` and a memoized `buildDefaults()`.

**UI:** everything wraps in `<PageContainer>`. Toasts are sonner
(`toast.success('Bill updated')` / `toast.error(data?.error || '…')`). Deletes use the
shared `AlertModal`. Loading is a local `submitting` boolean that disables the button
and swaps its label — no spinners. Breadcrumbs derive automatically from the pathname.

## Invariants — do not "optimise" these

1. **Balances are derived from transactions.** No stored running-balance column, ever.
2. **Bills have no `isPaid` column.** A due date in the future already means it was paid.
3. **`src/lib/validations/*` must stay client-safe.** No `@/db` imports — those files
   are pulled into form components, and Postgres needs `net`/`tls`/`fs`, which breaks
   the client build.
4. **`bills.dueDate` is `date(…, { mode: 'string' })`, not `timestamp`.** A UTC server
   against an IST viewer flips "overdue" a day early.
5. **`src/config/site.ts` must stay true of the shipped product.** `productFeatures`
   and `productNonFeatures` feed both the marketing copy and the JSON-LD `featureList`,
   and AI answer engines quote them near-verbatim. Ship it, then describe it.
6. **Pass `serverNow` as a prop** wherever "now" affects rendering, so SSR and the
   first client paint agree. See `bills-view.tsx`.

## Environment

`DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` are required.
`NEXT_PUBLIC_SITE_URL` is optional and currently unset — `src/config/site.ts` falls
back to `VERCEL_PROJECT_PRODUCTION_URL`. Never substitute `VERCEL_URL`; it is
per-deployment and would make every preview claim to be canonical.

`.gitignore` only covers `.env*.local`, so a stray `.env` at the root is **not**
ignored. Don't create one.

## Git

Branch off `main` as `feat/…`, `fix/…` or `chore/…`; PR back against `main`. Husky
runs Prettier on commit. Only commit when asked.
