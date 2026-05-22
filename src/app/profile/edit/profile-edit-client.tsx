'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { VerificationStatus } from '@/components/verification-badge';
import { updatePersonalInfo, updateSportInfo } from '@/lib/profile/actions';
import {
  COUNTRIES,
  DOMINANT_FOOT_LABELS,
  DOMINANT_FOOT_VALUES,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_VALUES,
  POSITION_LABELS,
  POSITION_VALUES,
} from '@/lib/onboarding/schemas';
import { cn } from '@/lib/utils';

type PersonalInfo = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  bio: string;
};

type SportInfo = {
  positions: string[];
  dominantFoot: string;
  height: string;
  weight: string;
  currentClub: string;
  jerseyNumber: string;
  experienceLevel: string;
  desiredLeague: string;
};

type ProfileEditClientProps = {
  currentPath: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    position?: string;
    verificationStatus?: VerificationStatus;
  };
  initialPersonalInfo: PersonalInfo;
  initialSportInfo: SportInfo;
};

export function ProfileEditClient({
  currentPath,
  user,
  initialPersonalInfo,
  initialSportInfo,
}: ProfileEditClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell role="footballer" currentPath={currentPath} user={user} onSignOut={handleSignOut}>
      <div className="max-w-2xl space-y-8">
        <h1 className="text-2xl font-semibold">პროფილის რედაქტირება</h1>

        <PersonalInfoSection initialData={initialPersonalInfo} />
        <SportInfoSection initialData={initialSportInfo} />
      </div>
    </AppShell>
  );
}

// ── Personal info section ─────────────────────────────────────────────────────

type SectionStatus = 'idle' | 'saving' | 'saved' | 'error';

function PersonalInfoSection({ initialData }: { initialData: PersonalInfo }) {
  const [form, setForm] = React.useState<PersonalInfo>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<SectionStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  function set(field: keyof PersonalInfo, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');
    setErrors({});

    const result = await updatePersonalInfo(form);

    if (result.status === 'success') {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.message);
      if (result.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.[0]) flat[k] = msgs[0];
        }
        setErrors(flat);
      }
    }
  }

  return (
    <section aria-labelledby="personal-info-heading">
      <div className="mb-4">
        <h2
          id="personal-info-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          პირადი ინფორმაცია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="სახელი ★" error={errors.firstName}>
            <Input
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="გიორგი"
              aria-invalid={Boolean(errors.firstName)}
            />
          </Field>

          <Field label="გვარი ★" error={errors.lastName}>
            <Input
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="მაგალითთი"
              aria-invalid={Boolean(errors.lastName)}
            />
          </Field>

          <Field label="დაბადების თარიღი ★" error={errors.dateOfBirth}>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
          </Field>

          <Field label="ეროვნება ★" error={errors.nationality}>
            <Select value={form.nationality} onValueChange={(v) => set('nationality', v)}>
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.nationality)}>
                <SelectValue placeholder="აირჩიე..." />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="ქალაქი ★" error={errors.city}>
            <Input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="თბილისი"
              aria-invalid={Boolean(errors.city)}
            />
          </Field>

          <Field label="ქვეყანა ★" error={errors.country}>
            <Select value={form.country} onValueChange={(v) => set('country', v)}>
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.country)}>
                <SelectValue placeholder="აირჩიე..." />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="ტელეფონი" error={errors.phone} className="sm:col-span-2">
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+995 5XX XXX XXX"
            />
          </Field>
        </div>

        <Field label={`ბიო (${form.bio.length}/500)`} error={errors.bio}>
          <Textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="მოკლე აღწერა შენს შესახებ..."
            maxLength={500}
            rows={4}
          />
        </Field>

        {errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          {status === 'saved' ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ შენახულია</p>
          ) : null}
          <Button
            onClick={handleSave}
            disabled={status === 'saving'}
            className={cn(status === 'error' && 'border-destructive')}
          >
            {status === 'saving' ? 'შენახვა...' : 'შენახვა'}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Sport info section ────────────────────────────────────────────────────────

