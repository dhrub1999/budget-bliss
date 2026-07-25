import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Your BudgetBliss dashboard — account balances, budgets, goals and recent transactions.',
  /**
   * Private per-user surface. robots.txt already disallows /dashboard, but a
   * disallowed URL can still be indexed if something links to it — robots.txt
   * blocks crawling, not indexing. This meta tag is what actually keeps it out
   * of the index, and it also covers the AI Overviews / AI Mode surfaces, which
   * have no separate opt-out.
   */
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
