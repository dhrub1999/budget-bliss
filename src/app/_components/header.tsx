'use client';
import * as React from 'react';

import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

const Header = () => {
  const pathname = usePathname();

  // Adjust this check as per your route structure
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isDashboardRoute) return null;

  return (
    <header>
      <div>
        <Icons.budgetBliss className='h-8 w-auto md:h-9 lg:h-10 xl:h-11 2xl:h-12' />
      </div>

      {/* <nav className='absolute top-0 left-0 flex h-full w-full items-center justify-center'>
        <ul className='flex flex-col gap-10'>
          <li>
            <Link href='#features'>Features</Link>
          </li>
          <li>
            <Link href='#pricing'>Pricing</Link>
          </li>
          <li>
            <Link href='#about-us'>About Us</Link>
          </li>
          <li>
            <Link href='#testimonials'>Testimonials</Link>
          </li>
        </ul>
      </nav> */}

      <Button variant='outline' className=''>
        Log In / Sign Up
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            size='icon'
            variant='ghost'
            className='fixed right-5 bottom-15 h-12 w-12'
          >
            <Icons.hamburgerMenu className='stroke-gray-200' />
          </Button>
        </SheetTrigger>
        <SheetContent className='w-56' data-slot='content'>
          <SheetHeader>
            <SheetTitle className='sr-only'>Hamburger Menu</SheetTitle>
          </SheetHeader>
          <nav className='absolute top-0 left-0 flex h-full w-full items-center justify-center'>
            <ul className='flex flex-col items-center gap-12'>
              <li>
                <Link className='text-center' href='#features'>
                  Features
                </Link>
              </li>
              <li>
                <Link className='text-center' href='#pricing'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link className='text-center' href='#about-us'>
                  About Us
                </Link>
              </li>
              <li>
                <Link className='text-center' href='#testimonials'>
                  Testimonials
                </Link>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export { Header };
