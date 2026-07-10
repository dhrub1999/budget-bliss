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
    title: 'Create a free account.',
    description:
      'Sign up in seconds — no credit card required. Get instant access to your personal finance dashboard and start your financial journey right away.',
    image: '/images/feature-images/budget-planning.png'
  },
  {
    id: 'track',
    icon: LayoutDashboard,
    title: 'Stay top on your finances.',
    description:
      'Automatically track your expenses, set budgets, and manage savings effortlessly from one dashboard.',
    image: '/images/feature-images/expense-tracking.png'
  },
  {
    id: 'goals',
    icon: Target,
    title: 'Achieve your Goals.',
    description:
      'Set meaningful financial goals, track your progress in real-time, and celebrate every milestone on your path to financial freedom.',
    image: '/images/feature-images/savings-goals.png'
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
            Plan. Track. Achieve.
          </h2>
          <p className='text-base leading-relaxed text-neutral-400 md:text-lg'>
            Take control of your finances in just a few steps. BudgetBliss
            guides you from setup to success —helping you plan better, track
            smarter, and save more with ease.
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
                  alt={steps[activeIndex].title}
                  width={800}
                  height={500}
                  className='w-full object-cover'
                  priority
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
