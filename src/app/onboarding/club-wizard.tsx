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
import { saveClubProfile } from '@/lib/onboarding/actions';
import { COUNTRIES, clubOnboardingSchema } from '@/lib/onboarding/schemas';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 3;
const STEP_LABELS = ['ვინაობა', 'მედია', 'გადახედვა'];

type FormData = {
  name: string;
  foundedYear: string;
  country: string;
  city: string;
  league: string;
  stadiumName: string;
  stadiumCapacity: string;
  officialWebsite: string;
  bio: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  foundedYear: '',
  country: '',
  city: '',
  league: '',
  stadiumName: '',
  stadiumCapacity: '',
  officialWebsite: '',
  bio: '',
};

export function ClubWizard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validateStep1(): boolean {
    const result = clubOnboardingSchema.safeParse({
      name: form.name,
      foundedYear: form.foundedYear,
      country: form.country,
      city: form.city,
      league: form.league,
      stadiumName: form.stadiumName,
      stadiumCapacity: form.stadiumCapacity,
      officialWebsite: form.officialWebsite,
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

  function goNext() {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
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
      const result = await saveClubProfile({
        name: form.name,
        foundedYear: form.foundedYear || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        league: form.league || undefined,
        stadiumName: form.stadiumName || undefined,
        stadiumCapacity: form.stadiumCapacity || undefined,
        officialWebsite: form.officialWebsite || undefined,
        bio: form.bio || undefined,
      });
      if (result.status === 'success') {
        router.replace('/dashboard/club');
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
        <h1 className="text-xl font-semibold">შექმენი შენი კლუბის პროფილი</h1>
        {displayName && <p className="text-sm text-muted-foreground">{displayName}</p>}
      </div>

      <Stepper current={step} steps={STEP_LABELS} />

      <div className="rounded-lg border bg-card p-6 space-y-5">
        {step === 1 && <Step1 form={form} errors={errors} onChange={set} />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 form={form} />}
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
            {submitting ? 'შენახვა...' : 'კლუბის გააქტ.'}
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

// ── Step 1: Club identity ───────────────────────────────────────────────────

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
        კლუბის ვინაობა
      </h2>

      <Field label="კლუბის სახელი ★" error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="FC Dinamo Tbilisi"
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="დაარსების წელი" error={errors.foundedYear}>
          <Input
            type="number"
            value={form.foundedYear}
            onChange={(e) => onChange('foundedYear', e.target.value)}
            placeholder="1925"
            min={1850}
            max={2030}
          />
        </Field>

        <Field label="ქვეყანა" error={errors.country}>
          <Select value={form.country} onValueChange={(v) => onChange('country', v)}>
            <SelectTrigger className="w-full">
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

        <Field label="ქალაქი" error={errors.city}>
          <Input
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="თბილისი"
          />
        </Field>

        <Field label="ლიგა / დივიზიონი" error={errors.league}>
          <Input
            value={form.league}
            onChange={(e) => onChange('league', e.target.value)}
            placeholder="Erovnuli Liga"
          />
        </Field>

        <Field label="სტადიონი" error={errors.stadiumName}>
          <Input
            value={form.stadiumName}
            onChange={(e) => onChange('stadiumName', e.target.value)}
            placeholder="Mikheil Meskhi"
          />
        </Field>

        <Field label="სტადიონის ტევადობა" error={errors.stadiumCapacity}>
          <Input
            type="number"
            value={form.stadiumCapacity}
            onChange={(e) => onChange('stadiumCapacity', e.target.value)}
            placeholder="24000"
            min={0}
          />
        </Field>

        <Field label="ოფიციალური ვებგვ." error={errors.officialWebsite} className="sm:col-span-2">
          <Input
            type="url"
            value={form.officialWebsite}
            onChange={(e) => onChange('officialWebsite', e.target.value)}
            placeholder="https://example.ge"
          />
        </Field>
      </div>

      <Field label={`კლუბის აღწერა (${form.bio.length}/1000)`} error={errors.bio}>
        <Textarea
          value={form.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="კლუბის ისტორია, მიზნები..."
          maxLength={1000}
          rows={4}
        />
      </Field>
    </>
  );
}

// ── Step 2: Media placeholder ───────────────────────────────────────────────

function Step2() {
  return (
    <div className="py-8 flex flex-col items-center gap-4 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center">
        <ImageIcon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-medium">ლოგო და ფოტო</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          კლუბის ლოგო და სტადიონის ფოტო შეგიძლია ატვირთო პროფილის რედაქტირების გვერდიდან პროფილის
          შექმნის შემდეგ.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">განაგრძე &rarr; გადახედვისთვის</p>
    </div>
  );
}

// ── Step 3: Review & submit ─────────────────────────────────────────────────

function Step3({ form }: { form: FormData }) {
  return (
    <div className="space-y-4">
      <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        გადახედვა
      </h2>

      <div className="space-y-1">
        <p className="font-medium">{form.name || '—'}</p>
        <p className="text-sm text-muted-foreground">
          {[form.city, form.league, form.foundedYear].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>

      {form.bio && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">აღწერა</p>
          <p className="text-sm line-clamp-3">{form.bio}</p>
        </div>
      )}

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        ადმინი განიხილავს კლუბს. დოკ. (სარეგ. ან წერ.) გამოგვიგზავნე{' '}
        <strong>admin@sportvisa.ge</strong>-ზე.
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
