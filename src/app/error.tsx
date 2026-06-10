'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

/* ============================================================
   Sport Visa — 500 Error
   instrument-dark · danger focal · centered error + retry
   ============================================================ */

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const links = ['სტატუსის გვერდი', 'მხარდაჭერა', 'შეცდომის შეტყობინება'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 font-sans text-ink-200">
      {/* Subtle pitch background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=70"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Danger glow */}
      <div className="pointer-events-none absolute -right-24 top-10 h-[460px] w-[460px] rounded-full bg-danger-400/8 blur-[150px]" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-ink-800/70">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center px-5 sm:px-7">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Sport Visa — მთავარი">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-400 shadow-card">
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
            <span className="font-display text-[18px] font-bold tracking-tight text-ink-50">
              Sport<span className="text-brand-400"> Visa</span>
            </span>
          </Link>

          <Link
            href="/support"
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 transition-colors hover:text-ink-100"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3.6" />
              <path d="m4.5 4.5 4.9 4.9M14.6 14.6l4.9 4.9M19.5 4.5l-4.9 4.9M9.4 14.6l-4.9 4.9" />
            </svg>
            დახმარება
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 mx-auto grid max-w-[1080px] items-center gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[1fr_0.85fr] lg:py-24">
        {/* Left: text content */}
        <div className="order-2 lg:order-1">
          {/* Animated danger badge */}
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-danger-400/30 bg-danger-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-danger-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            შეცდომა · INTERNAL
          </span>

          <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.08] tracking-tight text-ink-50 sm:text-[52px]">
            რაღაც ვერ შესრულდა
          </h1>
          <p className="mt-4 max-w-md text-[15.5px] leading-[1.7] text-ink-400">
            სერვერზე მოულოდნელი შეცდომა მოხდა. ჩვენი გუნდი უკვე იღებს შეტყობინებას — სცადე ხელახლა
            ერთ წამში.
          </p>

          {/* Error reference chip */}
          {error.digest && (
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-field border border-ink-800 bg-ink-950/60 px-3.5 py-2.5">
              <span className="font-mono text-[12px] text-ink-500">REF</span>
              <span className="font-mono text-[12.5px] font-semibold tabular-nums text-ink-200">
                {error.digest}
              </span>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25"
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
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn border border-ink-700 bg-ink-900 px-6 text-[15px] font-medium text-ink-100 transition-colors hover:border-ink-600 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25"
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

          {/* Useful links */}
          <div className="mt-10 border-t border-ink-800 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
              სასარგებლო ბმულები
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((l) => (
                <Link
                  key={l}
                  href="/"
                  className="group inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900/60 px-3.5 py-1.5 text-[12.5px] font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
                >
                  {l}
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink-600 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: decorative 500 display */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
            <span className="pointer-events-none absolute select-none font-display text-[200px] font-bold leading-none tracking-tighter tabular-nums text-danger-400/15 sm:text-[260px]">
              500
            </span>
            <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-danger-400/12 text-danger-300 ring-1 ring-danger-400/20 sm:h-32 sm:w-32">
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
    </div>
  );
}
