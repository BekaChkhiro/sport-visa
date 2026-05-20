import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
};

// Sentry's Next.js plugin uploads source maps and wires the SDK at build time.
// The wrap is a no-op for runtime behavior when SENTRY_DSN is unset; we only
// gate source-map upload behind an explicit SENTRY_AUTH_TOKEN to keep CI
// builds quiet on PRs without secrets.
const sentryEnabled = Boolean(process.env.SENTRY_DSN);
const uploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      sourcemaps: { disable: !uploadSourceMaps },
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : nextConfig;
