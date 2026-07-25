import { faqs } from '@/lib/structured-data';

/**
 * FAQ section — the highest-value block on the page for AI answer engines.
 *
 * Three deliberate choices:
 *
 * 1. Server-rendered, and intentionally NOT wrapped in ScrollReveal. Every
 *    other section animates in from opacity:0, which means the text is present
 *    in the HTML but invisible until framer-motion runs. For the block most
 *    likely to be quoted verbatim, plainly-visible markup is worth more than a
 *    fade-in.
 *
 * 2. <details>/<summary>, not a JS accordion. Answers stay in the DOM and stay
 *    expandable with JavaScript disabled.
 *
 * 3. Questions are phrased the way people actually type them ("Does BudgetBliss
 *    connect to my bank account?"), because question-shaped headings match
 *    query patterns. Answer text is shared with the FAQPage JSON-LD in
 *    src/lib/structured-data.ts — one source, so the visible copy and the
 *    markup can never contradict each other, which is itself a spam signal.
 *
 * Note: Google retired FAQ rich results for all sites on 2026-05-07, so this
 * earns no SERP rich result. It is here for AI answer engines and for readers.
 */
export default function FaqSection() {
  return (
    <section
      id='faq'
      className='mx-auto max-w-4xl scroll-mt-20 border-t border-white/5 px-6 py-20 md:py-32'
    >
      <div className='mb-14 text-center'>
        <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
          Frequently asked questions
        </h2>
        <p className='text-base text-neutral-400 md:text-lg'>
          Straight answers about what BudgetBliss tracks, what it costs, and
          what it deliberately will not do.
        </p>
      </div>

      <div className='flex flex-col gap-3'>
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className='group rounded-2xl border border-white/10 bg-neutral-900/40 transition-colors duration-200 open:bg-neutral-900/70 hover:border-white/20'
          >
            <summary className='flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left'>
              {/* h3 keeps the H1 > H2 > H3 hierarchy intact inside <summary>. */}
              <h3 className='font-nunito text-base font-semibold text-white md:text-lg'>
                {faq.question}
              </h3>
              <span
                aria-hidden='true'
                className='text-brand-400 shrink-0 text-xl leading-none transition-transform duration-200 group-open:rotate-45'
              >
                +
              </span>
            </summary>
            <p className='font-karla px-5 pb-5 text-sm leading-relaxed text-neutral-400 md:text-base'>
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
