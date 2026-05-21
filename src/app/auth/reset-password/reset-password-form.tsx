'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordAction } from '@/lib/auth/actions-reset';

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | undefined>();
  const [pending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = React.useState(false);

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
      router.replace('/auth/signin?reset=1');
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="password">ახალი პაროლი</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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
        <p className="text-xs text-muted-foreground">მინიმუმ 8 სიმბოლო, ასო და ციფრი</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="passwordConfirm">გაიმეორე პაროლი</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          aria-invalid={Boolean(error)}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'შენახვა...' : 'პაროლის შენახვა'}
      </Button>
    </form>
  );
}
