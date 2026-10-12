import {withSentryConfig} from '@sentry/nextjs';
/**
 * @type {import('next').NextConfig}
 */

const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com;
  connect-src 'self' 'unsafe-inline' https://api.stripe.com https://maps.googleapis.com;
  frame-src 'self' 'unsafe-inline' https://js.stripe.com https://hooks.stripe.com;
  base-uri 'self'`;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options

org: process.env.SENTRY_ORG,
project: process.env.SENTRY_PROJECT,

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Hides source maps from generated client bundles
hideSourceMaps: true,

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});

// workerd.exe crashes on this Windows host (write EOF). Do not import
// @cloudflare/next-on-pages/next-dev here — the import itself can spawn it.
if (process.env.NODE_ENV === 'development' && process.platform !== 'win32') {
  const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
  await setupDevPlatform();
}