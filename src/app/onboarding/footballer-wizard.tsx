'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon } from 'lucide-react';

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
import { saveFootballerProfile } from '@/lib/onboarding/actions';
import {
  COUNTRIES,
  DOMINANT_FOOT_LABELS,
  DOMINANT_FOOT_VALUES,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_VALUES,
  POSITION_LABELS,
  POSITION_VALUES,
  footballerStep1Schema,
  footballerStep2Schema,
} from '@/lib/onboarding/schemas';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 4;

const STEP_LABELS = ['პირადი ინფ.', 'სპ. ინფ.', 'მედია', 'გადახედვა'];

type FormData = {
  // Step 1
  dateOfBirth: string;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  bio: string;
  // Step 2
  positions: string[];
  dominantFoot: string;
  height: string;
  weight: string;
  currentClub: string;
  jerseyNumber: string;
  experienceLevel: string;
  desiredLeague: string;
};

const EMPTY_FORM: FormData = {
  dateOfBirth: '',
  nationality: '',
  city: '',
  country: '',
  phone: '',
  bio: '',
  positions: [],
  dominantFoot: '',
  height: '',
  weight: '',
  currentClub: '',
  jerseyNumber: '',
  experienceLevel: '',
  desiredLeague: '',
};

export function FootballerWizard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  function set(field: keyof FormData, value: string | string[]) {
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

  function validateStep1(): boolean {
    const result = footballerStep1Schema.safeParse({
      dateOfBirth: form.dateOfBirth,
      nationality: form.nationality,
      city: form.city,
      country: form.country,
      phone: form.phone,
      bio: form.bio,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    const result = footballerStep2Schema.safeParse({
      positions: form.positions,
      dominantFoot: form.dominantFoot,
      height: form.height,
      weight: form.weight,
      currentClub: form.currentClub,
      jerseyNumber: form.jerseyNumber,
      experienceLevel: form.experienceLevel || undefined,
      desiredLeague: form.desiredLeague,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return false;
    }
    return true;
  }

  function goNext() {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await saveFootballerProfile({
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
        city: form.city,
        country: form.country,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        positions: form.positions as (typeof POSITION_VALUES)[number][],
        dominantFoot: form.dominantFoot as (typeof DOMINANT_FOOT_VALUES)[number],
        height: Number(form.height),
        weight: Number(form.weight),
        currentClub: form.currentClub || undefined,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
        experienceLevel:
          (form.experienceLevel as (typeof EXPERIENCE_LEVEL_VALUES)[number]) || undefined,
        desiredLeague: form.desiredLeague || undefined,
      });
      if (result.status === 'success') {
        router.replace('/dashboard/footballer');
        router.refresh();
      } else if (result.status === 'error') {
        setSubmitError(result.message);
      }
    } catch {
      setSubmitError('შეცდომა მოხდა. სცადე თავიდან.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">შექმენი შენი ფეხბურთელის პროფილი</h1>
        {displayName && <p className="text-sm text-muted-foreground">{displayName}</p>}
      </div>

      <Stepper current={step} steps={STEP_LABELS} />

      <div className="rounded-lg border bg-card p-6 space-y-5">
        {step === 1 && <Step1 form={form} errors={errors} onChange={set} />}
        {step === 2 && (
          <Step2 form={form} errors={errors} onChange={set} onTogglePosition={togglePosition} />
        )}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 form={form} displayName={displayName} />}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={goBack} disabled={step === 1 || submitting}>
          ← უკან
        </Button>
        {step < TOTAL_STEPS ? (
          <Button onClick={goNext}>გაგრძელება →</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'შენახვა...' : 'პროფ. გაქტივება'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Progress stepper ────────────────────────────────────────────────────────

function Stepper({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className={cn(
                  'size-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                  done && 'bg-primary text-primary-foreground',
                  active && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? '✓' : num}
              </div>
              <span
                className={cn(
                  'text-xs text-center hidden sm:block',
                  active ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('h-px flex-1 mx-1 mb-4', done ? 'bg-primary' : 'bg-border')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Personal info ───────────────────────────────────────────────────

function Step1({
  form,
  errors,
  onChange,
}: {
  form: FormData;
  errors: Record<string, string>;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <>
      <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        პირადი ინფორმაცია
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="დაბადების თარიღი ★" error={errors.dateOfBirth}>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            aria-invalid={Boolean(errors.dateOfBirth)}
          />
        </Field>

        <Field label="ეროვნება ★" error={errors.nationality}>
          <Select value={form.nationality} onValueChange={(v) => onChange('nationality', v)}>
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
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="თბილისი"
            aria-invalid={Boolean(errors.city)}
          />
        </Field>

        <Field label="ქვეყანა ★" error={errors.country}>
          <Select value={form.country} onValueChange={(v) => onChange('country', v)}>
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
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+995 5XX XXX XXX"
          />
        </Field>
      </div>

      <Field label={`ბიო (${form.bio.length}/500)`} error={errors.bio}>
        <Textarea
          value={form.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="მოკლე აღწერა შენს შესახებ..."
          maxLength={500}
          rows={3}
        />
      </Field>
    </>
  );
}

// ── Step 2: Sport info ──────────────────────────────────────────────────────

function Step2({
  form,
  errors,
  onChange,
  onTogglePosition,
}: {
  form: FormData;
  errors: Record<string, string>;
  onChange: (field: keyof FormData, value: string | string[]) => void;
  onTogglePosition: (pos: string) => void;
}) {
  return (
    <>
      <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        სპორტული ინფორმაცია
      </h2>

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
                onClick={() => !disabled && onTogglePosition(pos)}
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
        {errors.positions && <p className="text-sm text-destructive">{errors.positions}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>ძირითადი ფეხი ★</Label>
        <div className="flex gap-3">
          {DOMINANT_FOOT_VALUES.map((foot) => (
            <button
              key={foot}
              type="button"
              onClick={() => onChange('dominantFoot', foot)}
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
        {errors.dominantFoot && <p className="text-sm text-destructive">{errors.dominantFoot}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="სიმაღლე (სმ) ★" error={errors.height}>
          <Input
            type="number"
            value={form.height}
            onChange={(e) => onChange('height', e.target.value)}
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
            onChange={(e) => onChange('weight', e.target.value)}
            placeholder="70"
            min={30}
            max={200}
            aria-invalid={Boolean(errors.weight)}
          />
        </Field>

        <Field label="ამჟ. კლუბი" error={errors.currentClub}>
          <Input
            value={form.currentClub}
            onChange={(e) => onChange('currentClub', e.target.value)}
            placeholder="FC Dinamo"
          />
        </Field>

        <Field label="მაისურის ნომ." error={errors.jerseyNumber}>
          <Input
            type="number"
            value={form.jerseyNumber}
            onChange={(e) => onChange('jerseyNumber', e.target.value)}
            placeholder="10"
            min={1}
            max={99}
          />
        </Field>
      </div>

      <Field label="გამოცდილება" error={errors.experienceLevel}>
        <Select value={form.experienceLevel} onValueChange={(v) => onChange('experienceLevel', v)}>
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
          onChange={(e) => onChange('desiredLeague', e.target.value)}
          placeholder="Georgian Erovnuli Liga"
        />
      </Field>
    </>
  );
}

// ── Step 3: Media ────────────────────────────────────────────────────────────

function Step3() {
  return (
    <div className="py-8 flex flex-col items-center gap-4 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center">
        <ImageIcon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-medium">ფოტო და ვიდეო</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          ფოტო გალერეა და ვიდეო ლინკები შეგიძლია დაამატო პროფილის რედაქტირების გვერდიდან პროფილის
          შექმნის შემდეგ.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">განაგრძე &rarr; გადახედვისთვის</p>
    </div>
  );
}

// ── Step 4: Review & submit ─────────────────────────────────────────────────

function Step4({ form, displayName }: { form: FormData; displayName: string }) {
  return (
    <div className="space-y-4">
      <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        პროფილის გადახედვა
      </h2>

      <div className="space-y-1">
        <p className="font-medium">{displayName || '—'}</p>
        <p className="text-sm text-muted-foreground">
          {form.positions.join(', ') || '—'} · {form.height ? `${form.height} სმ` : '—'} ·{' '}
          {form.weight ? `${form.weight} კგ` : '—'}
        </p>
        <p className="text-sm text-muted-foreground">
          {form.city || '—'}, {form.country || '—'}
        </p>
      </div>

      {form.bio && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">ბიო</p>
          <p className="text-sm">{form.bio}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">სპ. ინფო.</p>
        <p className="text-sm">
          პოზ.: {form.positions.join(', ') || '—'} · ფეხი:{' '}
          {DOMINANT_FOOT_LABELS[form.dominantFoot] ?? '—'} ·{' '}
          {form.experienceLevel ? EXPERIENCE_LEVEL_LABELS[form.experienceLevel] : '—'}
        </p>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        შენი პროფილი გადახედვას დაექვემდებარება. ადმინი დაადასტურებს 24-48 სთ-ში.
      </div>
    </div>
  );
}

// ── Shared field wrapper ────────────────────────────────────────────────────

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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
