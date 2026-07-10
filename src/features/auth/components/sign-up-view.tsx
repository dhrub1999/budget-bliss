import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { IconStar } from '@tabler/icons-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Sign Up
      </Link>
      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <div className='relative hidden h-full flex-col overflow-hidden bg-[#0e0e0e] p-10 lg:flex xl:p-14'>
        {/* Ambient glows */}
        <div className='pointer-events-none absolute inset-0' aria-hidden>
          <div className='bg-brand-500/20 absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full blur-[130px]' />
          <div className='bg-brand-300/10 absolute -bottom-40 left-0 h-[380px] w-[380px] rounded-full blur-[110px]' />
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
            href='/auth/sign-up'
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
            {/* Goals card */}
            <div className='rounded-2xl border border-white/[0.07] bg-[#161616] p-5 shadow-2xl ring-1 ring-white/[0.04]'>
              <div className='mb-1 flex items-center justify-between'>
                <p className='text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase'>
                  Budget Goals
                </p>
                <Target className='text-brand-400 h-3.5 w-3.5' />
              </div>
              <p className='mb-5 text-[22px] leading-none font-extrabold text-white'>
                3 Active Goals
              </p>

              {/* Progress bars */}
              <div className='flex flex-col gap-4'>
                {[
                  {
                    label: 'Emergency Fund',
                    pct: 78,
                    target: '₹50,000',
                    color: '#22c55e'
                  },
                  {
                    label: 'Vacation — Goa',
                    pct: 52,
                    target: '₹25,000',
                    color: '#4ade80'
                  },
                  {
                    label: 'New Laptop',
                    pct: 34,
                    target: '₹80,000',
                    color: '#86efac'
                  }
                ].map((g) => (
                  <div key={g.label}>
                    <div className='mb-1.5 flex items-center justify-between'>
                      <span className='text-xs text-neutral-300'>
                        {g.label}
                      </span>
                      <span className='text-[10px] font-semibold text-neutral-500'>
                        {g.pct}%
                      </span>
                    </div>
                    <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]'>
                      <div
                        className='h-full rounded-full'
                        style={{ width: `${g.pct}%`, backgroundColor: g.color }}
                      />
                    </div>
                    <p className='mt-0.5 text-[9px] text-neutral-600'>
                      Target: {g.target}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total row */}
              <div className='bg-brand-500/[0.08] mt-5 flex items-center justify-between rounded-xl px-3 py-2.5'>
                <div className='flex items-center gap-1.5'>
                  <TrendingUp className='text-brand-400 h-3.5 w-3.5' />
                  <span className='text-xs text-neutral-400'>Total Saved</span>
                </div>
                <span className='text-sm font-extrabold text-white'>
                  ₹1,07,500
                </span>
              </div>
            </div>

            {/* Stat chips */}
            <div className='mt-3 grid grid-cols-2 gap-2.5'>
              <div className='flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#161616] px-3 py-2.5'>
                <div className='bg-brand-500/15 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg'>
                  <Wallet className='text-brand-400 h-3.5 w-3.5' />
                </div>
                <div>
                  <p className='text-[9px] text-neutral-600'>
                    Saved this month
                  </p>
                  <p className='text-[11px] font-bold text-white'>+₹8,200</p>
                </div>
              </div>
              <div className='flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#161616] px-3 py-2.5'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15'>
                  <CheckCircle2 className='h-3.5 w-3.5 text-emerald-400' />
                </div>
                <div>
                  <p className='text-[9px] text-neutral-600'>Bills</p>
                  <p className='text-[11px] font-bold text-emerald-400'>
                    All paid ✓
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: feature list + quote ── */}
        <div className='relative z-10 shrink-0'>
          <p className='mb-3 text-xs font-semibold text-white'>
            Everything you need to master your money
          </p>
          <div className='mb-6 flex flex-col gap-2.5'>
            {[
              [
                Sparkles,
                'Smart budget suggestions from your spending patterns'
              ],
              [Target, 'Set goals and track savings milestones in real time'],
              [ShieldCheck, 'Your data is private, encrypted and never sold']
            ].map(([Icon, text]) => (
              <div key={text as string} className='flex items-start gap-2.5'>
                <div className='bg-brand-500/15 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md'>
                  <Icon className='text-brand-400 h-3 w-3' />
                </div>
                <p className='text-[11px] leading-relaxed text-neutral-500'>
                  {text as string}
                </p>
              </div>
            ))}
          </div>
          <blockquote className='border-brand-500/40 border-l-2 pl-4'>
            <p className='text-sm leading-relaxed text-neutral-300'>
              &ldquo;I finally stopped living paycheck to paycheck. BudgetBliss
              changed everything.&rdquo;
            </p>
            <footer className='mt-2 flex items-center gap-2'>
              <div className='bg-brand-500/20 text-brand-400 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold'>
                R
              </div>
              <span className='text-xs text-neutral-600'>
                Rohan M., Bangalore
              </span>
            </footer>
          </blockquote>
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
          <ClerkSignUpForm
            initialValues={{
              emailAddress: 'your_mail+clerk_test@example.com'
            }}
            signInUrl='/auth/sign-in'
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