function SportInfoSection({ initialData }: { initialData: SportInfo }) {
  const [form, setForm] = React.useState<SportInfo>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<SectionStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  function set(field: keyof SportInfo, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function togglePosition(pos: string) {
    const current = form.positions;
    if (current.includes(pos)) {
      set(
        'positions',
        current.filter((p) => p !== pos),
      );
    } else if (current.length < 2) {
      set('positions', [...current, pos]);
    }
  }

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');
    setErrors({});

    const result = await updateSportInfo({
      positions: form.positions,
      dominantFoot: form.dominantFoot,
      height: form.height,
      weight: form.weight,
      currentClub: form.currentClub || undefined,
      jerseyNumber: form.jerseyNumber || undefined,
      experienceLevel: form.experienceLevel || undefined,
      desiredLeague: form.desiredLeague || undefined,
    });

    if (result.status === 'success') {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.message);
      if (result.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.[0]) flat[k] = msgs[0];
        }
        setErrors(flat);
      }
    }
  }

  return (
    <section aria-labelledby="sport-info-heading">
      <div className="mb-4">
        <h2
          id="sport-info-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          სპორტული ინფორმაცია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-1.5">
          <Label>
            პოზიცია ★ <span className="text-muted-foreground font-normal text-xs">(მაქს. 2)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {POSITION_VALUES.map((pos) => {
              const selected = form.positions.includes(pos);
              const disabled = !selected && form.positions.length >= 2;
              return (
                <button
                  key={pos}
                  type="button"
                  title={POSITION_LABELS[pos]}
                  onClick={() => !disabled && togglePosition(pos)}
                  aria-pressed={selected}
                  disabled={disabled}
                  className={cn(
                    'h-9 w-12 rounded border text-xs font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:border-muted-foreground/40 disabled:opacity-40',
                  )}
                >
                  {pos}
                </button>
              );
            })}
          </div>
          {errors.positions ? <p className="text-sm text-destructive">{errors.positions}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label>ძირითადი ფეხი ★</Label>
          <div className="flex gap-3">
            {DOMINANT_FOOT_VALUES.map((foot) => (
              <button
                key={foot}
                type="button"
                onClick={() => set('dominantFoot', foot)}
                aria-pressed={form.dominantFoot === foot}
                className={cn(
                  'flex-1 h-9 rounded border text-sm font-medium transition-colors',
                  form.dominantFoot === foot
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-input hover:border-muted-foreground/40',
                )}
              >
                {DOMINANT_FOOT_LABELS[foot]}
              </button>
            ))}
          </div>
          {errors.dominantFoot ? (
            <p className="text-sm text-destructive">{errors.dominantFoot}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="სიმაღლე (სმ) ★" error={errors.height}>
            <Input
              type="number"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              placeholder="175"
              min={100}
              max={250}
              aria-invalid={Boolean(errors.height)}
            />
          </Field>

          <Field label="წონა (კგ) ★" error={errors.weight}>
            <Input
              type="number"
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              placeholder="70"
              min={30}
              max={200}
              aria-invalid={Boolean(errors.weight)}
            />
          </Field>

          <Field label="ამჟ. კლუბი" error={errors.currentClub}>
            <Input
              value={form.currentClub}
              onChange={(e) => set('currentClub', e.target.value)}
              placeholder="FC Dinamo"
            />
          </Field>

          <Field label="მაისურის ნომ." error={errors.jerseyNumber}>
            <Input
              type="number"
              value={form.jerseyNumber}
              onChange={(e) => set('jerseyNumber', e.target.value)}
              placeholder="10"
              min={1}
              max={99}
            />
          </Field>
        </div>

        <Field label="გამოცდილება" error={errors.experienceLevel}>
          <Select value={form.experienceLevel} onValueChange={(v) => set('experienceLevel', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="აირჩიე..." />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVEL_VALUES.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {EXPERIENCE_LEVEL_LABELS[lvl]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="სასურ. ლიგა / სეზონი" error={errors.desiredLeague}>
          <Input
            value={form.desiredLeague}
            onChange={(e) => set('desiredLeague', e.target.value)}
            placeholder="Georgian Erovnuli Liga"
          />
        </Field>

        {errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          {status === 'saved' ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ შენახულია</p>
          ) : null}
          <Button
            onClick={handleSave}
            disabled={status === 'saving'}
            className={cn(status === 'error' && 'border-destructive')}
          >
            {status === 'saving' ? 'შენახვა...' : 'შენახვა'}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Shared field wrapper ──────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
