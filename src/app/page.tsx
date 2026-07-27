import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles, Mail, Heart } from 'lucide-react';
import Image from 'next/image';
import FeatureCard from './_components/landing-page/FeatureCard';
import { featureCards } from '@/constants/data';
import PricingSection from './_components/landing-page/PricingSection';
import HowItWorks from './_components/landing-page/HowItWorks';
import WhyManualSection from './_components/landing-page/WhyManualSection';
import FaqSection from './_components/landing-page/FaqSection';
import CTASection from './_components/landing-page/CTASection';
import ScrollReveal, {
  StaggerContainer,
  StaggerItem
} from './_components/landing-page/ScrollReveal';
import { landingPageSchema } from '@/lib/structured-data';
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';

/**
 * Page-level metadata. Deliberately no `title` — omitting it inherits the root
 * layout's `title.default`, which already ends in the brand. Setting one here
 * would run the `%s | BudgetBliss` template and duplicate the suffix.
 */
export const metadata: Metadata = {
  description: siteConfig.description,
  alternates: { canonical: '/' }
};

export default async function Page() {
  return (
    <div
      className='min-h-screen overflow-x-hidden overflow-y-auto bg-[#1e1e1e] text-white'
      style={{ scrollBehavior: 'smooth' }}
    >
      {/*
        Organization + WebSite + WebApplication + FAQPage as one @graph.
        Emitted from a server component so it lands in the initial HTML: AI
        crawlers don't run JavaScript, and Google's Dec 2025 JS SEO guidance
        warns that client-injected structured data can be processed late.
      */}
      <script
        type='application/ld+json'
        // Schema content is our own static config, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingPageSchema) }}
      />
      {/* Radial glows for modern background aesthetics */}
      <div className='pointer-events-none absolute top-0 left-1/2 z-0 h-[600px] w-full max-w-7xl -translate-x-1/2 overflow-hidden opacity-30'>
        <div className='bg-brand-500 absolute -top-40 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full blur-[150px] duration-4000' />
        <div className='bg-brand-300/40 absolute -top-40 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full blur-[120px] duration-3000' />
      </div>

      {/* Hero Section */}
      <section className='relative w-full bg-gradient-to-b from-[#212121] to-[#121212]'>
        <div className='relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-16 text-center md:pt-32 md:pb-24'>
          <ScrollReveal delay={0.05}>
            <div className='border-brand-500/20 bg-brand-500/5 text-brand-400 animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold md:text-sm'>
              <Sparkles className='text-brand-400 h-4 w-4' />
              {/* Was "Budgeting made blissful and automated" — nothing here is
                  automated, and that claim contradicted the whole product. */}
              <span>Manual by design — no bank linking, ever</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            {/* One H1, leading with the primary keyword phrase rather than an
                abstraction ("Your Finances, Organised & Optimised" matched no
                query anyone types). */}
            <h1 className='font-nunito mb-6 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl'>
              The personal finance tracker that{' '}
              <span className='from-brand-300 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
                never touches your bank
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            {/* Front-loaded answer block. Roughly 45 words, self-contained, and
                naming the four account types — this is the passage most likely
                to be lifted into an AI answer, so it has to stand alone. */}
            <p className='font-karla mb-10 max-w-2xl text-xl leading-relaxed text-neutral-400 md:text-xl'>
              BudgetBliss is a free budget planner where you log every
              transaction yourself. Track savings accounts, credit cards,
              digital wallets and cash in one dashboard, set monthly category
              budgets, and save towards goals — without handing your bank
              credentials to anyone.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.28}>
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
          </ScrollReveal>

          <ScrollReveal
            delay={0.35}
            direction='none'
            className='mt-8 w-full max-w-5xl md:max-w-6xl'
          >
            <div className='shadow-brand-500/20 relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-2 shadow-2xl backdrop-blur-sm md:rounded-3xl md:p-3'>
              <Image
                src={'/images/hero-dashboard.webp'}
                height={794}
                width={1512}
                // Descriptive alt: "Product dashboard image" told a screen
                // reader nothing and image search even less.
                alt='The BudgetBliss dashboard showing total available, net worth and card debt above a list of account balances, a spending-category breakdown, savings goals and recent transactions'
                className='h-auto w-full rounded-xl object-cover md:rounded-2xl'
                // Hero image is the LCP element — priority is correct here, and
                // is the one place on the page it should be used.
                priority
                sizes='(max-width: 768px) 100vw, 1096px'
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/*
        The "Trusted by" bar was removed. It read "Loved by thousands of
        conscious spenders" above logos for Product Hunt, Fintech Weekly,
        VentureBeat and SaaS Central — four real organisations that have not
        covered this product, under a user count that does not exist.
        WhyManualSection now occupies this slot with verifiable substance.
      */}

      {/* Features Section */}
      <section
        id='features'
        className='mx-auto max-w-7xl scroll-mt-20 px-6 py-20 md:py-32'
      >
        <ScrollReveal>
          <div className='mx-auto mb-16 max-w-3xl text-center md:mb-24'>
            <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
              What you can{' '}
              <span className='from-brand-300 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
                actually do with it
              </span>
            </h2>
            <p className='text-base text-neutral-400 md:text-lg'>
              Five things, built and shipped. Accounts across savings, cards,
              wallets and cash; monthly category budgets; savings goals funded
              from real income; split expenses with credit-utilisation warnings;
              and bill, rent and EMI due dates you enter yourself.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {featureCards.map((feature, index) => (
            <StaggerItem key={index}>
              {/* Spread rather than listed field by field: the card's props
                  are exactly FeatureCardProps, and enumerating them here means
                  every new one has to be threaded through by hand. */}
              <FeatureCard {...feature} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Why manual + account-type table + explicit non-features */}
      <WhyManualSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Pricing Section — interactive client component */}
      <PricingSection />

      {/* FAQ — server-rendered Q&A, shares its copy with the FAQPage JSON-LD */}
      <FaqSection />

      {/* About Us & FAQ Section — temporarily commented out
      <section
        id='about-us'
        className='mx-auto max-w-5xl scroll-mt-20 border-t border-white/5 px-6 py-20 md:py-32'
      >
        <div className='grid grid-cols-1 gap-12 md:grid-cols-12'>
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

          <div
            id='testimonials'
            className='flex scroll-mt-20 flex-col gap-4 md:col-span-7'
          >
            <h2 className='font-nunito mb-6 text-3xl font-extrabold text-white'>
              Frequently Asked Questions
            </h2>
            ... FAQs ...
          </div>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <CTASection />

      {/* Footer Section */}
      <footer className='border-t border-white/5 bg-[#111111] px-6 pt-16 pb-0'>
        <div className='mx-auto max-w-7xl'>
          {/* Main grid: brand + 4 columns
              Mobile  : 1 col (brand full-width, then 2×2 link grid below)
              sm      : 2 col (brand | 2×2 links)
              lg      : 5 col (brand | Quick Links | Services | Resources | Connect)
          */}
          <div className='grid grid-cols-1 gap-x-8 gap-y-12 pb-14 sm:grid-cols-2 lg:grid-cols-6 lg:gap-x-20'>
            {/* Brand — spans full width on mobile, 1 col on lg */}
            <div className='sm:col-span-1 lg:col-span-2 lg:border-r lg:border-white/5 lg:pr-8'>
              <div className='mb-4'>
                <Image
                  src='/logo/Logo.svg'
                  alt='Budget Bliss'
                  width={182}
                  height={26}
                  className='h-7 w-auto'
                  priority
                />
              </div>
              {/*
                Was "…insightful reports, and timely reminders". Nothing here
                sends a reminder — there is no email, SMS or push channel. Bills
                are due dates you enter and the app surfaces when you open it.
              */}
              <p className='max-w-xs text-sm leading-relaxed text-neutral-400'>
                BudgetBliss helps individuals take control of their personal
                finances with category budgets, savings goals and bill due dates
                you enter yourself—all in a clean, intuitive, and user-friendly
                platform.
              </p>
            </div>

            {/* Link columns container
                Mobile : 2×2 grid
                sm     : single cell that fills the second column — keeps 2×2 internally
                lg     : dissolves; each column becomes its own lg grid cell
            */}
            <div className='grid grid-cols-2 gap-x-8 gap-y-10 sm:col-span-1 lg:col-span-4 lg:grid-cols-4'>
              {/* Quick Links */}
              <div>
                <h3 className='mb-5 text-sm font-semibold tracking-wide text-white'>
                  Quick Links
                </h3>
                <ul className='flex flex-col gap-3 text-sm text-neutral-400'>
                  {[
                    { label: 'Features', href: '#features' },
                    { label: 'Why manual', href: '#why-manual' },
                    { label: 'How it works', href: '#how-it-works' },
                    { label: 'Pricing', href: '#pricing' },
                    // Replaces the '#testimonials' link — that section is gone.
                    { label: 'FAQ', href: '#faq' }
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className='transition-colors duration-200 hover:text-white'
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h3 className='mb-5 text-sm font-semibold tracking-wide text-white'>
                  Features
                </h3>
                <ul className='flex flex-col gap-3 text-sm text-neutral-400'>
                  {[
                    { label: 'Accounts & cards', href: '#features' },
                    { label: 'Category budgets', href: '#features' },
                    { label: 'Savings goals', href: '#features' },
                    { label: 'Split expenses', href: '#features' },
                    { label: 'Bills & upcoming', href: '#features' }
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className='transition-colors duration-200 hover:text-white'
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className='mb-5 text-sm font-semibold tracking-wide text-white'>
                  Resources
                </h3>
                <ul className='flex flex-col gap-3 text-sm text-neutral-400'>
                  {[
                    // Blog and Help Center dropped — both pointed at '#'. A
                    // link to nowhere is worse than no link, and a footer full
                    // of them reads as an abandoned site to crawlers too.
                    { label: 'FAQ', href: '#faq' },
                    { label: 'Privacy Policy', href: '/privacy' },
                    { label: 'Terms of Service', href: '/terms' },
                    {
                      label: 'Contact',
                      href: `mailto:${siteConfig.email}`
                    }
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className='transition-colors duration-200 hover:text-white'
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h3 className='mb-5 text-sm font-semibold tracking-wide text-white'>
                  Connect
                </h3>
                <div className='flex flex-wrap gap-3'>
                  {[
                    // Only the email is real. The Website/Facebook/LinkedIn/
                    // Instagram icons all pointed at '#' — add each back when
                    // the profile actually exists. (Worth doing: brand mentions
                    // on real platforms correlate far more strongly with AI
                    // search visibility than backlinks do.)
                    {
                      icon: Mail,
                      label: 'Email',
                      href: `mailto:${siteConfig.email}`
                    }
                  ].map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-400 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    >
                      <Icon className='h-4 w-4' />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className='flex flex-col items-center justify-between gap-3 border-t border-white/5 py-5 text-xs text-neutral-500 sm:flex-row'>
            <span>&copy; BudgetBliss</span>
            <span>
              Made with{' '}
              <Heart
                className='inline h-3.5 w-3.5 fill-red-500 text-red-500'
                aria-label='love'
              />{' '}
              by{' '}
              <span className='font-semibold text-neutral-300'>
                Tamal Biswas
              </span>
              .
            </span>
            <span className='flex items-center gap-1.5'>
              <span
                className='bg-clip-text font-semibold text-transparent'
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%, #138808 100%)'
                }}
              >
                Proudly Indian
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
