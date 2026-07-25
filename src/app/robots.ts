import type { MetadataRoute } from 'next';
import { siteUrl } from '@/config/site';

/**
 * Crawler policy.
 *
 * Two independent things are configured here, and conflating them is the usual
 * mistake:
 *
 *  1. Indexing. /dashboard and /api are private, per-user surfaces with nothing
 *     to rank and are disallowed for every crawler.
 *
 *  2. AI-search visibility. The retrieval crawlers behind ChatGPT, Claude and
 *     Perplexity are allowed on the public marketing pages — blocking them
 *     removes the site from AI answers entirely. CCBot is a training-corpus
 *     crawler with no citation benefit, so it is blocked.
 *
 * Note that robots.txt cannot stop user-triggered fetchers (ChatGPT-User,
 * Google-Agent, Google-NotebookLM) — they ignore it by design. Keeping the
 * dashboard behind authentication is what actually protects it.
 *
 * Appearing in AI Overviews / AI Mode is NOT controlled here; there is no
 * AI-specific opt-out file. That is governed by standard preview directives
 * (nosnippet, max-snippet, noindex) set in each route's metadata.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ['/dashboard/', '/api/', '/auth/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths
      },
      // AI retrieval crawlers — allowed so the product can be cited in answers.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot'],
        allow: '/',
        disallow: privatePaths
      },
      // Training-data corpus crawler: no citation upside, so opted out.
      {
        userAgent: 'CCBot',
        disallow: '/'
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
