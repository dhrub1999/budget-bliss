'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, SquareCheck, Users, Flame } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for individuals starting their financial journey.',
    monthlyPrice: 0,
    icon: Flame,
    cta: 'Get Started with Free Plan',
    sectionLabel: 'Starter Plan',
    features: [
      'Add unlimited income & expenses',
      'Monthly budgeting tools',
      'Spending category tracking',
      'Access to goals & reports',
      'Email updates'
    ],
    highlight: false
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description:
      'Ideal for users who want deeper financial insights and automation.',
    monthlyPrice: 199,
    icon: Star,
    cta: 'Get Started with Pro Plan',
    sectionLabel: 'Pro Plan',
    features: [
      'Everything in Free plan',
      'Goal-based savings tracker',
      'Smart reminders (bill, rent, EMI)',
      'Export data (CSV, PDF)',
      'Priority Support'
    ],
    highlight: true
  },
  {
    id: 'family',
    name: 'Family Plan',
    description: 'Designed for managing household or group finances together.',
    monthlyPrice: 499,
    icon: Users,
    cta: 'Get Started with Family Plan',
    sectionLabel: 'Pro Plan',
    features: [
      'Everything in Pro plan',
      'Group-budgeting tools',
      'Role based permission',
      'Activity history & audit logs',
      'Dedicated support channel'
    ],
    highlight: false
  }
];

function formatPrice(monthly: number, yearly: boolean) {
  if (monthly === 0) return '₹0.00';
  const price = yearly ? Math.round(monthly * 0.8 * 100) / 100 : monthly;
  return `₹${price.toFixed(2)}`;
}

