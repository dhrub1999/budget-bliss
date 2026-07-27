'use client';
import ScrollReveal from './ScrollReveal';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, LayoutDashboard, Target, UserPlus } from 'lucide-react';

const AUTO_ADVANCE_MS = 4000;

const steps = [
  {
    id: 'account',
    icon: UserPlus,
    title: 'Add your accounts',
    description:
      'Sign up free — no card required — then add the accounts you actually use: a savings account, a credit card, a wallet, cash. Give each one its opening balance and BudgetBliss works out every balance from there.',
    // Was budget-planning.png, which showed the budgets screen — the wrong
    // subject entirely for a step about adding accounts.
    image: '/images/feature-images/add-account.webp',
    imageAlt:
      'The add-account form in BudgetBliss offering savings, credit card, wallet and cash types, with name, bank and opening-balance fields'
  },
  {
    id: 'track',
    icon: LayoutDashboard,
    // Was "Automatically track your expenses" — there is no automation here,
    // and the claim contradicted the product's whole premise.
    title: 'Log what you spend',
    description:
      'Enter each transaction against the account it came from — a few seconds per entry, and the two-second review is the part that changes behaviour. Set monthly budgets per category and the dashboard shows what is left as you go.',
    image: '/images/feature-images/log-transaction.webp',
    imageAlt:
      'Logging a ₹1,450 Blinkit expense in BudgetBliss against the Groceries category, paid from a savings account'
  },
  {
    id: 'goals',
    icon: Target,
    title: 'Fund your goals',
    description:
      'Create a savings goal, then contribute to it from real income rather than an aspiration. Contributions are earmarked against the goal, so progress reflects money you genuinely set aside.',
    image: '/images/feature-images/fund-goal.webp',
    imageAlt:
      'Topping up a Foreign Trip savings goal in BudgetBliss with ₹5,000, showing ₹62,000 saved of a ₹1.2 lakh target'
  }
];

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCycle = (fromIndex: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const next = (fromIndex + 1) % steps.length;
      setImageVisible(false);
      setTimeout(() => {
        setActiveIndex(next);
        setImageVisible(true);
        startCycle(next);
      }, 220);
    }, AUTO_ADVANCE_MS);
  };

  useEffect(() => {
    startCycle(0);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserClick = (index: number) => {
    if (index === activeIndex) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setImageVisible(false);
    setTimeout(() => {
      setActiveIndex(index);
      setImageVisible(true);
      startCycle(index);
    }, 220);
  };

  return (
    <section
      id='how-it-works'
      className='mx-auto max-w-7xl scroll-mt-20 px-6 py-20 md:py-32'
    >
      {/* Badge */}
      <ScrollReveal>
        <div className='mb-6 flex justify-center'>
          <span className='border-brand-500/40 bg-brand-500/5 text-brand-400 inline-flex items-center rounded-full border px-5 py-1.5 text-sm font-semibold tracking-wide'>
            How it works
          </span>
        </div>
      </ScrollReveal>

      {/* Heading */}
      <ScrollReveal delay={0.08}>
        <div className='mx-auto mb-16 max-w-3xl text-center'>
          <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
            How BudgetBliss works
          </h2>
          <p className='text-base leading-relaxed text-neutral-400 md:text-lg'>
            Three steps, and none of them involve a bank login: add your
            accounts, log what you spend, fund your goals.
          </p>
        </div>
      </ScrollReveal>

      {/* Main two-column layout */}
      <div className='grid grid-cols-1 items-start gap-12 md:grid-cols-2'>
        {/* Left — accordion */}
        <div className='flex flex-col gap-4'>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeIndex === index;

            return (
              <button
                key={step.id}
                onClick={() => handleUserClick(index)}
                className={`group w-full rounded-2xl border text-left transition-all duration-300 focus:outline-none ${
                  isActive
                    ? 'border-white/15 bg-neutral-900/70'
                    : 'border-white/5 bg-neutral-900/30 hover:border-white/10 hover:bg-neutral-900/50'
                }`}
              >
                {/* Header row */}
                <div className='flex items-center gap-4 px-5 py-4'>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-500/20'
                        : 'bg-neutral-800 group-hover:bg-neutral-700'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-300 ${
                        isActive ? 'text-brand-400' : 'text-neutral-500'
                      }`}
                    />
                  </div>

                  <span
                    className={`flex-1 text-base font-semibold transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    {step.title}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300 ${
                      isActive ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {/* Expandable body */}
                <div
                  style={{
                    maxHeight: isActive ? '160px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease-in-out'
                  }}
                >
                  <p className='px-5 pb-5 text-sm leading-relaxed text-neutral-400'>
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right — image panel, sticky so it never shifts with accordion */}
        <div className='sticky top-8 self-start'>
          <div className='relative'>
            <div className='bg-brand-500/10 pointer-events-none absolute inset-0 -z-10 rounded-3xl blur-3xl' />
            <div
              style={{
                opacity: imageVisible ? 1 : 0,
                transform: imageVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.25s ease, transform 0.25s ease'
              }}
            >
              <div className='overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60'>
                <Image
                  key={steps[activeIndex].id}
                  src={steps[activeIndex].image}
                  alt={steps[activeIndex].imageAlt}
                  // All three step screenshots are cropped to the same size on
                  // purpose: they cycle inside this one box, and a differing
                  // aspect ratio would make it jump on every advance.
                  width={1256}
                  height={656}
                  className='w-full object-cover'
                  // No `priority`: this section is well below the fold, and
                  // preloading it competed with the hero image for LCP.
                  loading='lazy'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className='mt-20 flex justify-center'>
        <Button
          asChild
          size='lg'
          className='bg-brand-500 hover:bg-brand-600 shadow-brand-500/30 flex items-center gap-3 rounded-xl px-10 py-6 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105'
        >
          <Link href='/auth/sign-up'>
            Get Started
            <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm'>
              ⊕
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
