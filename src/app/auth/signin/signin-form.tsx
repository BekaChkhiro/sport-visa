'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signinAction, type SigninActionState } from '@/lib/auth/actions';

const initialState: SigninActionState = { status: 'idle' };

const QUERY_ERROR_MESSAGES: Record<string, string> = {
  'invalid-link': 'ვერიფიკაციის ლინკი არასწორია. სცადე ხელახლა.',
  'link-expired': 'ვერიფიკაციის ლინკი ვადაგასულია. სცადე ახლიდან გაგზავნა.',
  'server-error': 'სერვერის შეცდომა. სცადე თავიდან.',
};

// Demo accounts seeded by `npm run db:seed:demo`. Listed here so the site can be
// explored without knowing the credentials — clicking one fills the form.
const DEMO_PASSWORD = 'Demo123!';
const DEMO_ACCOUNTS: { label: string; email: string; tone: string }[] = [
  {
    label: 'ადმინი',
    email: 'admin@demo.ge',
    tone: 'text-iris-300 border-iris-400/30 bg-iris-400/10',
  },
  {
    label: 'კლუბი',
    email: 'club1@demo.ge',
    tone: 'text-accent-300 border-accent-400/30 bg-accent-400/10',
  },
  {
    label: 'ფეხბურთელი',
    email: 'player1@demo.ge',
    tone: 'text-brand-300 border-brand-400/30 bg-brand-400/10',
  },
];

/* ── tiny inline icon helper ── */
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
const ICheck = <path d="m20 6-11 11-5-5" />;
const ILock = (
  <>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>
);
const IMail = (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </>
);
const ISpark = (
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
);

