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

export function SigninForm() {
  const router = useRouter();
  const [state, setState] = React.useState<SigninActionState>(initialState);
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (state.status === 'success') {
      router.replace('/');
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

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">ელ. ფოსტა</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
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
  );
}
