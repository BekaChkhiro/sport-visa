import Link from 'next/link';
import type { Metadata } from 'next';

import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'ახალი პაროლი',
};

type SearchParams = Promise<{ token?: string; email?: string }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { token, email } = await searchParams;

  return (
    <div className="relative mx-auto flex max-w-[1080px] flex-col items-center px-5 py-10 sm:px-8 sm:py-16">
      <div className="w-full max-w-[460px]">
        {/* Logo */}
        <div className="mb-9 flex justify-center">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-400 shadow-card">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" focusable="false">
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
            <span className="font-display text-[21px] font-bold tracking-tight text-ink-50">
              Sport<span className="text-brand-400"> Visa</span>
            </span>
          </div>
        </div>

        <div className="relative rounded-card border border-ink-800 bg-ink-900 p-8 shadow-pop sm:p-10">
          {!token || !email ? (
            /* Invalid link state */
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-danger-400/25 bg-danger-400/10 text-danger-300">
                  <svg
                    width={30}
                    height={30}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                </div>
              </div>
              <h1 className="font-display text-[22px] font-bold tracking-tight text-ink-50">
                ახალი პაროლი
              </h1>
              <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-ink-400">
                ლინკი არასწორია. გთხოვ, გაიმეოროე პაროლის აღდგენა.
              </p>
              <Link
                href="/auth/forgot-password"
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500"
              >
                პაროლის აღდგენა
              </Link>
            </div>
          ) : (
            <ResetPasswordForm token={token} email={email} />
          )}
        </div>

        <p className="mt-6 text-center text-[13px]">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 text-ink-400 transition-colors hover:text-ink-100"
          >
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            შესვლაზე დაბრუნება
          </Link>
        </p>
        <p className="mt-7 text-center text-[11px] text-ink-600">© 2026 Sport Visa</p>
      </div>
    </div>
  );
}
