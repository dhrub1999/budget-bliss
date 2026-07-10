import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { IconStar } from '@tabler/icons-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart3,
  PiggyBank,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Login
      </Link>
      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <div className='relative hidden h-full flex-col overflow-hidden bg-[#0e0e0e] p-10 lg:flex xl:p-14'>
        {/* Ambient glows */}
        <div className='pointer-events-none absolute inset-0' aria-hidden>
          <div className='bg-brand-500/25 absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[130px]' />
          <div className='bg-brand-300/10 absolute right-0 -bottom-32 h-[380px] w-[380px] rounded-full blur-[110px]' />
        </div>

        {/* Dot grid */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-[0.045]'
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />

        {/* Logo */}
        <div className='relative z-10 shrink-0'>
          <Link
            href='/'
            className='inline-flex transition-opacity hover:opacity-85'
          >
            <Image
              src='/logo/Logo.svg'
              alt='Budget Bliss'
              width={160}
              height={24}
              className='h-7 w-auto'
              priority
            />
          </Link>
        </div>

        {/* ── Central graphic ── */}
        <div className='relative z-10 flex flex-1 flex-col items-center justify-center py-10'>
          <div className='w-full max-w-[300px]'>
            {/* Dashboard card */}
            <div className='rounded-2xl border border-white/[0.07] bg-[#161616] p-5 shadow-2xl ring-1 ring-white/[0.04]'>
              {/* Card header */}
              <div className='mb-1 flex items-center justify-between'>
                <p className='text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase'>
                  Monthly Overview
                </p>
                <BarChart3 className='text-brand-400 h-3.5 w-3.5' />
              </div>
              <p className='mb-5 text-[26px] leading-none font-extrabold text-white'>
                ₹1,24,580
              </p>

              {/* Mini bar chart */}
              <div className='mb-5 flex h-20 items-end gap-[3px]'>
                {[32, 50, 38, 65, 47, 78, 57, 72, 52, 86, 64, 100].map(
                  (h, i) => (
                    <div
                      key={i}
                      className='flex-1 rounded-sm'
                      style={{
                        height: `${h}%`,
                        background:
                          i === 11
                            ? 'linear-gradient(to top, #16a34a, #4ade80)'
                            : `rgba(34,197,94,${0.1 + i * 0.02})`
                      }}
                    />
                  )
                )}
              </div>

              {/* Stats row */}
              <div className='grid grid-cols-2 gap-2'>
                <div className='rounded-lg bg-white/[0.04] px-3 py-2.5'>
                  <p className='text-[9px] tracking-wide text-neutral-600 uppercase'>
                    Income
                  </p>
                  <p className='text-sm font-bold text-white'>₹85,000</p>
                  <p className='mt-0.5 text-[9px] font-semibold text-emerald-400'>
                    ↑ 12.4%
                  </p>
                </div>
                <div className='rounded-lg bg-white/[0.04] px-3 py-2.5'>
                  <p className='text-[9px] tracking-wide text-neutral-600 uppercase'>
                    Expenses
                  </p>
                  <p className='text-sm font-bold text-white'>₹39,580</p>
                  <p className='mt-0.5 text-[9px] font-semibold text-red-400'>
                    ↓ 3.1%
                  </p>
                </div>
              </div>
            </div>

            {/* Stat chips */}
            <div className='mt-3 grid grid-cols-2 gap-2.5'>
              <div className='flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#161616] px-3 py-2.5'>
                <div className='bg-brand-500/15 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg'>
                  <PiggyBank className='text-brand-400 h-3.5 w-3.5' />
                </div>
                <div>
                  <p className='text-[9px] text-neutral-600'>Auto-saved</p>
                  <p className='text-[11px] font-bold text-white'>₹12,000</p>
                </div>
              </div>
              <div className='flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#161616] px-3 py-2.5'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15'>
                  <TrendingUp className='h-3.5 w-3.5 text-emerald-400' />
                </div>
                <div>
                  <p className='text-[9px] text-neutral-600'>Goal</p>
                  <p className='text-[11px] font-bold text-white'>68% done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: quote + trust signals ── */}
        <div className='relative z-10 shrink-0'>
          <blockquote className='border-brand-500/40 mb-6 border-l-2 pl-4'>
            <p className='text-sm leading-relaxed text-neutral-300'>
              &ldquo;BudgetBliss helped me save ₹40k in the first 3 months. I
              finally feel in control.&rdquo;
            </p>
            <footer className='mt-2 flex items-center gap-2'>
              <div className='bg-brand-500/20 text-brand-400 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold'>
                P
              </div>
              <span className='text-xs text-neutral-600'>Priya S., Mumbai</span>
            </footer>
          </blockquote>
          <div className='flex flex-wrap gap-5 text-[11px] text-neutral-600'>
            {[
              [ShieldCheck, 'Bank-grade security'],
              [Zap, 'Real-time insights'],
              [Target, 'Goal tracking']
            ].map(([Icon, label]) => (
              <div key={label as string} className='flex items-center gap-1.5'>
                <Icon className='text-brand-500 h-3.5 w-3.5' />
                <span>{label as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          {/* github link  */}
          <Link
            className={cn('group inline-flex hover:text-yellow-200')}
            target='_blank'
            href={'https://github.com/kiranism/next-shadcn-dashboard-starter'}
          >
            <div className='flex items-center'>
              <GitHubLogoIcon className='size-4' />
              <span className='ml-1 inline'>Star on GitHub</span>{' '}
            </div>
            <div className='ml-2 flex items-center gap-1 text-sm md:flex'>
              <IconStar
                className='size-4 text-gray-500 transition-all duration-300 group-hover:text-yellow-300'
                fill='currentColor'
              />
              <span className='font-display font-medium'>{stars}</span>
            </div>
          </Link>
          <ClerkSignInForm
            initialValues={{
              emailAddress: 'your_mail+clerk_test@example.com'
            }}
            signUpUrl='/auth/sign-up'
          />

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
