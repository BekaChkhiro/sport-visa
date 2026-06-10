import type { Metadata } from 'next';

import { SigninForm } from './signin-form';

export const metadata: Metadata = {
  title: 'შესვლა',
};

type SearchParams = Promise<{ verified?: string; error?: string; reset?: string }>;

const SCOUT_IMG =
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80';

export default async function SigninPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const verified = params.verified === '1';
  const passwordReset = params.reset === '1';
  const queryError = params.error;

  return (
    <div className="relative mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-pop lg:min-h-[880px] lg:grid-cols-[1.05fr_1fr]">
        {/* ===== LEFT — brand / editorial ===== */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-9 lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SCOUT_IMG}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/85 to-ink-950" />

          {/* Logo */}
          <div className="relative flex items-center gap-2.5">
            <span className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-brand-400 shadow-card">
              <svg width={23} height={23} viewBox="0 0 24 24" fill="none" focusable="false">
                <circle cx="12" cy="12" r="9" stroke="#1f2a0b" strokeWidth="1.6" />
                <path d="M12 7.5l2.6 1.9-1 3h-3.2l-1-3z" fill="#1f2a0b" />
                <path
                  d="M12 7.5V4M14.6 9.4l3-1M13.6 12.4l1.8 2.6M10.4 12.4l-1.8 2.6M9.4 9.4l-3-1"
                  stroke="#1f2a0b"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="font-display text-[20px] font-bold tracking-tight text-ink-50">
              Sport<span className="text-brand-400"> Visa</span>
            </span>
          </div>

          {/* Hero text */}
          <div className="relative mt-10">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              ვერიფიცირებული პლატფორმა
            </span>
            <h1 className="mt-5 max-w-[15ch] font-display text-[40px] font-bold leading-[1.05] tracking-tight text-ink-50">
              შენი ნიჭი იმსახურებს <span className="text-brand-400">სცენას.</span>
            </h1>
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-ink-300">
              შედი ანგარიშში და განაგრძე — სკაუტინგი, რომელიც ფეხბურთელებსა და კლუბებს პირდაპირ
              აკავშირებს.
            </p>
          </div>

          {/* Stats + testimonial */}
          <div className="relative mt-10 space-y-5">
            <div className="flex items-center gap-6">
              {(
                [
                  ['550K+', 'ფეხბურთელი'],
                  ['128', 'კლუბი'],
                  ['9', 'ლიგა'],
                ] as const
              ).map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold tracking-tight text-ink-50 tabular-nums">
                    {v}
                  </div>
                  <div className="text-[11px] text-ink-400">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-card border border-ink-800/80 bg-ink-950/60 p-3.5 backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://i.pravatar.cc/120?img=12"
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-ink-950"
              />
              <div className="leading-snug">
                <p className="text-[12.5px] text-ink-200">
                  „ორ კვირაში სამმა კლუბმა მომწერა. Sport Visa-მ ყველაფერი შეცვალა."
                </p>
                <p className="mt-1 text-[11px] text-ink-500">ლუკა ბერიძე · ST · დინამო აკადემია</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT — form ===== */}
        <div className="p-7 sm:p-10 lg:flex lg:flex-col lg:justify-center">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-400 shadow-card">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" focusable="false">
                <circle cx="12" cy="12" r="9" stroke="#1f2a0b" strokeWidth="1.6" />
                <path d="M12 7.5l2.6 1.9-1 3h-3.2l-1-3z" fill="#1f2a0b" />
                <path
                  d="M12 7.5V4M14.6 9.4l3-1M13.6 12.4l1.8 2.6M10.4 12.4l-1.8 2.6M9.4 9.4l-3-1"
                  stroke="#1f2a0b"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="font-display text-[20px] font-bold tracking-tight text-ink-50">
              Sport<span className="text-brand-400"> Visa</span>
            </span>
          </div>

          <SigninForm verified={verified} passwordReset={passwordReset} queryError={queryError} />
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] text-ink-600">
        © 2026 Sport Visa ·{' '}
        <a href="/terms" className="hover:text-ink-400">
          წესები
        </a>{' '}
        ·{' '}
        <a href="/privacy" className="hover:text-ink-400">
          კონფიდენციალურობა
        </a>
      </p>
    </div>
  );
}
