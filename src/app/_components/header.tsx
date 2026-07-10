'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { UserNav } from '@/components/layout/user-nav';
import { cn } from '@/lib/utils';

import Image from 'next/image';

const Header = () => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const [activeSection, setActiveSection] = React.useState<string>('');

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  React.useEffect(() => {
    if (isDashboardRoute || isAuthRoute) return;

    const sections = ['features', 'pricing', 'about-us', 'testimonials'];

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('');
      } else if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        setActiveSection('testimonials');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check on mount
    handleScroll();

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDashboardRoute, isAuthRoute]);

  if (isDashboardRoute || isAuthRoute) return null;

  const navItems = [
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'Pricing', href: '#pricing', id: 'pricing' },
    { label: 'About Us', href: '#about-us', id: 'about-us' },
    { label: 'Testimonials', href: '#testimonials', id: 'testimonials' }
  ];

  return (
    <header className='sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/5 bg-[#1E1E1E]/80 px-4 py-4 backdrop-blur-md md:h-28 md:px-6'>
      <div>
        <Link
          href='/'
          className='animate-fade-in flex items-center transition-opacity hover:opacity-95'
        >
          <Image
            src='/logo/Logo.svg'
            alt='Budget Bliss'
            width={182}
            height={26}
            className='xs:h-7 h-6 w-auto sm:h-8 md:h-9'
            priority
          />
        </Link>
      </div>

      <div className='flex items-center gap-1.5 sm:gap-3'>
        {isLoaded ? (
          isSignedIn ? (
            <>
              <Button
                asChild
                variant='outline'
                className='border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:text-brand-300 px-2.5 py-1 text-xs font-semibold transition-all duration-300 sm:px-4 sm:py-2 md:text-sm'
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
                className='px-2 py-1 text-xs text-neutral-300 transition-all hover:bg-white/5 hover:text-white sm:px-3 sm:py-1.5 md:text-sm'
              >
                <Link href='/auth/sign-in'>Log In</Link>
              </Button>
              <Button
                asChild
                className='bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 px-2.5 py-1 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] sm:px-4 sm:py-2 md:text-sm'
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
      <div className='fixed bottom-6 left-1/2 z-50 w-[90%] max-w-[500px] -translate-x-1/2 rounded-full border border-white/10 bg-neutral-900/60 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl'>
        <nav>
          <ul className='flex w-full items-center justify-around gap-0.5 sm:gap-1'>
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className='flex-1 text-center'>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-full px-2 py-1.5 text-center text-[10px] font-semibold text-nowrap transition-all duration-300 sm:px-3 sm:py-2 sm:text-xs',
                      isActive
                        ? 'bg-brand-500/15 text-brand-400'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export { Header };
