'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { resendVerificationEmailAction } from '@/lib/auth/actions-verify';

type State = 'idle' | 'sent' | 'error';

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

const IRefresh = (
  <>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </>
);
const IClock = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>
);
const ICheck = <path d="m20 6-11 11-5-5" />;

const COOLDOWN_SECONDS = 45;

export function ResendButton() {
  const [uiState, setUiState] = React.useState<State>('idle');
  const [pending, startTransition] = React.useTransition();
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleResend() {
    if (cooldown > 0) return;
    startTransition(async () => {
      const result = await resendVerificationEmailAction();
      if (result.status === 'success') {
        setUiState('sent');
        setCooldown(COOLDOWN_SECONDS);
      } else {
        setUiState('error');
      }
    });
  }

  return (
    <div>
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleResend}
        disabled={pending || cooldown > 0}
      >
        {cooldown > 0 ? (
          <>
            <Ico d={IClock} size={16} />
            ხელახლა გაგზავნა {cooldown} წმ-ში
          </>
        ) : (
          <>
            <Ico d={IRefresh} size={16} />
            წერილის ხელახლა გაგზავნა
          </>
        )}
      </Button>

      {uiState === 'sent' && (
        <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-success-300">
          <Ico d={ICheck} size={14} stroke={2.5} />
          ახალი წერილი გაიგზავნა — შეამოწმე ფოსტა.
        </div>
      )}
      {uiState === 'error' && (
        <p className="mt-2 text-center text-[13px] text-danger-300">
          გაგზავნა ვერ მოხერხდა. სცადე თავიდან.
        </p>
      )}
    </div>
  );
}
