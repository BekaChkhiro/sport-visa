import type { Metadata } from 'next';

import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'რეგისტრაცია',
};

type SearchParams = Promise<{ role?: string }>;

const SCOUT_IMG =
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80';

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialRole = params.role === 'club' ? 'CLUB' : 'FOOTBALLER';

  return (
    <div className="relative mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-pop lg:min-h-[880px] lg:grid-cols-[1fr_1.05fr]">
        {/* ===== LEFT — form ===== */}
        <div className="order-2 p-7 sm:p-10 lg:order-1 lg:flex lg:flex-col lg:justify-center">
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

          <SignupForm initialRole={initialRole} />
        </div>

        {/* ===== RIGHT — brand / editorial ===== */}
        <div className="relative order-1 hidden flex-col justify-between overflow-hidden p-9 lg:order-2 lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SCOUT_IMG}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/85 to-ink-950" />

          {/* Logo – right-aligned on the brand panel */}
          <div className="relative flex justify-end">
            <div className="flex items-center gap-2.5">
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
              უფასო რეგისტრაცია
            </span>
            <h1 className="mt-5 max-w-[16ch] font-display text-[40px] font-bold leading-[1.05] tracking-tight text-ink-50">
              შემოუერთდი ქართულ <span className="text-brand-400">სკაუტინგს.</span>
            </h1>
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-ink-300">
              შექმენი პროფილი, ატვირთე ვიდეო და ფოტო და მიიღე შეთავაზებები ვერიფიცირებული
              კლუბებისგან.
            </p>
          </div>

          {/* Feature list */}
          <ul className="relative mt-10 space-y-3.5">
            {(
              [
                ['ვერიფიცირებული პროფილები', 'ყველა კლუბი და ფეხბურთელი ხელით მოწმდება'],
                ['პირდაპირი კავშირი', 'მესიჯი კლუბსა და ფეხბურთელს შორის — შუამავლის გარეშე'],
                ['სრული პროფილი', 'ფიზიკური მონაცემები, კარიერა, ვიდეო და გალერეა — ერთ გვერდზე'],
              ] as const
            ).map(([t, d]) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                </span>
                <div className="leading-snug">
                  <p className="text-[13px] font-semibold text-ink-100">{t}</p>
                  <p className="text-[11.5px] text-ink-400">{d}</p>
                </div>
              </li>
            ))}
          </ul>
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
