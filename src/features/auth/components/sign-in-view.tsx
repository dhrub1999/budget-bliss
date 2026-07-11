'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth/client';
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

export default function SignInViewPage({ stars }: { stars: number }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg('');
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setErrorMsg(error.message || 'Failed to sign in. Try again');
      setIsPending(false);
    } else {
      router.push('/dashboard/overview');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/dashboard/overview'
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

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
          {/* <Link
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
          </Link> */}
          <div className='flex w-full max-w-sm flex-col gap-4'>
            <h1 className='text-center text-2xl font-bold text-white'>
              Sign In
            </h1>
            <form onSubmit={handleSignIn} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-gray-300'>Email</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='focus:ring-brand-500 rounded-md bg-white/5 px-3 py-2 text-white ring-1 ring-white/10 outline-none'
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-gray-300'>Password</label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className='focus:ring-brand-500 rounded-md bg-white/5 px-3 py-2 text-white ring-1 ring-white/10 outline-none'
                />
              </div>
              {errorMsg && <p className='text-sm text-red-500'>{errorMsg}</p>}
              <button
                type='submit'
                disabled={isPending}
                className='bg-brand-500 hover:bg-brand-600 mt-2 rounded-md py-2 font-semibold text-white transition disabled:opacity-50'
              >
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className='relative my-4 flex items-center justify-center'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-white/10'></div>
              </div>
              <div className='relative bg-[#0e0e0e] px-2 text-sm text-gray-500'>
                Or continue with
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type='button'
              className='flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 py-2 text-white transition hover:bg-white/10'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              Sign in with Google
            </button>
            <p className='mt-2 text-center text-sm text-gray-400'>
              Don&apos;t have an account?{' '}
              <Link
                href='/auth/sign-up'
                className='text-brand-400 hover:underline'
              >
                Sign up
              </Link>
            </p>
          </div>

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
