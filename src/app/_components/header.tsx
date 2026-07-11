'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import { UserNav } from '@/components/layout/user-nav';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const isLoaded = !isPending;
  const isSignedIn = !!session?.user;
  const [activeSection, setActiveSection] = React.useState<string>('');
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  React.useEffect(() => {
    if (isDashboardRoute || isAuthRoute) return;

    const sections = ['features', 'testimonials', 'pricing'];

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -60% 0px',
      threshold: 0
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
      if (window.scrollY < 100) setActiveSection('');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDashboardRoute, isAuthRoute]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isDashboardRoute || isAuthRoute) return null;

  const navItems = [
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'Testimonials', href: '#testimonials', id: 'testimonials' },
    { label: 'Pricing', href: '#pricing', id: 'pricing' }
  ];

  return (
    <header className='sticky top-0 z-50 w-full border-b border-white/5 bg-[#1E1E1E]/90 backdrop-blur-md'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20'>
        {/* Logo */}
        <Link
          href='/'
          className='flex shrink-0 items-center transition-opacity hover:opacity-90'
        >
          <Image
            src='/logo/Logo.svg'
            alt='Budget Bliss'
            width={182}
            height={26}
            className='h-6 w-auto sm:h-7'
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className='hidden items-center gap-1 md:flex'>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200',
                activeSection === item.id
                  ? 'text-brand-400'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className='hidden items-center gap-2 md:flex'>
          {isLoaded ? (
            isSignedIn ? (
              <>
                <Button
                  asChild
                  variant='outline'
                  className='border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:text-brand-300 text-sm font-semibold transition-all duration-300'
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
                  className='text-sm text-neutral-300 hover:bg-white/5 hover:text-white'
                >
                  <Link href='/auth/sign-in'>Log In</Link>
                </Button>
                <Button
                  asChild
                  className='bg-brand-500 hover:bg-brand-600 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03]'
                >
                  <Link href='/auth/sign-up'>Get Started</Link>
                </Button>
              </>
            )
          ) : (
            <div className='h-9 w-24 animate-pulse rounded-lg bg-neutral-800' />
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          className='flex items-center justify-center rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white md:hidden'
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <X className='h-5 w-5' />
          ) : (
            <Menu className='h-5 w-5' />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className='border-t border-white/5 bg-[#1E1E1E] px-6 pb-6 md:hidden'>
          <nav className='flex flex-col gap-1 pt-4'>
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                  activeSection === item.id
                    ? 'text-brand-400'
                    : 'text-neutral-400 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth */}
          <div className='mt-4 flex flex-col gap-2 border-t border-white/5 pt-4'>
            {isLoaded ? (
              isSignedIn ? (
                <>
                  <Button
                    asChild
                    variant='outline'
                    className='border-brand-500/30 text-brand-400 w-full'
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
                    className='w-full text-neutral-300 hover:text-white'
                  >
                    <Link href='/auth/sign-in'>Log In</Link>
                  </Button>
                  <Button
                    asChild
                    className='bg-brand-500 hover:bg-brand-600 w-full font-semibold text-white'
                  >
                    <Link href='/auth/sign-up'>Get Started</Link>
                  </Button>
                </>
              )
            ) : (
              <div className='h-9 w-full animate-pulse rounded-lg bg-neutral-800' />
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };
