/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` on script-src is a known weakness and is deliberate for now:
 * the app ships two developer-authored inline scripts (the theme bootstrap in
 * `app/layout.tsx` and the JSON-LD block in `app/page.tsx`) and the App Router
 * additionally streams its hydration payload as inline `self.__next_f.push(...)`
 * calls. Removing it means generating a per-request nonce in middleware and
 * threading it through both — worth doing, but it has to compose with the
 * existing `@neondatabase/auth` middleware, so it is tracked separately rather
 * than rushed here.
 *
 * Even with that caveat this is not decorative: it still blocks script loading
 * from any unlisted origin, blocks plugins/objects outright, pins `connect-src`
 * to same-origin so an injected script cannot exfiltrate to an attacker host,
 * and forbids framing entirely.
 *
 * `'unsafe-eval'` is development-only — Next's HMR requires it, production does
 * not get it.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Tailwind v4 and Radix both inject style attributes/elements at runtime.
  "style-src 'self' 'unsafe-inline'",
  // `api.slingacademy.com` mirrors next.config images.remotePatterns below and
  // goes away with the starter-template demo code.
  "img-src 'self' data: blob: https://api.slingacademy.com",
  "font-src 'self' data:",
  // Auth runs through this app's own /api/auth/* routes, so same-origin is enough.
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests'
].join('; ');

/** Applied to every route. */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Two years, and eligible for preload submission.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains'
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Redundant with frame-ancestors above, kept for older browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()'
  }
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
