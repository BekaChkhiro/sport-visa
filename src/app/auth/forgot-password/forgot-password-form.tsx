'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { requestPasswordResetAction } from '@/lib/auth/actions-reset';

/* ── inline icon helper ── */
function Ico({
  d,
  size = 16,
  stroke = 2,
  className = '',
}: {
  d: React.ReactNode;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {d}
    </svg>
  );
}

const ISend = <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />;
const ICheck = <path d="m20 6-11 11-5-5" />;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [pending, startTransition] = React.useTransition();
  const [focused, setFocused] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      if (result.status === 'error') {
        setError(result.message);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-success-400/30 bg-success-400/10 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-400/20 text-success-300">
          <Ico d={ICheck} size={18} stroke={2.5} />
        </span>
        <div className="leading-snug">
          <p className="text-[13.5px] font-semibold text-success-200">ლინკი გაიგზავნა</p>
          <p className="text-[12px] text-success-300/80">
            თუ ეს მისამართი დარეგისტრირებულია, წერილი გაიგზავნა — შეამოწმე ელ. ფოსტა.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-ink-300">
          ელ. ფოსტა
        </label>
        <div
          className={`flex items-center gap-2.5 rounded-field border bg-ink-950 px-3.5 transition-colors ${
            focused
              ? 'border-brand-400/60 ring-4 ring-brand-400/15'
              : error
                ? 'border-danger-400/60'
                : 'border-ink-700'
          }`}
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
            className={focused ? 'text-brand-300' : 'text-ink-500'}
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(error)}
            placeholder="you@example.ge"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-11 flex-1 bg-transparent text-[14px] text-ink-50 placeholder:text-ink-600 outline-none"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-[13px] text-danger-300">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          'გაგზავნა…'
        ) : (
          <>
            <Ico d={ISend} size={16} /> კოდის გაგზავნა
          </>
        )}
      </Button>
    </form>
  );
}
