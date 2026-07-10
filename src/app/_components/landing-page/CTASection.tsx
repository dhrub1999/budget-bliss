import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className='relative overflow-hidden border-t border-white/5 px-6 py-24 md:py-36'>
      {/* Ambient background glows */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0'
      >
        <div className='bg-brand-500/20 absolute top-1/2 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]' />
        <div className='bg-brand-300/10 absolute top-1/2 left-1/4 h-[300px] w-[300px] -translate-y-1/2 rounded-full blur-[80px]' />
        <div className='bg-brand-600/10 absolute top-1/2 right-1/4 h-[300px] w-[300px] -translate-y-1/2 rounded-full blur-[80px]' />
      </div>

      {/* Decorative grid lines */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:60px_60px]'
      />

      <div className='relative z-10 mx-auto max-w-4xl text-center'>
        {/* Badge */}
        <div className='border-brand-500/30 bg-brand-500/10 text-brand-400 mb-8 inline-flex animate-pulse items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase'>
          <Sparkles className='h-3.5 w-3.5' />
          <span>Free forever on the starter plan</span>
        </div>

        {/* Heading */}
        <h2 className='font-nunito mb-6 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl'>
          Ready to take control of{' '}
          <span className='from-brand-300 via-brand-400 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
            your finances?
          </span>
        </h2>

        {/* Sub-copy */}
        <p className='font-karla mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-xl'>
          Join thousands of people who&apos;ve already transformed the way they
          budget. Get started in seconds — no credit card required.
        </p>

        {/* CTA Buttons */}
        <div className='mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button
            asChild
            size='lg'
            id='cta-get-started-free'
            className='bg-brand-500 hover:bg-brand-600 shadow-brand-500/40 group flex items-center gap-2 rounded-2xl px-10 py-6 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(100,255,130,0.25)]'
          >
            <Link href='/auth/sign-up'>
              Get Started — It&apos;s Free
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </Link>
          </Button>

          <Button
            asChild
            variant='outline'
            size='lg'
            id='cta-view-pricing'
            className='rounded-2xl border-white/10 px-10 py-6 text-base text-neutral-300 transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:text-white'
          >
            <Link href='#pricing'>View Pricing</Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className='flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 md:gap-10'>
          <div className='flex items-center gap-1.5'>
            <ShieldCheck className='text-brand-500 h-4 w-4' />
            <span>Secured with Clerk Auth</span>
          </div>
          <div className='hidden h-3 w-px bg-white/10 sm:block' />
          <div className='flex items-center gap-1.5'>
            <Zap className='text-brand-500 h-4 w-4' />
            <span>Set up in under 2 minutes</span>
          </div>
          <div className='hidden h-3 w-px bg-white/10 sm:block' />
          <div className='flex items-center gap-1.5'>
            <Sparkles className='text-brand-500 h-4 w-4' />
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
