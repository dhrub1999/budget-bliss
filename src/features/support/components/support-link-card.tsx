import { ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface SupportLinkCardProps {
  href: string;
  icon: LucideIcon;
  /** Tailwind text-colour class for the icon, e.g. 'text-rose-400'. */
  iconClassName?: string;
  title: string;
  description: string;
}

/**
 * A single outbound link, rendered as a card.
 *
 * The whole card is one <a> rather than a card containing a button: that gives
 * it a single accessible name and one tab stop, instead of a large decorative
 * area next to a small clickable one.
 */
export function SupportLinkCard({
  href,
  icon: Icon,
  iconClassName = 'text-zinc-400',
  title,
  description
}: SupportLinkCardProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='group rounded-xl focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e0e] focus-visible:outline-none'
    >
      {/* gap-0 because Card defaults to gap-6 and we aren't using CardHeader. */}
      <Card className='h-full gap-0 border-zinc-800 bg-[#141416] p-3 transition-colors group-hover:border-zinc-700 sm:p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <Icon className={`h-4 w-4 shrink-0 ${iconClassName}`} />
            <h3 className='text-sm font-semibold text-white'>{title}</h3>
          </div>
          <ArrowUpRight className='h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300' />
        </div>
        <p className='mt-1.5 text-xs leading-relaxed text-zinc-400'>
          {description}
        </p>
      </Card>
    </a>
  );
}
