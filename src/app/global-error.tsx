'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

// Catches errors thrown by the root layout itself.
// Must render its own <html>/<body> because the layout failed to render.
// globals.css is loaded via the layout, which failed — Tailwind utility classes
// are still compiled into the bundle so they work here; custom CSS vars (tokens)
// may not be available, so we fall back to inline hex values for critical colours.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ka">
      <body
        className="min-h-screen overflow-hidden font-sans text-ink-200"
        style={{ background: '#15171c', color: '#c9cdd2' }}
      >
        {/* Danger glow — inline because CSS vars may not load */}
        <div
          className="pointer-events-none absolute -right-24 top-10 h-[460px] w-[460px] rounded-full blur-[150px]"
          style={{ background: 'rgba(228,78,64,0.08)' }}
        />

        {/* Top bar */}
        <header className="relative z-10 border-b" style={{ borderColor: 'rgba(37,41,50,0.7)' }}>
          <div className="mx-auto flex h-16 max-w-[1080px] items-center px-5 sm:px-7">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-[10px]"
                style={{ background: '#aede48' }}
              >
                <svg width={19} height={19} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="#1f2a0b" strokeWidth="1.6" />
                  <path d="M12 7.5l2.6 1.9-1 3h-3.2l-1-3z" fill="#1f2a0b" />
                  <path
                    d="M12 7.5V4M14.6 9.4l3-1M13.6 12.4l1.8 2.6M10.4 12.4l-1.8 2.6M9.4 9.4l-3-1"
                    stroke="#1f2a0b"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-[18px] font-bold tracking-tight" style={{ color: '#f6f7f8' }}>
                Sport<span style={{ color: '#aede48' }}> Visa</span>
              </span>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="relative z-10 mx-auto grid max-w-[1080px] items-center gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[1fr_0.85fr] lg:py-24">
          {/* Left: text */}
          <div className="order-2 lg:order-1">
            {/* Danger badge */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{
                border: '1px solid rgba(228,78,64,0.3)',
                background: 'rgba(228,78,64,0.1)',
                color: '#ee746a',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ background: '#ee746a' }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: '#ee746a' }}
                />
              </span>
              შეცდომა · INTERNAL
            </span>

            <h1
              className="mt-5 text-[40px] font-bold leading-[1.08] tracking-tight sm:text-[52px]"
              style={{ color: '#f6f7f8' }}
            >
              აპლიკაცია ვერ ჩაიტვირთა
            </h1>
            <p className="mt-4 max-w-md text-[15.5px] leading-[1.7]" style={{ color: '#7f858e' }}>
              მოულოდნელი შეცდომა. სცადეთ გვერდის გადატვირთვა ან ჩვენი გუნდი უკვე იღებს შეტყობინებას.
            </p>

            {error.digest && (
              <div
                className="mt-5 inline-flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5"
                style={{
                  border: '1px solid #252932',
                  background: 'rgba(21,23,28,0.6)',
                }}
              >
                <span className="font-mono text-[12px]" style={{ color: '#5d636c' }}>
                  REF
                </span>
                <span
                  className="font-mono text-[12.5px] font-semibold"
                  style={{ color: '#c9cdd2' }}
                >
                  {error.digest}
                </span>
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-6 text-[15px] font-semibold transition-colors focus-visible:outline-none"
                style={{ background: '#aede48', color: '#15171c' }}
              >
                <svg
                  width={17}
                  height={17}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                ხელახლა ცდა
              </button>
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-6 text-[15px] font-medium transition-colors focus-visible:outline-none"
                style={{
                  border: '1px solid #343943',
                  background: '#1b1e24',
                  color: '#e7e9ec',
                }}
              >
                <svg
                  width={17}
                  height={17}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5 10v10h14V10" />
                  <path d="M9 20v-6h6v6" />
                </svg>
                მთავარ გვერდზე
              </Link>
            </div>
          </div>

          {/* Right: decorative 500 display */}
          <div className="order-1 flex items-center justify-center lg:order-2">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
              <span
                className="pointer-events-none absolute select-none text-[200px] font-bold leading-none tracking-tighter tabular-nums sm:text-[260px]"
                style={{ color: 'rgba(228,78,64,0.15)' }}
              >
                500
              </span>
              <span
                className="relative flex h-28 w-28 items-center justify-center rounded-full sm:h-32 sm:w-32"
                style={{
                  background: 'rgba(228,78,64,0.12)',
                  color: '#ee746a',
                  boxShadow: '0 0 0 1px rgba(228,78,64,0.2)',
                }}
              >
                <svg
                  width={56}
                  height={56}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  <path d="M12 9v4M12 17h0" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
