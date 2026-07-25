import type { MetadataRoute } from 'next';
import { siteUrl, siteConfig } from '@/config/site';

/**
 * Only publicly indexable routes belong here. /dashboard and /auth are
 * disallowed in robots.ts, and listing a disallowed URL in a sitemap is a
 * self-contradicting signal that shows up as a Search Console warning.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.dateModified);

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3
    }
  ];
}
