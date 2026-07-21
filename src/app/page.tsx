import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Mail,
  Globe,
  Facebook,
  Linkedin,
  Instagram,
  Heart
} from 'lucide-react';
import Image from 'next/image';
import FeatureCard from './_components/landing-page/FeatureCard';
import { featureCards } from '@/constants/data';
import PricingSection from './_components/landing-page/PricingSection';
import HowItWorks from './_components/landing-page/HowItWorks';
import TestimonialsSection from './_components/landing-page/TestimonialsSection';
import CTASection from './_components/landing-page/CTASection';
import ScrollReveal, {
  StaggerContainer,
  StaggerItem
} from './_components/landing-page/ScrollReveal';

export default async function Page() {
  return (
    <div
      className='min-h-screen overflow-x-hidden overflow-y-auto bg-[#1e1e1e] text-white'
      style={{ scrollBehavior: 'smooth' }}
    >
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
              <span>Budgeting made blissful and automated</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <h1 className='font-nunito mb-6 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl'>
              Your Finances, Organised <span className=''>& Optimised.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className='font-karla mb-10 max-w-2xl text-2xl leading-relaxed text-neutral-400 md:text-xl'>
              Gain complete visibility into your spending habits and make
              informed financial decisions.
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

          <ScrollReveal delay={0.35} direction='none'>
            <div className='mx-auto mt-6 w-full max-w-6xl'>
              <Image
                src={'/images/hero-image.png'}
                height={2160}
                width={1440}
                alt='Product dashboard image'
                className='w-full'
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trusted By Banner */}
      <section className='border-y border-white/5 bg-neutral-900/40 py-12 text-center'>
        <div className='mx-auto max-w-7xl px-6'>
          <ScrollReveal>
            <p className='mb-6 text-xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Loved by thousands of conscious spenders
            </p>
          </ScrollReveal>
          <StaggerContainer className='flex flex-wrap items-center justify-center gap-8 opacity-40 md:gap-16'>
            {[
              'PRODUCT HUNT',
              'FINTECH WEEKLY',
              'VENTUREBEAT',
              'SAAS CENTRAL'
            ].map((name) => (
              <StaggerItem key={name} direction='up'>
                <span className='font-nunito text-xl font-extrabold tracking-tight'>
                  {name}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className='mx-auto max-w-7xl scroll-mt-20 px-6 py-20 md:py-32'
      >
        <ScrollReveal>
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
        </ScrollReveal>

        <StaggerContainer className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {featureCards.map((feature, index) => (
            <StaggerItem key={index}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
                imageUrl={feature.imageUrl}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section — interactive client component */}
      <PricingSection />

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
              <p className='max-w-xs text-sm leading-relaxed text-neutral-400'>
                BudgetBliss helps individuals take control of their personal
                finances with smart budgeting tools, insightful reports, and
                timely reminders—all in a clean, intuitive, and user-friendly
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
                    { label: 'Home', href: '#' },
                    { label: 'Pricing', href: '#pricing' },
                    { label: 'Testimonials', href: '#testimonials' }
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
                  Services
                </h3>
                <ul className='flex flex-col gap-3 text-sm text-neutral-400'>
                  {[
                    { label: 'Expense Management', href: '#features' },
                    { label: 'Reminders', href: '#features' },
                    { label: 'Goals', href: '#features' },
                    { label: 'Budgeting', href: '#features' }
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
                    { label: 'Blog', href: '#' },
                    { label: 'Help Center', href: '#' },
                    { label: 'FAQs', href: '#about-us' },
                    { label: 'Contact Us', href: '#' }
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
                    {
                      icon: Mail,
                      label: 'Email',
                      href: 'mailto:hello@budgetbliss.app'
                    },
                    { icon: Globe, label: 'Website', href: '#' },
                    { icon: Facebook, label: 'Facebook', href: '#' },
                    { icon: Linkedin, label: 'LinkedIn', href: '#' },
                    { icon: Instagram, label: 'Instagram', href: '#' }
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