function PriceDisplay({
  monthly,
  yearly
}: {
  monthly: number;
  yearly: boolean;
}) {
  return (
    <div className='price-display mb-6 flex items-baseline gap-1'>
      <span
        key={yearly ? 'yearly' : 'monthly'}
        className='price-value text-3xl font-extrabold text-white'
        style={{ animation: 'priceFlip 0.35s ease forwards' }}
      >
        {formatPrice(monthly, yearly)}
      </span>
      <span className='text-sm text-neutral-500'>/month</span>
    </div>
  );
}

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id='pricing'
      className='mx-auto max-w-7xl scroll-mt-20 px-6 py-20 md:py-32'
    >
      {/* Heading */}
      <div className='mx-auto mb-8 max-w-3xl text-center md:mb-16'>
        <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
          Flexible Pricing That{' '}
          <span className='from-brand-300 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
            Grows
          </span>{' '}
          with You
        </h2>
        <p className='font-karla text-base text-neutral-400 md:text-lg'>
          Choose a plan that suits your lifestyle - no hidden charges, no
          stress.
        </p>
      </div>

      {/* Monthly / Yearly Toggle */}
      <div className='relative mb-14 flex items-center justify-center'>
        <div className='relative flex items-center gap-0 rounded-full border border-white/10 bg-neutral-900/60 p-1'>
          {/* Sliding pill background */}
          <span
            className='pointer-events-none absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300 ease-in-out'
            style={{
              left: isYearly ? 'calc(50%)' : '4px',
              width: 'calc(50% - 4px)'
            }}
          />
          <button
            id='billing-monthly'
            onClick={() => setIsYearly(false)}
            className={`relative z-10 cursor-pointer rounded-full px-7 py-2 text-sm font-semibold transition-colors duration-300 ${
              !isYearly ? 'text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            id='billing-yearly'
            onClick={() => setIsYearly(true)}
            className={`relative z-10 cursor-pointer rounded-full px-7 py-2 text-sm font-semibold transition-colors duration-300 ${
              isYearly ? 'text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Save 20% arrow annotation */}
        <div className='pointer-events-none absolute top-[20px] left-[calc(50%+132px)] flex flex-col items-start gap-y-4'>
          <svg
            width='57'
            height='36'
            viewBox='0 0 57 36'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M0.0287947 5.45869C0.131448 5.77372 0.288852 6.06817 0.493777 6.32853C0.788624 6.7234 1.13776 7.07465 1.53083 7.37189C6.17426 11.0969 10.1992 13.7545 10.5116 13.3078C10.8241 12.8612 7.57744 9.73166 3.1907 6.17304C3.92217 6.18146 4.89938 6.18633 6.1742 6.23982C7.44901 6.29331 9.08773 6.39992 11.0719 6.68937C13.4566 7.01841 15.8115 7.53597 18.1144 8.23717C19.5987 8.68616 21.0586 9.21236 22.488 9.81361C24.1649 10.5034 25.7927 11.3067 27.3602 12.218C28.2621 12.7444 29.1333 13.3215 29.9698 13.9466C29.9263 13.9698 29.8828 13.9931 29.8393 14.0163C27.3801 14.8215 25.2124 16.3331 23.6068 18.3625C22.2387 20.0692 21.4117 22.1457 21.232 24.3256C21.0522 26.5055 21.5278 28.6895 22.5978 30.5972C23.3146 31.9496 24.3144 33.1317 25.529 34.0632C26.7295 35.0137 28.1752 35.6038 29.698 35.765C31.1455 35.8986 32.6017 35.6264 33.9032 34.979C35.1522 34.3378 36.2459 33.4315 37.108 32.3235C37.9701 31.2155 38.5797 29.9325 38.8943 28.5643C39.4502 25.8336 39.1708 22.9988 38.0925 20.4291C37.252 18.3406 36.0353 16.424 34.5027 14.7748C35.3211 14.6974 36.1434 14.6687 36.9652 14.6888C39.089 14.7501 41.1999 15.0413 43.2611 15.5572C45.153 16.0102 46.9754 16.7153 48.6796 17.6536C50.1608 18.5023 51.4375 19.6662 52.4193 21.0628C53.8853 23.147 54.9068 25.5106 55.4201 28.0065C55.5561 28.9416 55.7424 29.8688 55.978 30.7839C56.1157 29.8407 56.0917 28.881 55.907 27.946C55.5657 25.2953 54.6337 22.755 53.1796 20.5126C52.1559 18.9318 50.7957 17.5966 49.1962 16.6025C47.4212 15.5349 45.508 14.7164 43.5101 14.1699C41.3561 13.5613 39.1425 13.1884 36.9081 13.0577C35.5707 12.9891 34.2299 13.0479 32.9037 13.233C31.5218 12.0046 30.0202 10.9179 28.4215 9.98906C26.752 9.01626 25.015 8.16411 23.2239 7.4391C19.3709 5.82989 15.3098 4.77339 11.1612 4.30097C9.4787 4.11498 7.78557 4.04321 6.0934 4.08614C5.06731 4.10469 4.04327 4.18524 3.0269 4.32736L2.55618 4.40323C2.61364 4.37631 2.66965 4.34637 2.72395 4.31355C3.13434 3.99032 3.51986 3.68039 3.88675 3.38041C4.62718 2.79288 5.28728 2.26427 5.83306 1.82074C6.94617 0.914163 7.56017 0.314331 7.43107 0.0877651C7.30197 -0.138801 6.45054 0.0766772 5.13698 0.682985C4.3661 1.04285 3.61528 1.44421 2.88781 1.8853C2.4591 2.11446 2.03874 2.41906 1.59601 2.71165C1.36408 2.87556 1.16902 3.0038 0.900254 3.20339C0.739793 3.32398 0.594387 3.4634 0.467156 3.61865C0.2802 3.83534 0.143959 4.09102 0.0683698 4.36706C-0.0262534 4.72161 -0.022594 5.09522 0.0789365 5.44786L0.0287947 5.45869ZM30.487 15.6912C30.8677 15.5516 31.2489 15.4277 31.6367 15.3163C31.8404 15.503 32.0436 15.674 32.2348 15.8673C33.8225 17.3891 35.0759 19.2248 35.9151 21.2576C36.808 23.3338 37.0615 25.6292 36.6433 27.8503C36.4101 28.9086 35.9513 29.9041 35.2982 30.7689C34.6451 31.6336 33.8131 32.3472 32.859 32.861C31.9108 33.3545 30.8438 33.5735 29.7779 33.4934C28.6724 33.3919 27.619 32.9766 26.7415 32.2966C25.7969 31.5628 25.0067 30.6494 24.4163 29.6091C23.8259 28.5688 23.447 27.422 23.3014 26.2348C23.0702 23.8866 23.7307 21.5373 25.1518 19.6536C26.5 17.835 28.3512 16.451 30.4771 15.6726'
              fill='#00990F'
            />
          </svg>

          <span
            className={`-mt-1 ml-3 text-xs font-semibold transition-all duration-300 ${
              isYearly ? 'text-brand-400' : 'text-neutral-500'
            }`}
          >
            Save 20%
          </span>
        </div>
      </div>

      {/* Yearly savings banner */}
      <div
        className={`mx-auto mb-10 max-w-sm overflow-hidden transition-all duration-500 ${
          isYearly ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='bg-brand-500/10 border-brand-500/30 text-brand-400 flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-center text-sm font-medium'>
          <span>🎉</span>
          <span>You&apos;re saving 20% with the yearly plan!</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3'>
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
                plan.highlight
                  ? 'border-brand-500/40 shadow-brand-500/10 hover:border-brand-500/60 bg-[#1a1a1a] shadow-xl'
                  : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
              }`}
            >
              {/* Icon */}
              <div className='bg-brand-500/10 mb-5 flex h-10 w-10 items-center justify-center rounded-xl'>
                <Icon className='text-brand-400 h-5 w-5' />
              </div>

              {/* Plan name & description */}
              <h3 className='font-nunito mb-1 text-xl font-bold text-white'>
                {plan.name}
              </h3>
              <p className='mb-6 text-sm leading-relaxed text-neutral-500'>
                {plan.description}
              </p>

              {/* Animated price */}
              <PriceDisplay monthly={plan.monthlyPrice} yearly={isYearly} />

              {/* Yearly total callout */}
              {plan.monthlyPrice > 0 && (
                <div
                  className={`-mt-4 mb-5 overflow-hidden transition-all duration-400 ${
                    isYearly ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className='text-xs text-neutral-500'>
                    Billed as{' '}
                    <span className='text-brand-400 font-semibold'>
                      ₹{(plan.monthlyPrice * 0.8 * 12).toFixed(0)}/year
                    </span>
                  </p>
                </div>
              )}

              {/* CTA */}
              <Button
                asChild
                className='bg-brand-500 hover:bg-brand-600 mb-8 w-full rounded-xl py-5 font-semibold text-white transition-all'
              >
                <Link href='/auth/sign-up'>{plan.cta}</Link>
              </Button>

              {/* Feature section label */}
              <p className='mb-4 text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
                {plan.sectionLabel}
              </p>

              {/* Feature list */}
              <ul className='flex flex-col gap-3'>
                {plan.features.map((feat, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 text-sm text-neutral-400'
                  >
                    <SquareCheck className='text-brand-400 h-4 w-4 shrink-0' />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* CSS keyframe for price flip animation */}
      <style>{`
        @keyframes priceFlip {
          0%   { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </section>
  );
}
