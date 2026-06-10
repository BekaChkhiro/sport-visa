import Link from 'next/link';
import type { Metadata } from 'next';

import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'პაროლის აღდგენა',
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative mx-auto flex max-w-[500px] flex-col items-stretch px-5 py-14 sm:py-20">
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

      <div className="rounded-card border border-ink-800 bg-ink-900 p-7 shadow-pop sm:p-9">
        <span className="flex h-12 w-12 items-center justify-center rounded-[13px] border border-brand-400/25 bg-brand-400/10 text-brand-300">
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        <h1 className="mt-5 font-display text-[23px] font-bold tracking-tight text-ink-50">
          პაროლის აღდგენა
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-400">
          მიუთითე ანგარიშის ელ. ფოსტა — გამოგიგზავნით აღდგენის ლინკს.
        </p>

        <div className="mt-7">
          <ForgotPasswordForm />
        </div>

        <div className="mt-7 border-t border-ink-800 pt-5 text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-ink-400 transition-colors hover:text-brand-300"
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
            შესვლაში დაბრუნება
          </Link>
        </div>
      </div>

      <p className="mt-7 text-center text-[12px] text-ink-500">
        ლინკი მხოლოდ <span className="text-ink-300">24 საათი</span> მოქმედებს უსაფრთხოებისთვის.
      </p>
    </div>
  );
}
