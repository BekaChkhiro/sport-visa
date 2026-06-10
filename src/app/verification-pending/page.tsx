import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';

import { ResendButton } from './resend-button';

export const metadata: Metadata = {
  title: 'ელ. ფოსტის დადასტურება',
};

export default async function VerificationPendingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Already verified — middleware will route /dashboard to the right role page.
  if (session.user.emailVerified) {
    redirect('/dashboard');
  }

  const email = session.user.email ?? '';

  return (
    <div className="relative overflow-hidden bg-ink-950 text-ink-200">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-brand-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-accent-400/5 blur-[120px]" />

      <div className="relative mx-auto flex max-w-[1080px] flex-col items-center px-5 py-10 sm:px-8 sm:py-16">
        <div className="w-full max-w-[480px]">
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
            {/* Mail mark */}
            <div className="mb-6 flex justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-400/25 bg-brand-400/10 text-brand-300">
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
                  <path d="M3 8.5 12 14l9-5.5" />
                  <path d="M3 8.5 12 3l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-400 text-ink-950 shadow-card">
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-50">
                შეამოწმე ელ. ფოსტა
              </h1>
              <p className="mx-auto mt-2 max-w-[36ch] text-[13.5px] leading-relaxed text-ink-400">
                სარეგისტრაციო ლინკი გავაგზავნეთ მისამართზე — დააჭირე ლინკს ანგარიშის
                გასააქტიურებლად.
              </p>
            </div>

            {/* Email pill */}
            <div className="mt-5 flex items-center justify-center gap-2.5 rounded-field border border-ink-700 bg-ink-950 px-4 py-3">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-brand-300"
                aria-hidden
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              {email && (
                <span className="truncate text-[14px] font-medium text-ink-100">{email}</span>
              )}
            </div>

            {/* Steps */}
            <ul className="mt-6 space-y-3">
              {[
                'გახსენი ჩვენგან მიღებული წერილი',
                'დააჭირე ღილაკს „ანგარიშის დადასტურება"',
                'დაბრუნდი და შედი შენს ანგარიშში',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-[11px] font-bold text-brand-300 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-[13px] leading-snug text-ink-300">{s}</span>
                </li>
              ))}
            </ul>

            {/* Link validity */}
            <div className="mt-6 flex items-center gap-2 rounded-field border border-ink-800 bg-ink-950/60 px-3.5 py-2.5">
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-ink-500"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span className="text-[12px] text-ink-400">
                ლინკი მოქმედია <span className="font-medium text-ink-200">24 საათის</span>{' '}
                განმავლობაში.
              </span>
            </div>

            {/* Resend */}
            <div className="mt-6">
              <ResendButton />
            </div>

            {/* Spam note */}
            <div className="mt-5 flex items-start gap-2.5 rounded-field border border-warning-400/20 bg-warning-400/[0.07] px-3.5 py-3">
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-px shrink-0 text-warning-300"
                aria-hidden
              >
                <path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              <p className="text-[12px] leading-relaxed text-ink-300">
                წერილი ვერ იპოვე? შეამოწმე{' '}
                <span className="font-medium text-warning-200">სპამის</span> საქაღალდე ან დარწმუნდი,
                რომ მისამართი სწორია.
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-between text-[13px]">
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
            <Link
              href="/auth/signup"
              className="text-ink-400 transition-colors hover:text-brand-300"
            >
              სხვა ელ. ფოსტა?
            </Link>
          </div>

          <p className="mt-8 text-center text-[11px] text-ink-600">
            © 2026 Sport Visa · დახმარება:{' '}
            <a href="mailto:support@sportvisa.ge" className="text-ink-500 hover:text-ink-300">
              support@sportvisa.ge
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
