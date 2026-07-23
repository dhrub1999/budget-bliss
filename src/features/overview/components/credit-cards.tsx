'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type CreditCard, formatINRFull } from './overview-data';
import type { AccountOption } from '@/features/accounts/types';
import { UTIL_AMBER, UTIL_ROSE } from '@/features/accounts/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

/** Maps a real credit-card account to the cosmetic card view. */
function toCardView(acc: AccountOption): CreditCard {
  return {
    id: acc.id,
    cardNumber: acc.last4 || '',
    cardHolder: acc.cardHolder || acc.name,
    validThru: acc.validThru || '••/••',
    brand: (acc.brand as CreditCard['brand']) || 'visa',
    gradient: acc.gradient || ''
  };
}

function utilBarColor(util: number): string {
  if (util >= UTIL_ROSE) return 'bg-rose-500';
  if (util >= UTIL_AMBER) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function ContactlessIcon() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#10b981'
      strokeWidth='2.5'
      strokeLinecap='round'
      className='opacity-80'
    >
      <path d='M5 8a4 4 0 0 1 0 8' />
      <path d='M8 5a8 8 0 0 1 0 14' />
      <path d='M11 2a12 12 0 0 1 0 20' />
      <circle cx='2' cy='12' r='1.5' fill='#10b981' stroke='none' />
    </svg>
  );
}

function CardChip() {
  return (
    <svg
      width='34'
      height='26'
      viewBox='0 0 38 28'
      fill='none'
      className='opacity-85'
    >
      <rect width='38' height='28' rx='5' fill='url(#chip-grad)' />
      <rect
        x='0.5'
        y='0.5'
        width='37'
        height='27'
        rx='4.5'
        stroke='rgba(255,255,255,0.2)'
      />
      <path
        d='M0 9.5H38M0 18.5H38M12.5 0V28M25.5 0V28'
        stroke='rgba(0,0,0,0.2)'
        strokeWidth='1.2'
      />
      <path
        d='M12.5 9.5C12.5 12 25.5 12 25.5 9.5'
        stroke='rgba(0,0,0,0.2)'
        strokeWidth='1.2'
      />
      <path
        d='M12.5 18.5C12.5 16 25.5 16 25.5 18.5'
        stroke='rgba(0,0,0,0.2)'
        strokeWidth='1.2'
      />
      <defs>
        <linearGradient
          id='chip-grad'
          x1='0'
          y1='0'
          x2='38'
          y2='28'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0%' stopColor='#e2e8f0' />
          <stop offset='40%' stopColor='#cbd5e1' />
          <stop offset='70%' stopColor='#94a3b8' />
          <stop offset='100%' stopColor='#cbd5e1' />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width='38' height='24' viewBox='0 0 38 24' fill='none'>
      <circle cx='12' cy='12' r='12' fill='#EB001B' fillOpacity='0.95' />
      <circle cx='26' cy='12' r='12' fill='#F79E1B' fillOpacity='0.95' />
      <path d='M19 4.8a12 12 0 0 1 0 14.4A12 12 0 0 1 19 4.8z' fill='#FF5F00' />
    </svg>
  );
}

function VisaLogo() {
  return (
    <span className='font-sans text-lg font-black tracking-wider text-white italic opacity-95 select-none'>
      VISA
    </span>
  );
}

function RuPayLogo() {
  return (
    <span className='font-sans text-base font-extrabold text-emerald-400 italic opacity-95 select-none'>
      RuPay
    </span>
  );
}

function AmexLogo() {
  return (
    <span className='rounded border border-sky-400/50 px-1.5 py-0.5 font-sans text-[11px] font-bold tracking-widest text-sky-400 uppercase opacity-95 select-none'>
      AMEX
    </span>
  );
}

