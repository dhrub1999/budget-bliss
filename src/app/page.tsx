import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import FeatureCard from './_components/landing-page/FeatureCard';
import { featureCards } from '@/constants/data';
import PricingSection from './_components/landing-page/PricingSection';
import HowItWorks from './_components/landing-page/HowItWorks';

export default async function Page() {
  return (
    <div className='min-h-screen overflow-x-hidden overflow-y-auto bg-[#1e1e1e] text-white'>
      {/* Radial glows for modern background aesthetics */}
      <div className='pointer-events-none absolute top-0 left-1/2 z-0 h-[600px] w-full max-w-7xl -translate-x-1/2 overflow-hidden opacity-30'>
        <div className='bg-brand-500 absolute -top-40 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full blur-[150px] duration-4000' />
        <div className='bg-brand-300/40 absolute -top-40 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full blur-[120px] duration-3000' />
      </div>

      {/* Hero Section */}
      <section className='relative w-full bg-gradient-to-b from-[#212121] to-[#121212]'>
        <div className='relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-16 text-center md:pt-32 md:pb-24'>
          <div className='border-brand-500/20 bg-brand-500/5 text-brand-400 animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold md:text-sm'>
            <Sparkles className='text-brand-400 h-4 w-4' />
            <span>Budgeting made blissful and automated</span>
          </div>

          <h1 className='font-nunito mb-6 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl'>
            Your Finances, Organised <span className=''>& Optimised.</span>
          </h1>

          <p className='font-karla mb-10 max-w-2xl text-2xl leading-relaxed text-neutral-400 md:text-xl'>
            Gain complete visibility into your spending habits and make informed
            financial decisions.
          </p>

          <div className='mb-16 flex flex-col items-center gap-4 sm:flex-row'>
            <Button
              asChild
              size='lg'
              className='bg-brand-500 hover:bg-brand-600 shadow-brand-500/30 flex items-center gap-2 rounded-xl px-8 py-6 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105'
            >
              <Link href='/auth/sign-up'>
                Get Started Free <ArrowRight className='h-5 w-5' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='rounded-xl border-white/10 px-8 py-6 text-base text-neutral-300 transition-all hover:bg-white/5 hover:text-white'
            >
              <Link href='#features'>Explore Features</Link>
            </Button>
          </div>

          <div className='mx-auto mt-6 w-full max-w-6xl'>
            <Image
              src={'/images/hero-image.png'}
              height={2160}
              width={1440}
              alt='Product dashboard image'
              className='w-full'
            />
          </div>

          {/* Dashboard Mockup Container */}
          {/* <div className='hover:border-brand-500/20 w-full max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/60 p-3 shadow-2xl shadow-black/80 backdrop-blur-md transition-all duration-500 md:p-4'>
            <div className='flex aspect-[16/10] w-full flex-col overflow-hidden rounded-xl border border-white/5 bg-[#141414]'>
              <div className='flex items-center justify-between border-b border-white/5 bg-[#1e1e1e] px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <span className='h-3 w-3 rounded-full bg-red-500/80' />
                  <span className='h-3 w-3 rounded-full bg-yellow-500/80' />
                  <span className='h-3 w-3 rounded-full bg-green-500/80' />
                  <span className='ml-4 font-mono text-xs text-neutral-500'>
                    budget-bliss.app/dashboard
                  </span>
                </div>
                <div className='h-4 w-20 rounded-full bg-neutral-800' />
              </div> */}

          {/* Mockup Body Layout */}
          {/* <div className='min-h-full w-full bg-[url(/images/hero-image.png)] bg-cover bg-center'> */}
          {/* Mockup Sidebar */}
          {/* <div className='hidden w-1/5 flex-col gap-4 border-r border-white/5 bg-[#171717] p-3 md:flex'>
                  <div className='bg-brand-500/10 border-brand-500/20 flex h-8 w-full items-center rounded-lg border px-2'>
                    <div className='bg-brand-500 h-3 w-3 rounded-full' />
                  </div>
                  <div className='flex flex-col gap-2'>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className='h-6 w-full rounded-md bg-neutral-800/50'
                      />
                    ))}
                  </div>
                </div> */}

          {/* <div className='flex flex-1 flex-col gap-4 overflow-hidden p-4 text-left md:p-6'>
                  <div className='grid grid-cols-3 gap-3'>
                    <div className='rounded-xl border border-white/5 bg-[#1e1e1e] p-3'>
                      <span className='block text-[10px] font-bold tracking-wider text-neutral-500 uppercase'>
                        Total Balance
                      </span>
                      <span className='mt-1 block text-sm font-bold text-white md:text-xl'>
                        $14,248.50
                      </span>
                      <span className='text-brand-400 mt-1 block text-[9px] font-semibold'>
                        +12.5% this month
                      </span>
                    </div>
                    <div className='rounded-xl border border-white/5 bg-[#1e1e1e] p-3'>
                      <span className='block text-[10px] font-bold tracking-wider text-neutral-500 uppercase'>
                        Monthly Income
                      </span>
                      <span className='mt-1 block text-sm font-bold text-white md:text-xl'>
                        $8,400.00
                      </span>
                      <span className='mt-1 block text-[9px] text-neutral-500'>
                        Salary & Freelance
                      </span>
                    </div>
                    <div className='rounded-xl border border-white/5 bg-[#1e1e1e] p-3'>
                      <span className='block text-[10px] font-bold tracking-wider text-neutral-500 uppercase'>
                        Total Expenses
                      </span>
                      <span className='mt-1 block text-sm font-bold text-neutral-200 md:text-xl'>
                        $3,120.40
                      </span>
                      <span className='mt-1 block text-[9px] font-semibold text-red-400'>
                        37.1% of monthly budget
                      </span>
                    </div>
                  </div>

                  <div className='grid flex-1 grid-cols-1 gap-3 overflow-hidden md:grid-cols-2'>
                    <div className='flex flex-col justify-between rounded-xl border border-white/5 bg-[#1e1e1e] p-3'>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-xs font-semibold text-neutral-400'>
                          Spending Overview
                        </span>
                        <span className='bg-brand-500/10 text-brand-400 rounded px-2 py-0.5 text-[9px]'>
                          Weekly
                        </span>
                      </div>
                      <div className='flex h-20 items-end justify-between gap-1 pt-4'>
                        <div className='bg-brand-500/25 h-[40%] w-full rounded-sm' />
                        <div className='bg-brand-500/40 h-[60%] w-full rounded-sm' />
                        <div className='bg-brand-500/20 h-[30%] w-full rounded-sm' />
                        <div className='bg-brand-500/70 h-[80%] w-full rounded-sm' />
                        <div className='bg-brand-500 h-[95%] w-full rounded-sm' />
                        <div className='bg-brand-500/50 h-[55%] w-full rounded-sm' />
                        <div className='bg-brand-500/80 h-[75%] w-full rounded-sm' />
                      </div>
                    </div>

                    <div className='flex flex-col justify-between rounded-xl border border-white/5 bg-[#1e1e1e] p-3'>
                      <span className='mb-2 block text-xs font-semibold text-neutral-400'>
                        Recent Transactions
                      </span>
                      <div className='flex flex-col gap-2 overflow-hidden'>
                        <div className='flex items-center justify-between border-b border-white/5 pb-1 text-[10px]'>
                          <div>
                            <p className='font-semibold text-white'>
                              Groceries (Whole Foods)
                            </p>
                            <p className='text-[8px] text-neutral-500'>
                              Today, 10:24 AM
                            </p>
                          </div>
                          <span className='font-semibold text-red-400'>
                            -$142.50
                          </span>
                        </div>
                        <div className='flex items-center justify-between border-b border-white/5 pb-1 text-[10px]'>
                          <div>
                            <p className='font-semibold text-white'>
                              Stripe Payout (Freelance)
                            </p>
                            <p className='text-[8px] text-neutral-500'>
                              Yesterday, 4:15 PM
                            </p>
                          </div>
                          <span className='text-brand-400 font-semibold'>
                            +$2,450.00
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-[10px]'>
                          <div>
                            <p className='font-semibold text-white'>
                              Netflix Subscription
                            </p>
                            <p className='text-[8px] text-neutral-500'>
                              June 28, 2026
                            </p>
                          </div>
                          <span className='font-semibold text-red-400'>
                            -$15.49
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
          {/* </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Trusted By Banner */}
      <section className='border-y border-white/5 bg-neutral-900/40 py-12 text-center'>
        <div className='mx-auto max-w-7xl px-6'>
          <p className='mb-6 text-xs font-semibold tracking-widest text-neutral-500 uppercase'>
            Loved by thousands of conscious spenders
          </p>
          <div className='flex flex-wrap items-center justify-center gap-8 opacity-40 md:gap-16'>
            <span className='font-nunito text-xl font-extrabold tracking-tight'>
              PRODUCT HUNT
            </span>
            <span className='font-nunito text-xl font-extrabold tracking-tight'>
              FINTECH WEEKLY
            </span>
            <span className='font-nunito text-xl font-extrabold tracking-tight'>
              VENTUREBEAT
            </span>
            <span className='font-nunito text-xl font-extrabold tracking-tight'>
              SAAS CENTRAL
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className='mx-auto max-w-7xl scroll-mt-20 px-6 py-20 md:py-32'
      >
        <div className='mx-auto mb-16 max-w-3xl text-center md:mb-24'>
          <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
            Everything you Need to{' '}
            <span className='from-brand-300 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
              Master your Money
            </span>
          </h2>
          <p className='text-base text-neutral-400 md:text-lg'>
            Say goodbye to clunky spreadsheets and hidden bank fees. Budget
            Bliss puts you back in the driver&apos;s seat of your financial
            future.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {featureCards.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              imageUrl={feature.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Pricing Section — interactive client component */}
      <PricingSection />

      {/* About Us & FAQ Section */}
      <section
        id='about-us'
        className='mx-auto max-w-5xl scroll-mt-20 border-t border-white/5 px-6 py-20 md:py-32'
      >
        <div className='grid grid-cols-1 gap-12 md:grid-cols-12'>
          {/* About us */}
          <div className='md:col-span-5'>
            <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white'>
              About Budget Bliss
            </h2>
            <p className='mb-6 text-sm leading-relaxed text-neutral-400 md:text-base'>
              Budget Bliss was born out of a simple need: a personal finance
              tracker that is secure, fast, and does not sell user data.
            </p>
            <p className='text-sm leading-relaxed text-neutral-400 md:text-base'>
              We leverage modern technology, client-side encryption concepts,
              and top-tier provider pipelines like Clerk to ensure your
              financial credentials remain yours alone. We believe financial
              tracking should be a calm, rewarding daily habit, not a chore.
            </p>
          </div>

          {/* FAQs using summary/details elements styled with tailwind */}
          <div
            id='testimonials'
            className='flex scroll-mt-20 flex-col gap-4 md:col-span-7'
          >
            <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white'>
              Frequently Asked Questions
            </h2>

            <div className='flex flex-col gap-3'>
              <details className='group rounded-xl border border-white/5 bg-neutral-900/20 p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden'>
                <summary className='flex cursor-pointer items-center justify-between focus:outline-none'>
                  <h3 className='flex items-center gap-2 text-sm font-semibold text-neutral-200 transition-colors group-hover:text-white md:text-base'>
                    <HelpCircle className='text-brand-400 h-4 w-4' />
                    <span>Is my financial data secure?</span>
                  </h3>
                  <span className='text-neutral-400 transition-transform group-open:rotate-180'>
                    &darr;
                  </span>
                </summary>
                <p className='mt-3 pl-6 text-xs leading-relaxed text-neutral-400 md:text-sm'>
                  Absolutely. Your authentication is secured by Clerk, a
                  world-class identity system. We store your entries securely
                  using industry-standard encrypted tables. We never see nor
                  store your plaintext banking login details.
                </p>
              </details>

              <details className='group rounded-xl border border-white/5 bg-neutral-900/20 p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden'>
                <summary className='flex cursor-pointer items-center justify-between focus:outline-none'>
                  <h3 className='flex items-center gap-2 text-sm font-semibold text-neutral-200 transition-colors group-hover:text-white md:text-base'>
                    <HelpCircle className='text-brand-400 h-4 w-4' />
                    <span>Can I import my data from other trackers?</span>
                  </h3>
                  <span className='text-neutral-400 transition-transform group-open:rotate-180'>
                    &darr;
                  </span>
                </summary>
                <p className='mt-3 pl-6 text-xs leading-relaxed text-neutral-400 md:text-sm'>
                  Yes. Pro users can import CSV transactions from major banks
                  and popular tools like Mint or YNAB directly in the settings
                  dashboard.
                </p>
              </details>

              <details className='group rounded-xl border border-white/5 bg-neutral-900/20 p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden'>
                <summary className='flex cursor-pointer items-center justify-between focus:outline-none'>
                  <h3 className='flex items-center gap-2 text-sm font-semibold text-neutral-200 transition-colors group-hover:text-white md:text-base'>
                    <HelpCircle className='text-brand-400 h-4 w-4' />
                    <span>Do you offer a refund if I upgrade to Pro?</span>
                  </h3>
                  <span className='text-neutral-400 transition-transform group-open:rotate-180'>
                    &darr;
                  </span>
                </summary>
                <p className='mt-3 pl-6 text-xs leading-relaxed text-neutral-400 md:text-sm'>
                  Yes, we offer a 14-day money-back guarantee. If you decide Pro
                  is not for you within the first 14 days, contact support and
                  we will issue a full refund, no questions asked.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className='border-t border-white/5 bg-neutral-950/80 px-6 py-12'>
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-neutral-500 md:flex-row'>
          <div className='flex items-center gap-2'>
            <span className='font-nunito text-base font-bold text-white'>
              Budget Bliss
            </span>
            <span className='text-neutral-600'>|</span>
            <span>Budgeting made blissful.</span>
          </div>
          <div className='flex gap-6'>
            <Link
              href='#features'
              className='transition-colors hover:text-neutral-300'
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className='transition-colors hover:text-neutral-300'
            >
              Pricing
            </Link>
            <Link
              href='#about-us'
              className='transition-colors hover:text-neutral-300'
            >
              Privacy Policy
            </Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Budget Bliss. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
