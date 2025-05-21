'use client';
import * as React from 'react';

import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

      <nav>
        <ul>
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
      </nav>

      <Button variant='outline'>Log In / Sign Up</Button>
    </header>
  );
};

export { Header };
