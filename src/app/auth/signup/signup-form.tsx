'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { signupAction, type SignupActionState } from '@/lib/auth/actions';
import type { SignupRole } from '@/lib/auth/schemas';

const initialState: SignupActionState = { status: 'idle' };

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
const IUser = (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </>
);
const IMail = (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </>
);
const ILock = (
  <>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>
);
const IFoot = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.2l3.1 2.3-1.2 3.7H9.1L7.9 9.5z" />
    <path d="M12 7.2V3M15.1 9.5l3.4-1.1M13.9 13.2l2.1 3.1M10.1 13.2l-2.1 3.1M8.9 9.5L5.5 8.4" />
  </>
);
const ICrest = (
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

/* ── password strength ── */
function strength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_LABEL = ['', 'სუსტი', 'საშუალო', 'კარგი', 'ძლიერი'];
const STR_TONE = ['bg-ink-700', 'bg-danger-400', 'bg-warning-400', 'bg-accent-400', 'bg-brand-400'];

/* ── field with leading icon ── */
function IconField({
  id,
  label,
  icon,
  trailing,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[12px] font-medium text-ink-300">
        {label}
      </Label>
      <div
        className={`flex items-center gap-2.5 rounded-field border bg-ink-950 px-3.5 transition-colors ${
          focused
            ? 'border-brand-400/60 ring-4 ring-brand-400/15'
            : error
              ? 'border-danger-400/60'
              : 'border-ink-700'
        }`}
      >
        <span className={focused ? 'text-brand-300' : 'text-ink-500'}>{icon}</span>
        <input
          id={id}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          className="h-11 flex-1 bg-transparent text-[14px] text-ink-50 placeholder:text-ink-600 outline-none"
        />
        {trailing}
      </div>
      {error && <p className="text-[12px] text-danger-300">{error}</p>}
    </div>
  );
}

function PasswordField({
  id,
  label,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <IconField
      id={id}
      label={label}
      icon={<Ico d={ILock} size={16} />}
      error={error}
      {...inputProps}
      type={show ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
          className="text-ink-500 transition-colors hover:text-ink-200"
          tabIndex={-1}
        >
          <Ico d={show ? IEyeOff : IEye} size={17} />
        </button>
      }
    />
  );
}

export function SignupForm({ initialRole }: { initialRole: SignupRole }) {
  const router = useRouter();
  const [role, setRole] = React.useState<SignupRole>(initialRole);
  const [state, setState] = React.useState<SignupActionState>(initialState);
  const [pending, startTransition] = React.useTransition();
  const [pw, setPw] = React.useState('');

  React.useEffect(() => {
    if (state.status === 'success') {
      router.replace('/verification-pending');
      router.refresh();
    }
  }, [state.status, router]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('role', role);
    startTransition(async () => {
      const next = await signupAction(state, formData);
      setState(next);
    });
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  const generalError = state.status === 'error' && !fieldErrors ? state.message : undefined;
  const st = strength(pw);

  const roles: { v: SignupRole; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      v: 'FOOTBALLER',
      label: 'ფეხბურთელი',
      desc: 'მოძებნე კლუბი',
      icon: <Ico d={IFoot} size={18} />,
    },
    { v: 'CLUB', label: 'კლუბი', desc: 'მოძებნე ნიჭი', icon: <Ico d={ICrest} size={18} /> },
  ];

  return (
    <>
      {/* Heading */}
      <div className="mb-6">
        <h2 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
          შექმენი ანგარიში
        </h2>
        <p className="mt-1.5 text-[13.5px] text-ink-400">
          რამდენიმე წუთი — და შენი პროფილი ეთერშია.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {/* Role picker */}
        <fieldset className="space-y-2">
          <legend className="mb-2 text-[12px] font-medium text-ink-300">ვინ ხარ?</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => {
              const on = role === r.v;
              return (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRole(r.v)}
                  aria-pressed={on}
                  data-value={r.v}
                  className={`flex items-center gap-3 rounded-card border p-3.5 text-left transition-colors ${
                    on
                      ? 'border-brand-400 bg-brand-400/10'
                      : 'border-ink-700 bg-ink-950 hover:border-ink-600'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${
                      on ? 'bg-brand-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                    }`}
                  >
                    {r.icon}
                  </span>
                  <span className="leading-tight">
                    <span
                      className={`block text-[13.5px] font-semibold ${on ? 'text-ink-50' : 'text-ink-200'}`}
                    >
                      {r.label}
                    </span>
                    <span className="block text-[11px] text-ink-500">{r.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <IconField
            id="firstName"
            name="firstName"
            label="სახელი"
            icon={<Ico d={IUser} size={16} />}
            autoComplete="given-name"
            required
            aria-invalid={Boolean(fieldErrors?.firstName)}
            placeholder="გიორგი"
            error={fieldErrors?.firstName?.[0]}
          />
          <IconField
            id="lastName"
            name="lastName"
            label="გვარი"
            icon={<Ico d={IUser} size={16} />}
            autoComplete="family-name"
            required
            aria-invalid={Boolean(fieldErrors?.lastName)}
            placeholder="მამარდაშვილი"
            error={fieldErrors?.lastName?.[0]}
          />
        </div>

        <IconField
          id="email"
          name="email"
          label="ელ. ფოსტა"
          type="email"
          icon={<Ico d={IMail} size={16} />}
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldErrors?.email)}
          placeholder="you@example.ge"
          error={fieldErrors?.email?.[0]}
        />

        {/* Password with strength meter */}
        <div>
          <PasswordField
            id="password"
            name="password"
            label="პაროლი"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(fieldErrors?.password)}
            value={pw}
            onChange={(e) => setPw((e.target as HTMLInputElement).value)}
            placeholder="მინ. 8 სიმბოლო"
            error={fieldErrors?.password?.[0]}
          />
          {pw && (
            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${i <= st ? STR_TONE[st] : 'bg-ink-800'}`}
                  />
                ))}
              </div>
              <span className="w-[52px] text-right text-[11px] font-medium text-ink-400">
                {STR_LABEL[st]}
              </span>
            </div>
          )}
        </div>

        <PasswordField
          id="passwordConfirm"
          name="passwordConfirm"
          label="გაიმეორე პაროლი"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors?.passwordConfirm)}
          placeholder="••••••••"
          error={fieldErrors?.passwordConfirm?.[0]}
        />

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <Checkbox id="acceptTerms" name="acceptTerms" required className="mt-0.5" />
          <Label htmlFor="acceptTerms" className="text-[13px] leading-snug text-ink-300">
            ვეთანხმები{' '}
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-brand-400 hover:text-brand-300"
            >
              წესებსა და პირობებს
            </Link>
          </Label>
        </div>
        {fieldErrors?.acceptTerms?.[0] ? (
          <p className="-mt-2 text-[12px] text-danger-300">{fieldErrors.acceptTerms[0]}</p>
        ) : null}

        {generalError ? (
          <p role="alert" className="text-[13px] text-danger-300">
            {generalError}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            'რეგისტრაცია…'
          ) : (
            <>
              რეგისტრაცია <Ico d={IArrow} size={17} stroke={2.5} />
            </>
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-[13px] text-ink-400">
        უკვე გაქვს ანგარიში?{' '}
        <Link href="/auth/signin" className="font-semibold text-brand-400 hover:text-brand-300">
          შესვლა
        </Link>
      </p>
    </>
  );
}
