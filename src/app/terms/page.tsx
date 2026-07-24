import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | BudgetBliss',
  description: 'The terms under which BudgetBliss is provided.'
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className='mb-10 text-sm text-neutral-500'>Last updated: 2026</p>

        <div className='flex flex-col gap-4 text-sm leading-relaxed text-neutral-400'>
          <p>
            BudgetBliss is an independent personal project built for learning
            and personal budgeting. It is <strong>not</strong> a bank, a
            licensed financial service, or affiliated with any bank, card
            network, or payment provider.
          </p>
          <p>
            The service is provided <strong>&ldquo;as is&rdquo;</strong>,
            without warranty of any kind, express or implied. You use it at your
            own risk. To the fullest extent permitted by law, the author accepts
            no liability for any loss, damage, or data breach arising from your
            use of the app.
          </p>
          <p>
            You are responsible for the information you enter. Do not enter
            sensitive credentials such as full card numbers, CVV, PINs, OTPs, or
            netbanking passwords — the app never needs them. See our{' '}
            <Link href='/privacy' className='text-neutral-300 hover:underline'>
              Privacy & Data
            </Link>{' '}
            page for details on what is stored.
          </p>
          <p>
            These terms may change at any time. Continued use of the app after a
            change means you accept the updated terms.
          </p>
        </div>
      </div>
    </div>
  );
}
