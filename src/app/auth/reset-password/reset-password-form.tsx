'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { resetPasswordAction } from '@/lib/auth/actions-reset';

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

const IKey = (
  <>
    <circle cx="7.5" cy="15.5" r="3.5" />
    <path d="m10 13 9-9M16 6l2 2M14 8l2 2" />
  </>
);
const IArrow = <path d="M5 12h14M13 6l6 6-6 6" />;
const IEye = (
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
const IEyeOff = (
  <>
    <path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.2 3.7M6.1 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 3.5-.7" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </>
);
const ILock = (
  <>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>
);
const ICheck = <path d="m20 6-11 11-5-5" />;
const IShield = (
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);
const IMail = (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>
);

/* ── password strength ── */
function score(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const METER = [
  { w: '25%', tone: 'bg-danger-400', label: 'სუსტი', text: 'text-danger-300' },
  { w: '50%', tone: 'bg-warning-400', label: 'საშუალო', text: 'text-warning-300' },
  { w: '75%', tone: 'bg-accent-400', label: 'კარგი', text: 'text-accent-300' },
  { w: '100%', tone: 'bg-success-400', label: 'ძლიერი', text: 'text-success-300' },
];

/* ── password field ── */
function PassField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  ok,
  ariaInvalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  ok?: boolean;
  ariaInvalid?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const [show, setShow] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink-300">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-field border bg-ink-950 px-3.5 transition-colors ${
          focused
            ? 'border-brand-400/60 ring-4 ring-brand-400/15'
            : ok
              ? 'border-success-400/40'
              : 'border-ink-700'
        }`}
      >
        <span className={focused ? 'text-brand-300' : 'text-ink-500'}>
          <Ico d={ILock} size={16} />
        </span>
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          aria-invalid={ariaInvalid}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-11 flex-1 bg-transparent text-[14px] text-ink-50 placeholder:text-ink-600 outline-none"
        />
        {ok && <Ico d={ICheck} size={16} stroke={2.5} className="text-success-300" />}
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={show ? 'დამალვა' : 'ჩვენება'}
          className="text-ink-500 transition-colors hover:text-ink-200"
        >
          <Ico d={show ? IEyeOff : IEye} size={17} />
        </button>
      </div>
    </div>
  );
}

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [pw, setPw] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | undefined>();
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const s = score(pw);
  const meter = s > 0 ? METER[s - 1] : null;
  const match = confirm.length > 0 && confirm === pw;
  const valid = pw.length >= 8 && match;

  const checks = [
    { ok: pw.length >= 8, label: 'მინ. 8 სიმბოლო' },
    { ok: /[A-Z]/.test(pw) && /[a-z]/.test(pw), label: 'დიდი და პატარა ასო' },
    { ok: /\d/.test(pw), label: 'მინიმუმ ერთი ციფრი' },
  ];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('token', token);
    formData.set('email', email);
    setError(undefined);
    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result.status === 'error') {
        setError(result.message);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-success-400/25 bg-success-400/10 text-success-300">
            <Ico d={IShield} size={30} stroke={1.7} />
          </div>
        </div>
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-50">
          პაროლი განახლდა
        </h1>
        <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-ink-400">
          შენი პაროლი წარმატებით შეიცვალა. ახლა შეგიძლია შეხვიდე ახალი პაროლით.
        </p>
        <button
          type="button"
          onClick={() => router.replace('/auth/signin?reset=1')}
          className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500"
        >
          შესვლა <Ico d={IArrow} size={17} stroke={2.5} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-7 flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-400/25 bg-brand-400/10 text-brand-300">
          <Ico d={IKey} size={21} stroke={1.8} />
        </div>
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-ink-50">
            ახალი პაროლი
          </h1>
          <p className="mt-1 text-[13px] leading-snug text-ink-400">
            შეიყვანე ახალი პაროლი ანგარიშისთვის
          </p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-ink-700 bg-ink-950 py-1 pl-2 pr-2.5 text-[12.5px] font-medium text-ink-200">
            <Ico d={IMail} size={14} className="text-brand-300" />
            {email}
          </span>
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {/* hidden fields keep existing server action working */}
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />

        <div>
          <PassField
            id="password"
            label="ახალი პაროლი"
            value={pw}
            onChange={setPw}
            placeholder="••••••••"
            autoComplete="new-password"
            ariaInvalid={Boolean(error)}
          />

          {pw.length > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between">
                <div className="mr-3 h-1.5 flex-1 overflow-hidden rounded-pill bg-ink-800">
                  <div
                    className={`h-full rounded-pill transition-all duration-300 ${meter?.tone ?? ''}`}
                    style={{ width: meter?.w ?? '0%' }}
                  />
                </div>
                <span className={`text-[11px] font-semibold ${meter?.text ?? 'text-ink-500'}`}>
                  {meter?.label ?? ''}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {checks.map((c) => (
                  <span
                    key={c.label}
                    className={`inline-flex items-center gap-1.5 text-[11.5px] ${c.ok ? 'text-success-300' : 'text-ink-500'}`}
                  >
                    <span
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${c.ok ? 'bg-success-400/20' : 'bg-ink-800'}`}
                    >
                      {c.ok && <Ico d={ICheck} size={9} stroke={3} />}
                    </span>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <PassField
            id="passwordConfirm"
            label="გაიმეორე პაროლი"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            autoComplete="new-password"
            ok={match}
            ariaInvalid={Boolean(error)}
          />
          {confirm.length > 0 && !match && (
            <p className="mt-1.5 text-[12px] text-danger-300">პაროლები არ ემთხვევა.</p>
          )}
        </div>

        {error ? (
          <p role="alert" className="text-[13px] text-danger-300">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={!valid || pending}>
          {pending ? (
            'ინახება…'
          ) : (
            <>
              პაროლის შენახვა <Ico d={IArrow} size={17} stroke={2.5} />
            </>
          )}
        </Button>
      </form>
    </>
  );
}
