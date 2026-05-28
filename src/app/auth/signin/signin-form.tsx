'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

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
const DEMO_ACCOUNTS: { label: string; email: string }[] = [
  { label: 'ადმინი', email: 'admin@demo.ge' },
  { label: 'კლუბი', email: 'club1@demo.ge' },
  { label: 'ფეხბურთელი', email: 'player1@demo.ge' },
];

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
    <div className="space-y-4">
      {verified && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
          ✓ ელ. ფოსტა დადასტურდა! შედი ანგარიშში.
        </div>
      )}
      {passwordReset && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
          ✓ პაროლი წარმატებით შეიცვალა! შედი ახალი პაროლით.
        </div>
      )}
      {queryErrorMessage && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {queryErrorMessage}
        </div>
      )}
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">ელ. ფოსტა</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">პაროლი</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              პაროლი დამავიწყდა?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
              className="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'შესვლა...' : 'შესვლა'}
        </Button>

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="bg-background relative z-10 px-2">ან</span>
          <span className="absolute inset-x-0 top-1/2 -z-0 border-t" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled
          title="მალე ხელმისაწვდომი იქნება"
        >
          Google-ით შესვლა
        </Button>
      </form>

      <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm">
        <p className="font-medium">სატესტო ანგარიშები</p>
        <p className="mt-1 text-xs text-muted-foreground">
          დააჭირე ღილაკს ფორმის ავტომატურად შესავსებად. პაროლი ყველასთვის:{' '}
          <code className="rounded bg-background px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <Button
              key={acc.email}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fillDemo(acc.email)}
            >
              {acc.label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          არსებობს <code className="font-mono">club1–10@demo.ge</code> და{' '}
          <code className="font-mono">player1–10@demo.ge</code> ანგარიშებიც.
        </p>
      </div>
    </div>
  );
}
