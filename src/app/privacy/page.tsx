import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  DATA_DISCLAIMER,
  DATA_WE_STORE,
  DATA_WE_NEVER_ASK
} from '@/constants/legal';

export const metadata: Metadata = {
  title: 'Privacy & Data | BudgetBliss',
  description:
    'How BudgetBliss handles the personal financial information you enter.'
};

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-[#0e0e0e] text-neutral-300'>
      <div className='mx-auto max-w-2xl px-6 py-16'>
        <Link
          href='/'
          className='mb-10 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-white'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to home
        </Link>

        <h1 className='mb-2 text-3xl font-extrabold text-white'>
          Privacy & Your Data
        </h1>
        <p className='mb-10 text-sm text-neutral-500'>
          Please read this before adding personal financial details.
        </p>

        <div className='rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-relaxed text-amber-100/90'>
          {DATA_DISCLAIMER}
        </div>

        <div className='mt-10 grid gap-8 sm:grid-cols-2'>
          <section>
            <h2 className='mb-3 text-sm font-semibold tracking-wide text-white uppercase'>
              What we store
            </h2>
            <ul className='flex flex-col gap-2 text-sm text-neutral-400'>
              {DATA_WE_STORE.map((item) => (
                <li key={item} className='flex gap-2'>
                  <span className='text-emerald-400'>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-sm font-semibold tracking-wide text-white uppercase'>
              What we never ask for
            </h2>
            <ul className='flex flex-col gap-2 text-sm text-neutral-400'>
              {DATA_WE_NEVER_ASK.map((item) => (
                <li key={item} className='flex gap-2'>
                  <span className='text-rose-400'>✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className='mt-12 text-xs leading-relaxed text-neutral-600'>
          BudgetBliss is an independent personal project and is not affiliated
          with any bank, card network, or payment provider. It is provided
          as-is, without warranty of any kind. By adding data you accept that
          you do so at your own risk. See our{' '}
          <Link href='/terms' className='text-neutral-400 hover:underline'>
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
