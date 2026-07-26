import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX
} from '@tabler/icons-react';
import { Bug, GitPullRequest, Lightbulb, ListChecks, Mail } from 'lucide-react';
import Link from 'next/link';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CONTRIBUTING_DECLINED,
  CONTRIBUTING_RULES,
  SUPPORT_LINKS,
  maintainer
} from '@/constants/support';

import { SupportLinkCard } from './support-link-card';

/**
 * Server component on purpose.
 *
 * The 'use client' on bills-view / accounts-view is a consequence of their
 * dialog state and router.refresh() calls, not a house style. This page is
 * anchors and static copy, so shipping it to the browser would buy nothing.
 * PageContainer wraps a ScrollArea, which is a client component — passing
 * server-rendered children through it is the supported pattern, and the same
 * thing dashboard/overview/layout.tsx already does.
 *
 * If a copy-to-clipboard button is ever wanted here, extract that one leaf into
 * its own 'use client' file rather than promoting this whole subtree.
 */
export function SupportView() {
  const socials = [
    {
      href: maintainer.github,
      label: `@${maintainer.handle}`,
      icon: IconBrandGithub
    },
    {
      href: `mailto:${maintainer.email}`,
      label: 'Email',
      icon: Mail
    },
    // Rendered only once the URLs are filled in — see constants/support.ts.
    maintainer.linkedin && {
      href: maintainer.linkedin,
      label: 'LinkedIn',
      icon: IconBrandLinkedin
    },
    maintainer.x && {
      href: maintainer.x,
      label: 'X',
      icon: IconBrandX
    }
  ].filter((link) => Boolean(link)) as {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col gap-4 pb-8 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl'>
              Support
            </h1>
            <p className='mt-0.5 text-xs text-zinc-400 sm:mt-1 sm:text-sm'>
              Found a bug, want a feature, or fancy sending a pull request?
              Everything happens in the open, on GitHub.
            </p>
          </div>

          <Button
            asChild
            className='h-9 w-full gap-1.5 bg-[#4ade80] text-xs font-semibold text-black hover:bg-[#22c55e] sm:h-10 sm:w-auto sm:text-sm'
          >
            <a
              href={SUPPORT_LINKS.bugReport}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Bug className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              Report a bug
            </a>
          </Button>
        </div>

        {/* Where to go */}
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4'>
          <SupportLinkCard
            href={SUPPORT_LINKS.bugReport}
            icon={Bug}
            iconClassName='text-rose-400'
            title='Report a bug'
            description='Something behaved differently from what you expected? The form asks which page you were on, which account type was involved and what you expected instead — that is usually enough to reproduce it.'
          />
          <SupportLinkCard
            href={SUPPORT_LINKS.featureRequest}
            icon={Lightbulb}
            iconClassName='text-amber-400'
            title='Request a feature'
            description='Tell me what is missing. The form asks for the problem first and your proposed solution second, which tends to surface a better answer than either of us started with.'
          />
          <SupportLinkCard
            href={SUPPORT_LINKS.openIssues}
            icon={ListChecks}
            iconClassName='text-sky-400'
            title='Browse open issues'
            description='Someone may have hit it already. A thumbs-up on an existing issue helps prioritise it far more than a second copy of the same report.'
          />
          <SupportLinkCard
            href={SUPPORT_LINKS.goodFirstIssues}
            icon={GitPullRequest}
            iconClassName='text-[#4ade80]'
            title='Good first issues'
            description='Small, self-contained tickets that make a reasonable first pull request. No prior context with the codebase assumed.'
          />
        </div>

        {/* Maintainer */}
        <section className='flex flex-col gap-2.5 sm:gap-3'>
          <h2 className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
            Connect with the maintainer
          </h2>

          <Card className='gap-0 border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
              <span className='text-sm font-semibold text-white'>
                {maintainer.name}
              </span>
              <span className='text-xs text-zinc-500'>
                @{maintainer.handle}
              </span>
            </div>
            <p className='mt-1.5 text-xs leading-relaxed text-zinc-400'>
              BudgetBliss is a one-person side project. There is no support desk
              and no response-time promise — a GitHub issue will usually get a
              faster answer than an email, because it is visible to everyone
              else who hits the same thing.
            </p>

            <div className='mt-3 flex flex-wrap gap-2'>
              {socials.map(({ href, label, icon: Icon }) => (
                <Button
                  key={label}
                  asChild
                  variant='outline'
                  size='sm'
                  className='gap-1.5 border-zinc-800 bg-[#18181b] text-xs text-white hover:bg-zinc-800'
                >
                  <a
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={
                      href.startsWith('mailto:')
                        ? undefined
                        : 'noopener noreferrer'
                    }
                  >
                    <Icon className='h-3.5 w-3.5' />
                    {label}
                  </a>
                </Button>
              ))}
            </div>
          </Card>
        </section>

        {/* Contributing */}
        <section className='flex flex-col gap-2.5 sm:gap-3'>
          <h2 className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
            Contribute to BudgetBliss
          </h2>

          <Card className='gap-0 border-zinc-800 bg-[#141416] p-3 sm:p-4'>
            <p className='text-xs leading-relaxed text-zinc-400'>
              Pull requests are welcome — a bug fix, a feature off the issue
              list, or the typo you are about to notice. A few conventions worth
              knowing before you start:
            </p>

            <ol className='mt-3 grid gap-3 sm:gap-4 lg:grid-cols-2'>
              {CONTRIBUTING_RULES.map((rule, index) => (
                <li key={rule.title} className='flex gap-2.5'>
                  <span className='mt-px font-mono text-[11px] text-zinc-600 tabular-nums'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className='text-xs font-semibold text-white'>
                      {rule.title}
                    </h3>
                    <p className='mt-0.5 text-xs leading-relaxed text-zinc-400'>
                      {rule.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Same treatment as the disclaimer on /privacy. */}
            <div className='mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-100/90'>
              {CONTRIBUTING_DECLINED}
            </div>

            <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='gap-1.5 border-zinc-800 bg-[#18181b] text-xs text-white hover:bg-zinc-800'
              >
                <a
                  href={SUPPORT_LINKS.contributing}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Read the full guide
                </a>
              </Button>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='gap-1.5 border-zinc-800 bg-[#18181b] text-xs text-white hover:bg-zinc-800'
              >
                <a
                  href={SUPPORT_LINKS.repo}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <IconBrandGithub className='h-3.5 w-3.5' />
                  View the repo
                </a>
              </Button>
            </div>
          </Card>
        </section>

        <p className='text-xs leading-relaxed text-zinc-500'>
          One request: issues are public. Please don&apos;t paste real card
          numbers, CVV, PINs or bank credentials into one — a bug is almost
          always reproducible with made-up figures. See{' '}
          <Link
            href='/privacy'
            className='underline underline-offset-2 hover:text-zinc-300'
          >
            Privacy &amp; Data
          </Link>
          .
        </p>
      </div>
    </PageContainer>
  );
}
