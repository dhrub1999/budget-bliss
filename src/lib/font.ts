import { Nunito, Karla } from 'next/font/google';

import { cn } from '@/lib/utils';

const fontNunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap'
});

const fontKarla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
  display: 'swap'
});

export const fontVariables = cn(fontNunito.variable, fontKarla.variable);
