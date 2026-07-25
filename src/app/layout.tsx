import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { cn } from '@/lib/utils';
import { siteConfig, siteKeywords, siteUrl } from '@/config/site';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';
import './theme.css';
import { Header } from './_components/header';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL below absolute. Without
  // it Next emits relative og:image paths, which most crawlers reject.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    // Child routes set only their own title; the brand suffix is appended here.
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteKeywords,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1096,
        height: 779,
        alt: 'The BudgetBliss dashboard showing account balances, spending categories and budget progress'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Uncapped snippet/image preview. These directives are also what governs
      // eligibility for AI Overviews and AI Mode — capping them here would
      // quietly suppress the product from AI answers.
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },
  category: 'finance',
  formatDetection: {
    telephone: false,
    address: false
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = 'light';
  // const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'font-nunito bg-[#1E1E1E] antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={activeThemeValue as string}>
              <Toaster />
              <Header />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
