'use client';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';

// Import your nav groups
import {
  overviewNavItems,
  managementNavItems,
  settingsNavItems,
  supportNavItems
} from '@/constants/data';

type NavItem = {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
};

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const navGroups = useMemo(
    () => [
      { section: 'Overview', items: overviewNavItems },
      { section: 'Management', items: managementNavItems },
      { section: 'Settings', items: settingsNavItems },
      { section: 'Support', items: supportNavItems }
    ],
    []
  );

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    // Flatten all nav groups into KBar actions
    return navGroups.flatMap(({ section, items }) =>
      items.flatMap((navItem) => {
        // Only include base action if URL is valid
        const baseAction =
          navItem.url !== '#'
            ? {
                id: `${navItem.title.toLowerCase()}Action`,
                name: navItem.title,
                shortcut: navItem.shortcut,
                keywords: navItem.title.toLowerCase(),
                section,
                subtitle: `Go to ${navItem.title}`,
                perform: () => navigateTo(navItem.url)
              }
            : null;

        // If navItem has children (items), map those as well
        const childActions =
          navItem.items?.map((childItem) => ({
            id: `${childItem.title.toLowerCase()}Action`,
            name: childItem.title,
            shortcut: childItem.shortcut,
            keywords: childItem.title.toLowerCase(),
            section: navItem.title,
            subtitle: `Go to ${childItem.title}`,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

        return baseAction ? [baseAction, ...childActions] : childActions;
      })
    );
  }, [navGroups, router]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
