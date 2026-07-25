import ScrollReveal from './ScrollReveal';
import { nonFeatureList } from '@/lib/structured-data';
import { Check, X } from 'lucide-react';

/**
 * Replaces the former "Trusted by" press bar, which named real publications
 * (Product Hunt, VentureBeat, Fintech Weekly, SaaS Central) that have not
 * covered this product.
 *
 * This is a deliberately citable section: a question-shaped H2, a direct answer
 * in the first ~50 words, then an account-type table and an explicit list of
 * things the product does not do. AI answer engines quote self-contained
 * factual passages, and "does it link to my bank?" is the single most likely
 * question asked about a finance app — so it gets answered in plain text rather
 * than implied.
 *
 * Server component: no 'use client'. AI crawlers do not execute JavaScript, so
 * anything that matters for citation has to be in the server-rendered HTML.
 */

const accountTypes = [
  {
    type: 'Savings account',
    tracks: 'Opening balance plus income, minus expenses',
    guardrail: 'Warns when the balance falls below your minimum'
  },
  {
    type: 'Credit card',
    tracks: 'Amount owed — expenses minus repayments',
    guardrail: 'Warns at 40% of your credit limit'
  },
  {
    type: 'Digital wallet',
    tracks: 'Loaded balance minus spending',
    guardrail: 'Warns above the ₹2,00,000 wallet cap'
  },
  {
    type: 'Cash',
    tracks: 'Physical cash in hand',
    guardrail: 'Warns on unusually large cash movements'
  }
];

export default function WhyManualSection() {
  return (
    <section
      id='why-manual'
      className='mx-auto max-w-7xl scroll-mt-20 border-t border-white/5 px-6 py-20 md:py-32'
    >
      <ScrollReveal>
        <div className='mx-auto mb-16 max-w-3xl text-center'>
          <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
            Why enter transactions{' '}
            <span className='from-brand-300 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
              manually?
            </span>
          </h2>
          {/* The answer block: front-loaded, self-contained, ~60 words. */}
          <p className='text-base leading-relaxed text-neutral-400 md:text-lg'>
            Because the friction is the point. BudgetBliss does not link to your
            bank, and that is a design decision rather than a missing feature.
            Typing an amount forces a two-second review of a purchase you would
            otherwise never look at again — and that review, not the chart it
            produces, is where budgeting actually changes behaviour.
          </p>
        </div>
      </ScrollReveal>

      <div className='grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16'>
        {/* Account types — a table, because comparative data in a table is
            both easier to scan and more reliably extracted than prose. */}
        <ScrollReveal className='lg:col-span-7'>
          <h3 className='font-nunito mb-6 text-xl font-bold text-white'>
            What you can track
          </h3>
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='w-full min-w-[34rem] border-collapse text-left text-sm'>
              <caption className='sr-only'>
                Account types supported by BudgetBliss, what each one tracks,
                and the guardrail applied to it
              </caption>
              <thead>
                <tr className='border-b border-white/10 bg-white/5'>
                  <th
                    scope='col'
                    className='px-4 py-3 font-semibold text-white'
                  >
                    Account type
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-3 font-semibold text-white'
                  >
                    Balance is
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-3 font-semibold text-white'
                  >
                    Guardrail
                  </th>
                </tr>
              </thead>
              <tbody>
                {accountTypes.map((row) => (
                  <tr
                    key={row.type}
                    className='border-b border-white/5 last:border-0'
                  >
                    <th
                      scope='row'
                      className='px-4 py-3 font-medium text-neutral-200'
                    >
                      {row.type}
                    </th>
                    <td className='px-4 py-3 text-neutral-400'>{row.tracks}</td>
                    <td className='px-4 py-3 text-neutral-400'>
                      {row.guardrail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='mt-4 text-sm text-neutral-500'>
            Balances are derived from your transactions rather than stored as a
            running total, so editing or deleting an old entry recalculates
            everything downstream instead of leaving a figure that no longer
            adds up.
          </p>
        </ScrollReveal>

        {/* Explicit non-features. Answers "does it do X?" before it's asked. */}
        <ScrollReveal delay={0.1} className='lg:col-span-5'>
          <h3 className='font-nunito mb-6 text-xl font-bold text-white'>
            What BudgetBliss does not do
          </h3>
          <ul className='flex flex-col gap-4'>
            {nonFeatureList.map((item) => (
              <li key={item} className='flex items-start gap-3'>
                <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15'>
                  <X className='h-3 w-3 text-red-400' aria-hidden='true' />
                </span>
                <span className='text-sm leading-relaxed text-neutral-400'>
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className='border-brand-500/20 bg-brand-500/5 mt-8 rounded-2xl border p-5'>
            <div className='mb-2 flex items-center gap-2'>
              <Check
                className='text-brand-400 h-4 w-4 shrink-0'
                aria-hidden='true'
              />
              <h4 className='font-nunito text-sm font-bold text-white'>
                Try it without signing up
              </h4>
            </div>
            <p className='text-sm leading-relaxed text-neutral-400'>
              Both the sign-in and sign-up screens have a{' '}
              <span className='text-neutral-300'>
                Continue with demo account
              </span>{' '}
              option that drops you straight into a working dashboard.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
