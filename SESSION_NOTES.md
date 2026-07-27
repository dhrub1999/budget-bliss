# Session notes — landing page asset replacement

**Date:** 2026-07-27
**Branch:** `chore/landing-page`
**Status:** ✅ Complete — all 9 slots reshot, wired and verified.

---

## What this was

Every image on the landing page was a Figma mockup of a product that was never
built. `hero-image.png` showed _Reminders_, _Reports_ and _Settings_ sidebar routes
that do not exist, a fake Mastercard and a "10.2 Lakh" donut. That put the page in
conflict with **CLAUDE.md invariant #5** (site copy must stay true of the shipped
product), so this was a correctness fix, not a refresh.

There were **9 image slots served by only 4 files**, and slot 7 ("Add your
accounts") was showing the budgets screen.

## Result

**9 slots → 9 unique screenshots of the running app.**

| # | Slot | New asset | Size |
| :-- | :-- | :-- | --: |
| 1 | Hero | `hero-dashboard.webp` 1512×794 | 39 KB |
| 2 | Feature — accounts | `accounts-overview.webp` 1256×720 | 25 KB |
| 3 | Feature — category budgets | `category-budgets.webp` 1256×710 | 21 KB |
| 4 | Feature — savings goals | `savings-goals.webp` 1256×627 | 13 KB |
| 5 | Feature — split + utilisation | `split-expense.webp` 1256×656 | 26 KB |
| 6 | Feature — bills | `bills-upcoming.webp` 1256×715 | 27 KB |
| 7 | How it works — add accounts | `add-account.webp` 1256×656 | 23 KB |
| 8 | How it works — log spending | `log-transaction.webp` 1256×656 | 25 KB |
| 9 | How it works — fund goals | `fund-goal.webp` 1256×656 | 18 KB |
| — | OG / social preview | `og-dashboard.jpg` 1200×630 | 50 KB |
| — | Why manual | _text only, by design_ | — |

**1,516 KB of mockups → 267 KB of real screenshots**, and four of the nine slots
stopped being duplicates.

## Files changed

- `src/app/page.tsx` — hero src + dimensions; `<FeatureCard {...feature} />`
- `src/constants/data.ts` — 5 card images, `imageWidth`/`imageHeight` added to
  `FeatureCardProps`, alt text rewritten to describe the real screenshots
- `src/app/_components/landing-page/FeatureCard.tsx` — per-card image dimensions
- `src/app/_components/landing-page/HowItWorks.tsx` — 3 step images, shared 1256×656
- `src/config/site.ts` — `ogImage` → `og-dashboard.jpg`, `dateModified` bumped
- `scripts/optimize-images.mjs` — **new**, the optimiser now lives in the repo
- Deleted: `hero-image.png`, `hero-image.webp`, and the four feature-image PNGs

## Copy fix

Feature card 4 claimed the credit-utilisation warning is something "the dashboard
flags". It isn't — `computeTransactionWarnings` fires as a pre-submit confirm, and
the split-allocation rows show each card's live utilisation as you pick it. The
sentence now describes what the screenshot actually shows: you see a card heading
past 40% *before* you commit.

## Data

The screenshot account (`test@abc.com`) was reseeded with a coherent 3-month ledger
— 38 transactions across 8 categories dated May–Jul, 9 budgets, 7 bills. Every
figure in every screenshot reconciles: total available ₹5,98,799, card debt
₹2,11,544, net worth ₹3,87,255.

Deliberately arranged so each screenshot exercises a real state:

- **Dining Out 109% `OVER`**, Groceries 82% and Healthcare 83% `80%+` — the warning
  threshold is `spent >= amount * 0.8` (`budgeting-view.tsx:76`)
- **AXIS Platinum at 51%** — past `UTIL_WARN` (0.4), so the amber bar renders
- **All four bill buckets non-empty** — overdue / due today / this week / later,
  and the alt text's "rent, an EMI and a subscription" is now literally true
- No negative cash, no account or bill named after a person

Seed and backup scripts are in this session's **scratchpad, which is ephemeral**:
`seed.mjs`, `backup-before-seed.json` (the pre-reseed rows). Move them into the
repo if the data should be reproducible — they carry a hardcoded user UUID, so
they'd need parameterising first.

## Verified

- `npx tsc --noEmit` — clean
- `pnpm lint:strict` — 60 warnings, **all pre-existing**; identical count on a
  stashed tree, and none in any touched file. It was already failing on `main`.
- `pnpm build` — succeeds
- Landing page loaded in the browser: all 9 slots resolve, none broken, and the
  HowItWorks box no longer jumps between steps
