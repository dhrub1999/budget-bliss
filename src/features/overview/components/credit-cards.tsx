'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { creditCards, type CreditCard } from './overview-data';

function MastercardLogo() {
  return (
    <svg width='38' height='24' viewBox='0 0 38 24' fill='none'>
      <circle cx='14' cy='12' r='12' fill='#EB001B' />
      <circle cx='24' cy='12' r='12' fill='#F79E1B' />
      <path d='M19 4.8a12 12 0 0 1 0 14.4A12 12 0 0 1 19 4.8z' fill='#FF5F00' />
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg width='54' height='18' viewBox='0 0 54 18' fill='none'>
      <text
        x='0'
        y='14'
        fontFamily='Arial'
        fontWeight='bold'
        fontSize='18'
        fill='#1A1F71'
        letterSpacing='-1'
      >
        VISA
      </text>
    </svg>
  );
}

function RuPayLogo() {
  return (
    <svg width='54' height='18' viewBox='0 0 54 18' fill='none'>
      <text
        x='0'
        y='14'
        fontFamily='Arial'
        fontWeight='bold'
        fontSize='14'
        fill='#4ade80'
      >
        RuPay
      </text>
    </svg>
  );
}

function CardBrand({ brand }: { brand: CreditCard['brand'] }) {
  if (brand === 'mastercard') return <MastercardLogo />;
  if (brand === 'visa') return <VisaLogo />;
  if (brand === 'rupay') return <RuPayLogo />;
  return null;
}

function CreditCardItem({ card }: { card: CreditCard }) {
  return (
    <div
      className={cn(
        'relative h-[160px] w-full rounded-2xl bg-gradient-to-br p-5 shadow-lg',
        card.gradient
      )}
    >
      {/* Card brand logo */}
      <div className='absolute top-4 right-5'>
        <CardBrand brand={card.brand} />
      </div>

      {/* Chip */}
      <div className='mt-6'>
        <div className='h-7 w-10 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-500/60 shadow-inner' />
      </div>

      {/* Card number */}
      <div className='mt-3'>
        <p className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
          Card Number
        </p>
        <p className='font-mono text-lg font-bold tracking-widest text-white'>
          1234 5678 9101 {card.cardNumber}
        </p>
      </div>

      {/* Footer */}
      <div className='mt-2 flex items-end justify-between'>
        <div>
          <p className='text-muted-foreground text-[9px] tracking-wider uppercase'>
            Card Holder
          </p>
          <p className='text-sm font-semibold text-white'>{card.cardHolder}</p>
        </div>
        <div className='text-right'>
          <p className='text-muted-foreground text-[9px] tracking-wider uppercase'>
            Valid Thru
          </p>
          <p className='font-mono text-sm font-semibold text-white'>
            {card.validThru}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CreditCards() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const isEmpty = creditCards.length === 0;
  const total = creditCards.length;

  return (
    <Card className='bg-card'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Credit Cards</CardTitle>
          {total > 1 && (
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className='h-3.5 w-3.5' />
              </Button>
              <span className='text-muted-foreground text-xs'>
                {currentIndex + 1}/{total}
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                disabled={currentIndex === total - 1}
                onClick={() =>
                  setCurrentIndex((i) => Math.min(total - 1, i + 1))
                }
              >
                <ChevronRight className='h-3.5 w-3.5' />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        {isEmpty ? (
          <div className='flex h-[160px] flex-col items-center justify-center gap-2 text-center'>
            <div className='text-3xl'>💳</div>
            <p className='text-muted-foreground text-sm'>
              No credit cards added.
            </p>
            <Button variant='outline' size='sm' className='mt-1 gap-1 text-xs'>
              <Plus className='h-3 w-3' />
              Add Card
            </Button>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='overflow-hidden'>
              <div
                className='flex transition-transform duration-300 ease-in-out'
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {creditCards.map((card) => (
                  <div key={card.id} className='w-full shrink-0'>
                    <CreditCardItem card={card} />
                  </div>
                ))}
              </div>
            </div>
            {/* Dot indicators */}
            {total > 1 && (
              <div className='flex justify-center gap-1.5'>
                {creditCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-200',
                      i === currentIndex
                        ? 'bg-primary w-4'
                        : 'bg-muted-foreground/40 w-1.5'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
