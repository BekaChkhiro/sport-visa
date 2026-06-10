'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

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

const ICheck = <path d="m20 6-11 11-5-5" />;
const IArrow = <path d="M5 12h14M13 6l6 6-6 6" />;
const IBack = <path d="M19 12H5M11 6l-6 6 6 6" />;
const ICamera = (
  <>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </>
);
const IUpload = (
  <>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </>
);
const IUser = (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </>
);
const IFoot = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.2l3.1 2.3-1.2 3.7H9.1L7.9 9.5z" />
    <path d="M12 7.2V3M15.1 9.5l3.4-1.1M13.9 13.2l2.1 3.1M10.1 13.2l-2.1 3.1M8.9 9.5L5.5 8.4" />
  </>
);
const IShield = (
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

/* ── Position color map ── */
const POS_FAMILY: Record<string, string> = {
  GK: 'flame',
  CB: 'accent',
  LB: 'accent',
  RB: 'accent',
  DM: 'iris',
  CM: 'iris',
  AM: 'iris',
  LW: 'brand',
  RW: 'brand',
  CF: 'brand',
  ST: 'brand',
};
const TONE_ON: Record<string, string> = {
  flame: 'border-flame-400 bg-flame-400/15 text-flame-300',
  accent: 'border-accent-400 bg-accent-400/15 text-accent-300',
  iris: 'border-iris-400 bg-iris-400/15 text-iris-300',
  brand: 'border-brand-400 bg-brand-400/15 text-brand-300',
};

const TOTAL_STEPS = 4;
const STEP_LABELS = ['პირადი ინფ.', 'სპ. ინფ.', 'მედია', 'გადახედვა'];
const STEP_ICONS = [IUser, IFoot, ICamera, ICheck];

type FormData = {
  dateOfBirth: string;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  bio: string;
  positions: string[];
  dominantFoot: string;
  height: string;
  weight: string;
  currentClub: string;
  jerseyNumber: string;
  experienceLevel: string;
  desiredLeague: string;
  avatarKey: string;
  avatarUrl: string;
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
  avatarKey: '',
  avatarUrl: '',
};

const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* ── Label primitive ── */
function Lbl({ children, req, hint }: { children: React.ReactNode; req?: boolean; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-300">
      {children}
      {req && <span className="text-brand-400">*</span>}
      {hint && <span className="ml-auto text-[11px] font-normal text-ink-600">{hint}</span>}
    </span>
  );
}

/* ── Field wrapper ── */
function Field({
  label,
  error,
  children,
  className,
  req,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  req?: boolean;
  hint?: string;
}) {
  return (
    <div className={cn('space-y-0', className)}>
      <Label className="mb-0">
        <Lbl req={req} hint={hint}>
          {label}
        </Lbl>
      </Label>
      {children}
      {error && <p className="mt-1 text-[12px] text-danger-300">{error}</p>}
    </div>
  );
}

/* ── Stepper ── */
function Stepper({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="mb-6 flex items-center">
      {labels.map((label, i) => {
        const num = i + 1;
        const state = num < current ? 'done' : num === current ? 'active' : 'todo';
        const icon = STEP_ICONS[i];
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold transition-colors',
                  state === 'done' && 'border-brand-400 bg-brand-400 text-ink-950',
                  state === 'active' && 'border-brand-400 bg-brand-400/10 text-brand-300',
                  state === 'todo' && 'border-ink-700 bg-ink-950 text-ink-500',
                )}
              >
                {state === 'done' ? (
                  <Ico d={ICheck} size={16} stroke={2.5} />
                ) : (
                  <Ico d={icon} size={16} />
                )}
              </span>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-600">
                  ნაბიჯი {num}
                </p>
                <p
                  className={cn(
                    'text-[13px] font-semibold',
                    state === 'todo' ? 'text-ink-500' : 'text-ink-100',
                  )}
                >
                  {label}
                </p>
              </div>
            </div>
            {i < total - 1 && (
              <div
                className={cn('mx-3 h-px flex-1', num < current ? 'bg-brand-400/50' : 'bg-ink-800')}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function FootballerWizard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [done, setDone] = React.useState(false);
  const progress = ((step - 1) / TOTAL_STEPS) * 100;

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
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
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
        avatarKey: form.avatarKey || undefined,
      });
      if (result.status === 'success') {
        setDone(true);
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
    <div className="relative font-sans">
      {/* Header */}
      <header className="relative border-b border-ink-800 bg-ink-900/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-7">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-brand-400 shadow-card">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" focusable="false">
                <circle cx="12" cy="12" r="9" stroke="#1f2a0b" strokeWidth="1.6" />
                <path d="M12 7.5l2.6 1.9-1 3h-3.2l-1-3z" fill="#1f2a0b" />
                <path
                  d="M12 7.5V4M14.6 9.4l3-1M13.6 12.4l1.8 2.6M10.4 12.4l-1.8 2.6M9.4 9.4l-3-1"
                  stroke="#1f2a0b"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="font-display text-[18px] font-bold tracking-tight text-ink-50">
              Sport<span className="text-brand-400"> Visa</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.replace('/auth/signin')}
            className="text-[13px] font-medium text-ink-400 transition-colors hover:text-ink-200"
          >
            გასვლა
          </button>
        </div>
        {/* Progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-ink-800">
          <div
            className="h-full bg-brand-400 transition-all duration-500"
            style={{ width: `${done ? 100 : progress}%` }}
          />
        </div>
      </header>

      <div className="relative mx-auto max-w-[760px] px-5 py-10 sm:px-7">
        {done ? (
          /* Success screen */
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-pop">
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-brand-400/15 via-ink-900 to-ink-900">
              <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-brand-400/15 blur-2xl" />
            </div>
            <div className="px-7 pb-9 text-center">
              <span className="mx-auto -mt-12 flex h-20 w-20 items-center justify-center rounded-full bg-brand-400 text-ink-950 shadow-float ring-8 ring-ink-900">
                <Ico d={ICheck} size={38} stroke={2.5} />
              </span>
              <h2 className="mt-5 font-display text-[24px] font-bold tracking-tight text-ink-50">
                პროფილი შეიქმნა!
              </h2>
              <p className="mx-auto mt-2 max-w-[40ch] text-[13.5px] leading-relaxed text-ink-400">
                შენი პროფილი გადაეგზავნა Sport Visa-ს ადმინს დასადასტურებლად. ვერიფიკაციის შემდეგ
                კლუბები შეძლებენ შენს პოვნას დირექტორიაში.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-pill border border-warning-400/30 bg-warning-400/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-warning-300">
                <span className="h-1.5 w-1.5 rounded-full bg-warning-400" />
                ელოდება ვერიფიკაციას
              </div>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    router.replace('/dashboard/footballer');
                    router.refresh();
                  }}
                >
                  დაშბორდზე გადასვლა <Ico d={IArrow} size={17} stroke={2.5} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Intro */}
            <div className="mb-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-400">
                დაგვრჩა ერთი ნაბიჯი
              </p>
              <h1 className="mt-1.5 font-display text-[28px] font-bold tracking-tight text-ink-50">
                დავასრულოთ პროფილი
              </h1>
              {displayName && (
                <p className="mt-1.5 text-[13.5px] text-ink-400">
                  შეავსე ძირითადი მონაცემები, {displayName}.
                </p>
              )}
            </div>

            <Stepper current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

            <div className="rounded-card border border-ink-800 bg-ink-900 p-6 shadow-card sm:p-7">
              {step === 1 && <Step1 form={form} errors={errors} onChange={set} />}
              {step === 2 && (
                <Step2
                  form={form}
                  errors={errors}
                  onChange={set}
                  onTogglePosition={togglePosition}
                />
              )}
              {step === 3 && <Step3 form={form} onChange={set} />}
              {step === 4 && <Step4 form={form} displayName={displayName} />}
            </div>

            {submitError && (
              <p role="alert" className="mt-3 text-[13px] text-danger-300">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={step === 1 || submitting}
                className={step === 1 ? 'invisible' : ''}
              >
                <Ico d={IBack} size={16} />
                უკან
              </Button>
              <div className="flex items-center gap-3">
                {step === TOTAL_STEPS && (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="text-[13px] font-medium text-ink-400 transition-colors hover:text-ink-200"
                  >
                    გამოტოვება
                  </button>
                )}
                <Button size="lg" onClick={goNext} disabled={submitting}>
                  {step === TOTAL_STEPS ? (
                    <>
                      {submitting ? (
                        'შენახვა…'
                      ) : (
                        <>
                          დასრულება <Ico d={ICheck} size={17} stroke={2.5} />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      გაგრძელება <Ico d={IArrow} size={17} stroke={2.5} />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="mt-5 text-center text-[12px] text-ink-500">
              <Ico d={IShield} size={13} className="mr-1 inline text-ink-600" />
              მონაცემები ინახება ავტომატურად — შეგიძლია მოგვიანებით დაუბრუნდე.
            </p>
          </>
        )}
      </div>
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
    <div className="space-y-5">
      <h2 className="font-display text-[17px] font-bold text-ink-50">პერსონალური მონაცემები</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="დაბადების თარიღი" req error={errors.dateOfBirth}>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            aria-invalid={Boolean(errors.dateOfBirth)}
          />
        </Field>

        <Field label="ქალაქი" req error={errors.city}>
          <Input
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="თბილისი"
            aria-invalid={Boolean(errors.city)}
          />
        </Field>

        <Field label="ეროვნება" req error={errors.nationality}>
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

        <Field label="საცხოვრებელი ქვეყანა" req error={errors.country}>
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

        <Field
          label="ტელეფონი"
          error={errors.phone}
          hint="არასავალდებულო"
          className="sm:col-span-2"
        >
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+995 5XX XXX XXX"
          />
        </Field>

        <Field
          label={`ბიო (${form.bio.length}/500)`}
          error={errors.bio}
          hint="არასავალდებულო"
          className="sm:col-span-2"
        >
          <Textarea
            value={form.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            placeholder="მოკლე აღწერა შენს შესახებ..."
            maxLength={500}
            rows={3}
          />
        </Field>
      </div>
    </div>
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
    <div className="space-y-6">
      <h2 className="font-display text-[17px] font-bold text-ink-50">სპორტული მონაცემები</h2>

      {/* Positions */}
      <div>
        <div className="mb-1.5">
          <Lbl req hint={`${form.positions.length}/2`}>
            პოზიცია
          </Lbl>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POSITION_VALUES.map((pos) => {
            const on = form.positions.includes(pos);
            const dim = !on && form.positions.length >= 2;
            const family = POS_FAMILY[pos] ?? 'brand';
            return (
              <button
                key={pos}
                type="button"
                title={POSITION_LABELS[pos]}
                onClick={() => !dim && onTogglePosition(pos)}
                aria-pressed={on}
                disabled={dim}
                className={cn(
                  'rounded-[8px] border px-2.5 py-1.5 text-[12px] font-bold transition-colors',
                  on
                    ? TONE_ON[family]
                    : `border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200 ${dim ? 'opacity-40' : ''}`,
                )}
              >
                {pos} <span className="font-normal opacity-70">{POSITION_LABELS[pos]}</span>
              </button>
            );
          })}
        </div>
        {errors.positions && <p className="mt-1 text-[12px] text-danger-300">{errors.positions}</p>}
      </div>

      {/* Dominant foot */}
      <div>
        <div className="mb-1.5">
          <Lbl req>დომინანტური ფეხი</Lbl>
        </div>
        <div className="flex gap-1.5">
          {DOMINANT_FOOT_VALUES.map((foot) => (
            <button
              key={foot}
              type="button"
              onClick={() => onChange('dominantFoot', foot)}
              aria-pressed={form.dominantFoot === foot}
              className={cn(
                'flex-1 rounded-btn border px-2 py-2 text-[12.5px] font-medium transition-colors',
                form.dominantFoot === foot
                  ? 'border-brand-400/60 bg-brand-400/10 text-brand-300'
                  : 'border-ink-700 text-ink-300 hover:border-ink-600',
              )}
            >
              {DOMINANT_FOOT_LABELS[foot]}
            </button>
          ))}
        </div>
        {errors.dominantFoot && (
          <p className="mt-1 text-[12px] text-danger-300">{errors.dominantFoot}</p>
        )}
      </div>

      {/* Height & weight */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="სიმაღლე (სმ)" req error={errors.height}>
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

        <Field label="წონა (კგ)" req error={errors.weight}>
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

        <Field label="მიმდინარე კლუბი" error={errors.currentClub} hint="არასავალდებულო">
          <Input
            value={form.currentClub}
            onChange={(e) => onChange('currentClub', e.target.value)}
            placeholder="დინამო აკადემია"
          />
        </Field>

        <Field label="მაისურის ნომერი" error={errors.jerseyNumber} hint="არასავალდებულო">
          <Input
            type="number"
            value={form.jerseyNumber}
            onChange={(e) => onChange('jerseyNumber', e.target.value)}
            placeholder="9"
            min={1}
            max={99}
          />
        </Field>

        <Field label="გამოცდილება" error={errors.experienceLevel} hint="არასავალდებულო">
          <Select
            value={form.experienceLevel}
            onValueChange={(v) => onChange('experienceLevel', v)}
          >
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

        <Field label="სასურ. ლიგა / სეზონი" error={errors.desiredLeague} hint="არასავალდებულო">
          <Input
            value={form.desiredLeague}
            onChange={(e) => onChange('desiredLeague', e.target.value)}
            placeholder="Georgian Erovnuli Liga"
          />
        </Field>
      </div>
    </div>
  );
}

// ── Step 3: Media ────────────────────────────────────────────────────────────

function Step3({
  form,
  onChange,
}: {
  form: FormData;
  onChange: (field: keyof FormData, value: string | string[]) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      setUploadError('ნებადართულია მხოლოდ JPEG, PNG ან WEBP');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setUploadError(`ფაილი ძალიან დიდია (მაქს. ${AVATAR_MAX_BYTES / 1024 / 1024} MB)`);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'AVATAR', contentType: file.type, contentLength: file.size }),
      });
      if (!presignRes.ok) throw new Error('Presign failed');
      const { uploadUrl, key, requiredHeaders } = (await presignRes.json()) as {
        uploadUrl: string;
        key: string;
        requiredHeaders: Record<string, string>;
      };

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: requiredHeaders,
        body: file,
      });
      if (!putRes.ok) throw new Error('Upload failed');

      const previewUrl = URL.createObjectURL(file);
      onChange('avatarKey', key);
      onChange('avatarUrl', previewUrl);
    } catch {
      setUploadError('ატვირთვა ვერ მოხერხდა. სცადე თავიდან.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    if (form.avatarUrl) URL.revokeObjectURL(form.avatarUrl);
    onChange('avatarKey', '');
    onChange('avatarUrl', '');
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[17px] font-bold text-ink-50">პროფილის ფოტო</h2>
        <p className="mt-1 text-[13px] text-ink-400">
          ატვირთე მკაფიო პორტრეტი — ან გამოტოვე და მოგვიანებით დაამატე რედაქტირებიდან.
        </p>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'group flex w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed py-12 transition-colors',
          form.avatarKey
            ? 'border-brand-400/50 bg-brand-400/5'
            : 'border-ink-700 hover:border-ink-600 hover:bg-ink-800/30',
        )}
      >
        {form.avatarUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.avatarUrl}
              alt="ავატარი"
              className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-400/30"
            />
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-300">
              <Ico d={ICheck} size={15} stroke={2.5} />
              ფოტო აიტვირთა · შეცვლა
            </span>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-800 text-ink-400 transition-colors group-hover:text-ink-200">
              <Ico d={IUpload} size={24} />
            </span>
            <span className="text-[13.5px] font-semibold text-ink-200">
              {uploading ? 'იტვირთება…' : 'ჩააგდე ან აირჩიე ფაილი'}
            </span>
            <span className="text-[11.5px] text-ink-500">JPG, PNG ან WEBP · მაქს. 10MB</span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />

      {form.avatarKey && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="text-[13px] font-medium text-ink-400 hover:text-danger-300"
          >
            ფოტოს წაშლა
          </button>
        </div>
      )}

      {uploadError && (
        <p role="alert" className="text-[12px] text-danger-300">
          {uploadError}
        </p>
      )}

      <div className="flex items-start gap-2.5 rounded-card border border-ink-800 bg-ink-950/50 px-4 py-3 text-[12px] text-ink-400">
        <Ico d={IShield} size={15} className="mt-0.5 shrink-0 text-ink-500" />
        პროფილის ფოტო არასავალდებულოა, თუმცა ფოტოიანი პროფილი 3-ჯერ მეტ ნახვას იღებს სკაუტებისგან.
      </div>
    </div>
  );
}

