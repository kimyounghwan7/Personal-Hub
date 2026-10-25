/** @type {import('next').NextConfig} */
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
let apiOrigin = '';
if (configuredApiUrl) {
  try {
    apiOrigin = new URL(configuredApiUrl).origin;
  } catch {
    apiOrigin = '';
  }
}

const connectSources = [
  "'self'",
  'http://localhost:*',
  'http://127.0.0.1:*',
  'https://*.supabase.co',
  ...(apiOrigin ? [apiOrigin] : []),
].join(' ');

const nextConfig = {
  output: 'standalone',
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src ${connectSources}`
          }
        ]
      }
    ];
  }
};

export default nextConfig;

