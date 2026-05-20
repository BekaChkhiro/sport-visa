import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Validate env on boot — kept here so a missing var crashes the app early.
  await import('./lib/env');

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';
  const tracesSampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
      // Keep PII off by default; opt in per-event via setUser() when needed.
      sendDefaultPii: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
      sendDefaultPii: false,
    });
  }
}

// Forwarded by Next.js for unhandled errors thrown in route handlers, server
// components, and server actions — gives Sentry a full request snapshot.
export const onRequestError = Sentry.captureRequestError;