/* ── field with leading icon + optional trailing ── */
function IconField({
  id,
  label,
  icon,
  trailing,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[12px] font-medium text-ink-300">
        {label}
      </Label>
      <div
        className={`flex items-center gap-2.5 rounded-field border bg-ink-950 px-3.5 transition-colors ${
          focused ? 'border-brand-400/60 ring-4 ring-brand-400/15' : 'border-ink-700'
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
    </div>
  );
}

export function SigninForm({
  verified = false,
  passwordReset = false,
  queryError,
}: {
  verified?: boolean;
  passwordReset?: boolean;
  queryError?: string;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<SigninActionState>(initialState);
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  }

  React.useEffect(() => {
    if (state.status === 'success') {
      router.replace('/dashboard');
      router.refresh();
    }
  }, [state.status, router]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const next = await signinAction(state, formData);
      setState(next);
    });
  }

  const error = state.status === 'error' ? state.message : undefined;
  const queryErrorMessage = queryError ? (QUERY_ERROR_MESSAGES[queryError] ?? null) : null;

  return (
    <>
      {/* Heading */}
      <div className="mb-7">
        <h2 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
          კეთილი იყოს დაბრუნება
        </h2>
        <p className="mt-1.5 text-[13.5px] text-ink-400">შედი შენს Sport Visa ანგარიშში.</p>
      </div>

      {/* Success banner */}
      {state.status === 'success' && (
        <div className="mb-5 flex items-center gap-3 rounded-card border border-success-400/30 bg-success-400/10 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success-400/20 text-success-300">
            <Ico d={ICheck} size={18} stroke={2.5} />
          </span>
          <div className="leading-snug">
            <p className="text-[13.5px] font-semibold text-success-200">წარმატებით შეხვედი</p>
            <p className="text-[12px] text-success-300/80">გადამისამართება პანელზე…</p>
          </div>
        </div>
      )}

      {/* Verified / password-reset banners */}
      {verified && (
        <div className="mb-5 flex items-center gap-2.5 rounded-card border border-success-400/30 bg-success-400/10 p-3.5 text-[13px] text-success-200">
          <Ico d={ICheck} size={15} stroke={2.5} />
          ელ. ფოსტა დადასტურდა! შედი ანგარიშში.
        </div>
      )}
      {passwordReset && (
        <div className="mb-5 flex items-center gap-2.5 rounded-card border border-success-400/30 bg-success-400/10 p-3.5 text-[13px] text-success-200">
          <Ico d={ICheck} size={15} stroke={2.5} />
          პაროლი წარმატებით შეიცვალა! შედი ახალი პაროლით.
        </div>
      )}
      {queryErrorMessage && (
        <div
          role="alert"
          className="mb-5 rounded-card border border-danger-400/30 bg-danger-400/10 p-3.5 text-[13px] text-danger-300"
        >
          {queryErrorMessage}
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <IconField
          id="email"
          name="email"
          label="ელ. ფოსტა"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          placeholder="you@example.ge"
          icon={<Ico d={IMail} size={16} />}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[12px] font-medium text-ink-300">
              პაროლი
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-[12px] text-ink-400 transition-colors hover:text-brand-300"
            >
              პაროლი დამავიწყდა?
            </Link>
          </div>
          <div
            className={`flex items-center gap-2.5 rounded-field border bg-ink-950 px-3.5 transition-colors ${
              error
                ? 'border-danger-400/60'
                : 'border-ink-700 focus-within:border-brand-400/60 focus-within:ring-4 focus-within:ring-brand-400/15'
            }`}
          >
            <span className="text-ink-500">
              <Ico d={ILock} size={16} />
            </span>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
              placeholder="••••••••"
              className="h-11 flex-1 border-0 bg-transparent p-0 text-[14px] text-ink-50 placeholder:text-ink-600 outline-none ring-0 focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
              className="text-ink-500 transition-colors hover:text-ink-200"
              tabIndex={-1}
            >
              <Ico d={showPassword ? IEyeOff : IEye} size={17} />
            </button>
          </div>
        </div>

        {/* Remember me */}
        <button
          type="button"
          onClick={() => setRemember((v) => !v)}
          className="flex items-center gap-2.5 text-left"
          aria-pressed={remember}
        >
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors ${
              remember ? 'border-brand-400 bg-brand-400 text-ink-950' : 'border-ink-600 bg-ink-950'
            }`}
          >
            {remember && <Ico d={ICheck} size={12} stroke={3} />}
          </span>
          <span className="text-[13px] text-ink-300">დამიმახსოვრე ამ მოწყობილობაზე</span>
        </button>

        {error ? (
          <p role="alert" className="text-[13px] text-danger-300">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            'შესვლა…'
          ) : (
            <>
              შესვლა <Ico d={IArrow} size={17} stroke={2.5} />
            </>
          )}
        </Button>
      </form>

      {/* Demo accounts */}
      <div className="mt-7 rounded-card border border-dashed border-ink-700 bg-ink-950/50 p-4">
        <div className="flex items-center gap-2">
          <Ico d={ISpark} size={14} className="text-brand-400" />
          <p className="text-[12.5px] font-semibold text-ink-200">სატესტო ანგარიშები</p>
        </div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
          დააჭირე ღილაკს ფორმის ავტომატურად შესავსებად. პაროლი:{' '}
          <code className="font-mono text-ink-300">{DEMO_PASSWORD}</code>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc.email)}
              className={`rounded-pill border px-3 py-1.5 text-[12px] font-semibold transition-transform hover:-translate-y-px ${acc.tone}`}
            >
              {acc.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] text-ink-500">
          ასევე: <code className="font-mono text-ink-400">club1–10@demo.ge</code> და{' '}
          <code className="font-mono text-ink-400">player1–10@demo.ge</code>
        </p>
      </div>

      <p className="mt-7 text-center text-[13px] text-ink-400">
        არ გაქვს ანგარიში?{' '}
        <Link href="/auth/signup" className="font-semibold text-brand-400 hover:text-brand-300">
          დარეგისტრირდი
        </Link>
      </p>
    </>
  );
}
