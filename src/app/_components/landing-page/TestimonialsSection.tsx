'use client';

import Image from 'next/image';
import { testimonials, Testimonial } from '@/constants/data';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Card ────────────────────────────────────────────────────────────────────

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className='group flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-neutral-800/50 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-neutral-800/80 hover:shadow-xl hover:shadow-black/30'>
      {/* Author */}
      <div className='flex items-center gap-3'>
        <div className='relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-neutral-800'>
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            className='object-cover'
          />
        </div>
        <div>
          <p className='font-nunito text-sm font-bold text-white'>
            {testimonial.name}
          </p>
          <p className='text-xs text-neutral-400'>{testimonial.role}</p>
        </div>
        <Quote className='ml-auto h-4 w-4 shrink-0 text-neutral-600 transition-colors group-hover:text-neutral-500' />
      </div>

      {/* Quote */}
      <p className='text-sm leading-relaxed text-neutral-300'>
        {testimonial.quote}
      </p>
    </div>
  );
}

// ─── Carousel (mobile / tablet) ───────────────────────────────────────────────

const AUTOPLAY_DELAY = 5000; // ms between auto-advances
const RESUME_AFTER = 8000; // ms after interaction before resuming

function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPaused = useRef(false);
  const total = testimonials.length;

  const startAutoplay = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      if (!isPaused.current) {
        setCurrent((c) => (c + 1) % total);
      }
    }, AUTOPLAY_DELAY);
  }, [total]);

  const pauseAutoplay = useCallback((resumeAfter = RESUME_AFTER) => {
    isPaused.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isPaused.current = false;
    }, resumeAfter);
  }, []);

  // Boot the autoplay on mount, clean up on unmount
  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [startAutoplay]);

  const prev = useCallback(() => {
    pauseAutoplay();
    setCurrent((c) => (c - 1 + total) % total);
  }, [total, pauseAutoplay]);

  const next = useCallback(() => {
    pauseAutoplay();
    setCurrent((c) => (c + 1) % total);
  }, [total, pauseAutoplay]);

  // Touch handlers — swipe left/right, ignore vertical scrolls
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only lock as horizontal drag if clearly horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isDragging.current = true;
      e.preventDefault(); // prevent page scroll while swiping
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    pauseAutoplay(); // pause while the user is swiping
    if (!isDragging.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  return (
    <div
      className='relative'
      onMouseEnter={() => pauseAutoplay(RESUME_AFTER)}
      onMouseLeave={() => {
        isPaused.current = false;
      }}
    >
      {/* Slide track */}
      <div
        className='overflow-hidden'
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* The visible "window" — we translate by index */}
        <div
          className='flex transition-transform duration-500 ease-in-out'
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className='w-full shrink-0 px-1'
              aria-hidden={testimonials.indexOf(t) !== current}
            >
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div className='mt-6 flex items-center justify-center gap-4'>
        {/* Prev */}
        <button
          onClick={prev}
          aria-label='Previous testimonial'
          className='flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-neutral-400 transition-all hover:border-white/20 hover:bg-neutral-700 hover:text-white active:scale-95'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>

        {/* Dot indicators */}
        <div className='flex items-center gap-1.5'>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                pauseAutoplay();
                setCurrent(i);
              }}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-brand-400 w-5'
                  : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={next}
          aria-label='Next testimonial'
          className='flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-neutral-400 transition-all hover:border-white/20 hover:bg-neutral-700 hover:text-white active:scale-95'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>

      {/* Counter label */}
      <p className='mt-3 text-center text-xs text-neutral-500'>
        {current + 1} / {total}
      </p>
    </div>
  );
}

// ─── Desktop masonry grid ────────────────────────────────────────────────────

function TestimonialsGrid() {
  const col1 = testimonials.filter((_, i) => i % 3 === 0);
  const col2 = testimonials.filter((_, i) => i % 3 === 1);
  const col3 = testimonials.filter((_, i) => i % 3 === 2);

  return (
    <div className='grid grid-cols-3 gap-4'>
      <div className='flex flex-col gap-4'>
        {col1.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </div>
      <div className='mt-6 flex flex-col gap-4'>
        {col2.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </div>
      <div className='flex flex-col gap-4'>
        {col3.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  return (
    <section
      id='testimonials'
      className='scroll-mt-20 border-t border-white/5 py-20 md:py-32'
    >
      <div className='mx-auto max-w-7xl px-6'>
        {/* Header */}
        <div className='mb-16 flex flex-col items-center text-center'>
          <div className='border-brand-500/20 bg-brand-500/5 text-brand-400 mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide'>
            Testimonials
          </div>
          <h2 className='font-nunito max-w-2xl text-3xl font-extrabold text-white sm:text-4xl md:text-5xl'>
            What they{' '}
            <span className='from-brand-300 to-brand-500 bg-gradient-to-r bg-clip-text text-transparent'>
              Love
            </span>{' '}
            about BudgetBliss
          </h2>
        </div>

        {/* Carousel — mobile & tablet (hidden on lg+) */}
        <div className='lg:hidden'>
          <TestimonialsCarousel />
        </div>

        {/* Masonry grid — desktop only (hidden below lg) */}
        <div className='hidden lg:block'>
          <TestimonialsGrid />
        </div>
      </div>
    </section>
  );
}