function CardBrand({ brand }: { brand: CreditCard['brand'] }) {
  if (brand === 'mastercard') return <MastercardLogo />;
  if (brand === 'visa') return <VisaLogo />;
  if (brand === 'rupay') return <RuPayLogo />;
  if (brand === 'amex') return <AmexLogo />;
  return null;
}

interface CreditCardItemProps {
  card: CreditCard;
}

function CreditCardItem({ card }: CreditCardItemProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({
    x: 0,
    y: 0,
    shadowX: 50,
    shadowY: 50
  });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateX = -(y - yc) / 12; // max rotation degrees
    const rotateY = (x - xc) / 18; // max rotation degrees

    const shadowX = (x / rect.width) * 100;
    const shadowY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, shadowX, shadowY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, shadowX: 50, shadowY: 50 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const displayCardNumber = React.useMemo(() => {
    const raw = card.cardNumber || '••••';
    const fullNumber =
      raw.length === 4 ? `123456789101${raw}` : raw.replace(/\s/g, '');
    const chunks = fullNumber.match(/.{1,4}/g) || [];
    return chunks.join('  ');
  }, [card.cardNumber]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        transition: isHovered
          ? 'none'
          : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        background:
          'radial-gradient(circle at 50% 50%, #1c1d21 0%, #0c0d0f 100%)'
      }}
      className={cn(
        'relative h-[210px] w-full cursor-pointer overflow-hidden rounded-[24px] border border-purple-500/50 p-6 shadow-2xl shadow-[0_0_25px_rgba(139,92,246,0.1)] select-none'
      )}
    >
      {/* Texture noise layer */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Vivid Green Glow in top-left */}
      <div className='pointer-events-none absolute -top-[25%] -left-[15%] h-[80%] w-[70%] rounded-full bg-emerald-500 opacity-30 blur-[45px]' />

      {/* Glow highlight reflecting mouse movement */}
      {isHovered && (
        <div
          className='pointer-events-none absolute inset-0 transition-opacity duration-300'
          style={{
            background: `radial-gradient(circle at ${tilt.shadowX}% ${tilt.shadowY}%, rgba(255, 255, 255, 0.07) 0%, transparent 60%)`
          }}
        />
      )}

      {/* Card brand logo and Contactless icon */}
      <div className='relative z-10 flex items-center justify-between'>
        <div className='flex h-6 items-center'>
          <CardBrand brand={card.brand} />
        </div>
        <ContactlessIcon />
      </div>

      {/* Card Chip symbol */}
      <div className='absolute top-[86px] right-6 z-10'>
        <CardChip />
      </div>

      {/* Card Number display */}
      <div className='relative z-10 mt-8'>
        <p className='mb-0.5 text-[9px] font-semibold tracking-widest text-zinc-500/80 uppercase'>
          Card Number
        </p>
        <p
          className='font-mono text-xl font-bold tracking-[0.08em] text-white/90 antialiased md:text-2xl'
          style={{
            textShadow:
              '0 1.5px 2px rgba(0,0,0,0.85), 0 -0.5px 0.5px rgba(255,255,255,0.2)'
          }}
        >
          {displayCardNumber}
        </p>
      </div>

      {/* Card Footer details */}
      <div className='absolute right-6 bottom-6 left-6 z-10 flex items-end justify-between'>
        <div>
          <p className='mb-0.5 text-[8px] font-semibold tracking-widest text-zinc-500/80 uppercase'>
            Card Holder
          </p>
          <p className='text-[13px] font-semibold tracking-wide text-white/90 md:text-[14px]'>
            {card.cardHolder}
          </p>
        </div>
        <div className='pr-11 text-right'>
          <p className='mb-0.5 text-[8px] font-semibold tracking-widest text-zinc-500/80 uppercase'>
            Valid Thru
          </p>
          <p className='font-mono text-[13px] font-semibold tracking-wider text-white/95 md:text-[14px]'>
            {card.validThru}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CreditCards({ cards = [] }: { cards?: AccountOption[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Form states
  const [cardName, setCardName] = React.useState('');
  const [creditLimitInput, setCreditLimitInput] = React.useState('');
  const [outstandingInput, setOutstandingInput] = React.useState('');
  const [cardHolder, setCardHolder] = React.useState('');
  const [cardNumberInput, setCardNumberInput] = React.useState('');
  const [validThruInput, setValidThruInput] = React.useState('');
  const [brandInput, setBrandInput] =
    React.useState<CreditCard['brand']>('mastercard');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );

  const isEmpty = cards.length === 0;
  const total = cards.length;

  React.useEffect(() => {
    if (currentIndex > total - 1) setCurrentIndex(Math.max(0, total - 1));
  }, [total, currentIndex]);

  const activeCard = cards[currentIndex];

  // Handle autoplay rotations
  React.useEffect(() => {
    if (isPaused || dialogOpen || total <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, dialogOpen, total]);

  // Form handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumberInput(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setValidThruInput(value);
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!cardName.trim()) {
      errors.cardName = 'Card name is required';
    }

    const limit = Number(creditLimitInput);
    if (!creditLimitInput || isNaN(limit) || limit <= 0) {
      errors.creditLimit = 'Enter a valid credit limit';
    }

    const outstanding = outstandingInput ? Number(outstandingInput) : 0;
    if (outstandingInput && (isNaN(outstanding) || outstanding < 0)) {
      errors.outstanding = 'Enter a valid amount';
    }

    if (!cardHolder.trim()) {
      errors.cardHolder = 'Cardholder name is required';
    } else if (cardHolder.trim().length < 2) {
      errors.cardHolder = 'Name must be at least 2 characters';
    }

    const digitsOnlyNumber = cardNumberInput.replace(/\s/g, '');
    if (!digitsOnlyNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (digitsOnlyNumber.length !== 16) {
      errors.cardNumber = 'Card number must be exactly 16 digits';
    }

    if (!validThruInput) {
      errors.validThru = 'Expiry date is required';
    } else if (validThruInput.length !== 5 || !validThruInput.includes('/')) {
      errors.validThru = 'Use MM/YY format';
    } else {
      const [mm, yy] = validThruInput.split('/');
      const month = parseInt(mm, 10);
      const year = parseInt(yy, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.validThru = 'Invalid month (01-12)';
      }
      if (isNaN(year) || year < 24) {
        errors.validThru = 'Invalid year';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CREDIT_CARD',
          name: cardName.trim(),
          creditLimit: limit,
          currentOutstanding: outstanding,
          last4: digitsOnlyNumber.slice(-4),
          cardHolder: cardHolder.trim(),
          validThru: validThruInput,
          brand: brandInput
        })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data?.success) {
        toast.success('Credit card added successfully!');
        setCardName('');
        setCreditLimitInput('');
        setOutstandingInput('');
        setCardHolder('');
        setCardNumberInput('');
        setValidThruInput('');
        setBrandInput('mastercard');
        setFormErrors({});
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(data?.error || 'Failed to add credit card');
      }
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err?.message || 'Failed to add credit card');
    }
  };

  return (
    <>
      <Card className='bg-card'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col'>
              <CardTitle className='text-lg font-semibold text-white/95'>
                Credit Cards
              </CardTitle>
              <p className='text-[11px] text-zinc-500'>
                Manage and rotate your visual credit cards
              </p>
            </div>
            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='icon'
                className='h-7 w-7 rounded-lg border border-purple-500/25 bg-purple-500/10 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.15)] transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                onClick={() => setDialogOpen(true)}
                title='Add Card'
              >
                <Plus className='h-4 w-4' />
              </Button>
              {total > 1 && (
                <div className='flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-zinc-400 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400'
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  >
                    <ChevronLeft className='h-3.5 w-3.5' />
                  </Button>
                  <span className='min-w-[28px] px-1 text-center font-mono text-[10px] font-medium text-zinc-400'>
                    {currentIndex + 1}/{total}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-zinc-400 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400'
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
          </div>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          {isEmpty ? (
            <div className='flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 text-center'>
              <CreditCardIcon className='h-10 w-10 animate-pulse text-zinc-500' />
              <p className='text-sm font-medium text-zinc-400'>
                No credit cards added yet.
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                variant='outline'
                size='sm'
                className='mt-2 gap-1.5 rounded-xl border-purple-500/40 text-xs text-white hover:border-purple-500'
              >
                <Plus className='h-3.5 w-3.5' />
                Add First Card
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Card wrapper container with relative badge positioning */}
              <div className='relative overflow-visible px-0.5 py-1.5'>
                {total > 1 && (
                  <div
                    className='absolute -top-1.5 -right-1.5 z-20 rounded-full border border-green-400/10 bg-[#00c853] px-3 py-0.5 text-[10px] font-extrabold text-white shadow-lg shadow-green-950/25 transition-transform duration-300 select-none hover:scale-105'
                    style={{
                      textShadow: '0 0.5px 1px rgba(0,0,0,0.2)'
                    }}
                  >
                    +{total - 1} more
                  </div>
                )}

                {/* Sliding animation wrapper */}
                <div
                  className='overflow-hidden rounded-[24px]'
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <AnimatePresence initial={false} mode='wait'>
                    <motion.div
                      key={activeCard?.id || 'empty'}
                      initial={{ opacity: 0, x: 45, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -45, scale: 0.97 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className='w-full'
                    >
                      {activeCard && (
                        <CreditCardItem card={toCardView(activeCard)} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Real-data utilization strip for the active card */}
              {activeCard && (
                <div className='space-y-1.5 rounded-xl border border-zinc-800 bg-[#141416] px-3.5 py-3'>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-zinc-400'>
                      {formatINRFull(activeCard.owed ?? 0)} /{' '}
                      {formatINRFull(activeCard.creditLimit ?? 0)}
                    </span>
                    <span
                      className={cn(
                        'font-semibold',
                        (activeCard.utilization ?? 0) >= UTIL_ROSE
                          ? 'text-rose-400'
                          : (activeCard.utilization ?? 0) >= UTIL_AMBER
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      )}
                    >
                      {Math.round((activeCard.utilization ?? 0) * 100)}% used
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (activeCard.utilization ?? 0) * 100)}
                    className='h-1.5 bg-zinc-800'
                    indicatorClassName={utilBarColor(
                      activeCard.utilization ?? 0
                    )}
                  />
                  <p className='text-[11px] text-zinc-500'>
                    {formatINRFull(activeCard.available)} available
                  </p>
                </div>
              )}

              {/* Navigation controls */}
              {total > 1 && (
                <div className='flex justify-center gap-1.5 pt-2'>
                  {cards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        'h-1.5 cursor-pointer rounded-full transition-all duration-300',
                        i === currentIndex
                          ? 'w-5 bg-purple-500 shadow-[0_0_8px] shadow-purple-500/50'
                          : 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Modal dialog for card addition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-sm rounded-[24px] border border-zinc-800 bg-[#0d0d0f]/95 p-6 text-white backdrop-blur-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold text-white/95'>
              Add Credit Card
            </DialogTitle>
            <DialogDescription className='text-[11px] leading-normal text-zinc-500'>
              Add a credit card with its limit to track utilization and keep
              your balances in sync.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCardSubmit} className='space-y-4 pt-2'>
            {/* Card name */}
            <div className='space-y-1.5'>
              <Label
                htmlFor='card-name'
                className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'
              >
                Card Name
              </Label>
              <Input
                id='card-name'
                type='text'
                placeholder='e.g. HDFC Regalia'
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500'
              />
              {formErrors.cardName && (
                <p className='text-[10px] text-red-400'>
                  {formErrors.cardName}
                </p>
              )}
            </div>

            {/* Credit limit + outstanding */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='credit-limit'
                  className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'
                >
                  Credit Limit (₹)
                </Label>
                <Input
                  id='credit-limit'
                  type='number'
                  min='1'
                  placeholder='200000'
                  value={creditLimitInput}
                  onChange={(e) => setCreditLimitInput(e.target.value)}
                  className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500'
                />
                {formErrors.creditLimit && (
                  <p className='text-[10px] text-red-400'>
                    {formErrors.creditLimit}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='outstanding'
                  className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'
                >
                  Outstanding (₹)
                </Label>
                <Input
                  id='outstanding'
                  type='number'
                  min='0'
                  placeholder='0'
                  value={outstandingInput}
                  onChange={(e) => setOutstandingInput(e.target.value)}
                  className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500'
                />
                {formErrors.outstanding && (
                  <p className='text-[10px] text-red-400'>
                    {formErrors.outstanding}
                  </p>
                )}
              </div>
            </div>

            {/* Brand select */}
            <div className='space-y-1.5'>
              <Label className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'>
                Card Brand
              </Label>
              <Select
                value={brandInput}
                onValueChange={(val: CreditCard['brand']) => setBrandInput(val)}
              >
                <SelectTrigger className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500'>
                  <SelectValue placeholder='Select card brand' />
                </SelectTrigger>
                <SelectContent className='border-zinc-850 rounded-xl bg-zinc-950 text-white'>
                  <SelectItem
                    value='mastercard'
                    className='rounded-lg focus:bg-zinc-800'
                  >
                    Mastercard
                  </SelectItem>
                  <SelectItem
                    value='visa'
                    className='rounded-lg focus:bg-zinc-800'
                  >
                    Visa
                  </SelectItem>
                  <SelectItem
                    value='rupay'
                    className='rounded-lg focus:bg-zinc-800'
                  >
                    RuPay
                  </SelectItem>
                  <SelectItem
                    value='amex'
                    className='rounded-lg focus:bg-zinc-800'
                  >
                    American Express
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cardholder name */}
            <div className='space-y-1.5'>
              <Label
                htmlFor='cardholder-name'
                className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'
              >
                Cardholder Name
              </Label>
              <Input
                id='cardholder-name'
                type='text'
                placeholder='e.g. Tamal Biswas'
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500'
              />
              {formErrors.cardHolder && (
                <p className='text-[10px] text-red-400'>
                  {formErrors.cardHolder}
                </p>
              )}
            </div>

            {/* Card number */}
            <div className='space-y-1.5'>
              <Label
                htmlFor='card-number'
                className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'
              >
                Card Number
              </Label>
              <Input
                id='card-number'
                type='text'
                placeholder='0000 0000 0000 0000'
                value={cardNumberInput}
                onChange={handleCardNumberChange}
                className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500'
              />
              {formErrors.cardNumber && (
                <p className='text-[10px] text-red-400'>
                  {formErrors.cardNumber}
                </p>
              )}
            </div>

            {/* Expiry MM/YY */}
            <div className='space-y-1.5'>
              <Label
                htmlFor='expiry-date'
                className='text-[11px] font-semibold tracking-wider text-zinc-400 uppercase'
              >
                Expiration Date
              </Label>
              <Input
                id='expiry-date'
                type='text'
                placeholder='MM/YY'
                value={validThruInput}
                onChange={handleExpiryChange}
                className='rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500'
              />
              {formErrors.validThru && (
                <p className='text-[10px] text-red-400'>
                  {formErrors.validThru}
                </p>
              )}
            </div>

            {/* Footer action buttons */}
            <DialogFooter className='flex-row gap-2 pt-2 sm:justify-end'>
              <Button
                type='button'
                variant='ghost'
                className='rounded-xl text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
                onClick={() => {
                  setDialogOpen(false);
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={submitting}
                className='rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-500'
              >
                {submitting ? 'Adding...' : 'Add Card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