// ── Step 4: Review & submit ─────────────────────────────────────────────────

function Step4({ form, displayName }: { form: FormData; displayName: string }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-[17px] font-bold text-ink-50">პროფილის გადახედვა</h2>

      <div className="space-y-1">
        <p className="font-medium text-ink-100">{displayName || '—'}</p>
        <p className="text-[13px] text-ink-400">
          {form.positions.join(', ') || '—'} · {form.height ? `${form.height} სმ` : '—'} ·{' '}
          {form.weight ? `${form.weight} კგ` : '—'}
        </p>
        <p className="text-[13px] text-ink-400">
          {form.city || '—'}, {form.country || '—'}
        </p>
      </div>

      {form.bio && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 mb-1">ბიო</p>
          <p className="text-[13px] text-ink-200">{form.bio}</p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 mb-1">
          სპ. ინფო.
        </p>
        <p className="text-[13px] text-ink-200">
          პოზ.: {form.positions.join(', ') || '—'} · ფეხი:{' '}
          {DOMINANT_FOOT_LABELS[form.dominantFoot] ?? '—'} ·{' '}
          {form.experienceLevel ? EXPERIENCE_LEVEL_LABELS[form.experienceLevel] : '—'}
        </p>
      </div>

      <div className="rounded-card border border-warning-400/30 bg-warning-400/10 px-4 py-3 text-[13px] text-warning-200">
        შენი პროფილი გადახედვას დაექვემდებარება. ადმინი დაადასტურებს 24–48 სთ-ში.
      </div>
    </div>
  );
}
