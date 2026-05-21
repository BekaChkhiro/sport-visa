'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signupAction, type SignupActionState } from '@/lib/auth/actions';
import type { SignupRole } from '@/lib/auth/schemas';
import { cn } from '@/lib/utils';

const initialState: SignupActionState = { status: 'idle' };

export function SignupForm({ initialRole }: { initialRole: SignupRole }) {
  const router = useRouter();
  const [role, setRole] = React.useState<SignupRole>(initialRole);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [state, setState] = React.useState<SignupActionState>(initialState);
  const [pending, startTransition] = React.useTransition();

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

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">როლი</legend>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            label="ფეხბურთელი"
            value="FOOTBALLER"
            selected={role === 'FOOTBALLER'}
            onSelect={() => setRole('FOOTBALLER')}
          />
          <RoleCard
            label="კლუბი"
            value="CLUB"
            selected={role === 'CLUB'}
            onSelect={() => setRole('CLUB')}
          />
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="სახელი" name="firstName" error={fieldErrors?.firstName?.[0]}>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            aria-invalid={Boolean(fieldErrors?.firstName)}
          />
        </Field>
        <Field label="გვარი" name="lastName" error={fieldErrors?.lastName?.[0]}>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            aria-invalid={Boolean(fieldErrors?.lastName)}
          />
        </Field>
      </div>

      <Field label="ელ. ფოსტა" name="email" error={fieldErrors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldErrors?.email)}
        />
      </Field>

      <Field label="პაროლი" name="password" error={fieldErrors?.password?.[0]}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          visible={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          aria-invalid={Boolean(fieldErrors?.password)}
        />
      </Field>

      <Field
        label="გაიმეორე პაროლი"
        name="passwordConfirm"
        error={fieldErrors?.passwordConfirm?.[0]}
      >
        <PasswordInput
          id="passwordConfirm"
          name="passwordConfirm"
          autoComplete="new-password"
          visible={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          aria-invalid={Boolean(fieldErrors?.passwordConfirm)}
        />
      </Field>

      <div className="flex items-start gap-2">
        <Checkbox id="acceptTerms" name="acceptTerms" required />
        <Label htmlFor="acceptTerms" className="text-sm leading-snug">
          ვეთანხმები{' '}
          <Link
            href="/terms"
            target="_blank"
            className="text-primary underline-offset-4 hover:underline"
          >
            წესებსა და პირობებს
          </Link>
        </Label>
      </div>
      {fieldErrors?.acceptTerms?.[0] ? (
        <p className="-mt-3 text-sm text-destructive">{fieldErrors.acceptTerms[0]}</p>
      ) : null}

      {generalError ? (
        <p role="alert" className="text-sm text-destructive">
          {generalError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
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

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function RoleCard({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: SignupRole;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-value={value}
      className={cn(
        'rounded-lg border p-4 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-input hover:border-muted-foreground/40',
      )}
    >
      {label}
    </button>
  );
}

function PasswordInput({
  visible,
  onToggle,
  ...props
}: React.ComponentProps<typeof Input> & { visible: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} {...props} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
        className="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
