'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { UserNav } from '@/components/layout/user-nav';

const Header = () => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  if (isDashboardRoute || isAuthRoute) return null;

  return (
    <header className='sticky top-0 z-50 flex h-28 w-full items-center justify-between border-b border-white/5 bg-[#1E1E1E]/80 px-6 py-4 backdrop-blur-md'>
      <div>
        <Link
          href='/'
          className='animate-fade-in flex items-center gap-2 transition-opacity hover:opacity-95'
        >
          <Icons.budgetBliss className='h-8 w-auto md:h-9' />
          <span className='font-nunito to-brand-300 bg-gradient-to-r from-white via-neutral-100 bg-clip-text text-lg font-extrabold tracking-tight text-transparent md:text-xl'>
            Budget Bliss
          </span>
        </Link>
      </div>

      <div className='flex items-center gap-3'>
        {isLoaded ? (
          isSignedIn ? (
            <>
              <Button
                asChild
                variant='outline'
                className='border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:text-brand-300 text-xs font-semibold transition-all duration-300 md:text-sm'
              >
                <Link href='/dashboard'>Go to Dashboard</Link>
              </Button>
              <UserNav />
            </>
          ) : (
            <>
              <Button
                asChild
                variant='ghost'
                className='text-xs text-neutral-300 transition-all hover:bg-white/5 hover:text-white md:text-sm'
              >
                <Link href='/auth/sign-in'>Log In</Link>
              </Button>
              <Button
                asChild
                className='bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] md:text-sm'
              >
                <Link href='/auth/sign-up'>Get Started</Link>
              </Button>
            </>
          )
        ) : (
          <div className='h-9 w-24 animate-pulse rounded bg-neutral-800' />
        )}
      </div>

      {/* Floating Bottom Navigation Bar */}
      <div className='fixed bottom-6 left-1/2 z-50 w-[90%] max-w-[500px] -translate-x-1/2 rounded-full border border-white/10 bg-neutral-900/60 px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl'>
        <nav className='flex items-center justify-between'>
          <ul className='flex w-full items-center justify-around gap-4'>
            <li>
              <Link
                className='hover:text-brand-400 text-center text-xs font-semibold text-nowrap text-neutral-300 transition-colors'
                href='#features'
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                className='hover:text-brand-400 text-center text-xs font-semibold text-nowrap text-neutral-300 transition-colors'
                href='#pricing'
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                className='hover:text-brand-400 text-center text-xs font-semibold text-nowrap text-neutral-300 transition-colors'
                href='#about-us'
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                className='hover:text-brand-400 text-center text-xs font-semibold text-nowrap text-neutral-300 transition-colors'
                href='#testimonials'
              >
                Testimonials
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export { Header };
