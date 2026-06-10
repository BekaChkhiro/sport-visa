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
import { saveClubProfile } from '@/lib/onboarding/actions';
import { COUNTRIES, clubOnboardingSchema } from '@/lib/onboarding/schemas';
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
const ICrest = (
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);
const IBuilding = (
  <>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M9 8h0M15 8h0M9 12h0M15 12h0M9 16h0M15 16h0" />
  </>
);
const IShield = (
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

const TOTAL_STEPS = 3;
const STEP_LABELS = ['ვინაობა', 'მედია', 'გადახედვა'];
const STEP_ICONS = [ICrest, IBuilding, ICheck];

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
  const generatedId = React.useId();
  const control =
    React.isValidElement(children) && !(children.props as { id?: string }).id
      ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id: generatedId })
      : children;

  return (
    <div className={cn('space-y-0', className)}>
      <Label htmlFor={generatedId} className="mb-0">
        <Lbl req={req} hint={hint}>
          {label}
        </Lbl>
      </Label>
      {control}
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

export function ClubWizard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [done, setDone] = React.useState(false);
  const progress = ((step - 1) / TOTAL_STEPS) * 100;

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
                კლუბის პროფილი გადაეგზავნა ადმინს დასადასტურებლად. დადასტურების შემდეგ მიიღებთ სრულ
                წვდომას ფეხბურთელთა დირექტორიაზე.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-pill border border-warning-400/30 bg-warning-400/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-warning-300">
                <span className="h-1.5 w-1.5 rounded-full bg-warning-400" />
                ელოდება ვერიფიკაციას
              </div>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    router.replace('/dashboard/club');
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
              {step === 1 && <ClubStep1 form={form} errors={errors} onChange={set} />}
              {step === 2 && <ClubStep2 />}
              {step === 3 && <ClubStep3 form={form} />}
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
              <Button size="lg" onClick={goNext} disabled={submitting}>
                {step === TOTAL_STEPS ? (
                  submitting ? (
                    'შენახვა…'
                  ) : (
                    <>
                      დასრულება <Ico d={ICheck} size={17} stroke={2.5} />
                    </>
                  )
                ) : (
                  <>
                    გაგრძელება <Ico d={IArrow} size={17} stroke={2.5} />
                  </>
                )}
              </Button>
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

// ── Club Step 1: identity ───────────────────────────────────────────────────

function ClubStep1({
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
      <h2 className="font-display text-[17px] font-bold text-ink-50">კლუბის იდენტობა</h2>

      <Field label="კლუბის სახელი" req error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="FC Dinamo Tbilisi"
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="დაარსების წელი" error={errors.foundedYear} hint="არასავალდებულო">
          <Input
            type="number"
            value={form.foundedYear}
            onChange={(e) => onChange('foundedYear', e.target.value)}
            placeholder="1925"
            min={1800}
            max={new Date().getFullYear()}
          />
        </Field>

        <Field label="ქვეყანა" error={errors.country} hint="არასავალდებულო">
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

        <Field label="ქალაქი" error={errors.city} hint="არასავალდებულო">
          <Input
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="თბილისი"
          />
        </Field>

        <Field label="ლიგა / დივიზიონი" error={errors.league} hint="არასავალდებულო">
          <Input
            value={form.league}
            onChange={(e) => onChange('league', e.target.value)}
            placeholder="Erovnuli Liga"
          />
        </Field>

        <Field label="სტადიონი" error={errors.stadiumName} hint="არასავალდებულო">
          <Input
            value={form.stadiumName}
            onChange={(e) => onChange('stadiumName', e.target.value)}
            placeholder="Mikheil Meskhi"
          />
        </Field>

        <Field label="სტადიონის ტევადობა" error={errors.stadiumCapacity} hint="არასავალდებულო">
          <Input
            type="number"
            value={form.stadiumCapacity}
            onChange={(e) => onChange('stadiumCapacity', e.target.value)}
            placeholder="24000"
            min={0}
          />
        </Field>

        <Field
          label="ოფიციალური ვებგვ."
          error={errors.officialWebsite}
          hint="არასავალდებულო"
          className="sm:col-span-2"
        >
          <Input
            type="url"
            value={form.officialWebsite}
            onChange={(e) => onChange('officialWebsite', e.target.value)}
            placeholder="https://example.ge"
          />
        </Field>
      </div>

      <Field
        label={`კლუბის აღწერა (${form.bio.length}/2000)`}
        error={errors.bio}
        hint="არასავალდებულო"
      >
        <Textarea
          value={form.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="კლუბის ისტორია, მიღწევები, ფილოსოფია…"
          maxLength={2000}
          rows={4}
        />
      </Field>
    </div>
  );
}

// ── Club Step 2: media placeholder ──────────────────────────────────────────

function ClubStep2() {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-[17px] font-bold text-ink-50">სტადიონი და დეტალები</h2>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 text-ink-400">
          <svg
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </span>
        <div className="space-y-1">
          <h3 className="font-semibold text-ink-100">ლოგო და ფოტო</h3>
          <p className="max-w-sm text-[13px] text-ink-400">
            კლუბის ლოგო და სტადიონის ფოტო შეგიძლია ატვირთო პროფილის რედაქტირების გვერდიდან პროფილის
            შექმნის შემდეგ.
          </p>
        </div>
        <p className="text-[12px] text-ink-500">განაგრძე → გადახედვისთვის</p>
      </div>
    </div>
  );
}

// ── Club Step 3: review ─────────────────────────────────────────────────────

function ClubStep3({ form }: { form: FormData }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-[17px] font-bold text-ink-50">გადახედვა</h2>

      <div className="space-y-1">
        <p className="font-medium text-ink-100">{form.name || '—'}</p>
        <p className="text-[13px] text-ink-400">
          {[form.city, form.league, form.foundedYear].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>

      {form.bio && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 mb-1">
            აღწერა
          </p>
          <p className="line-clamp-3 text-[13px] text-ink-200">{form.bio}</p>
        </div>
      )}

      <div className="rounded-card border border-warning-400/30 bg-warning-400/10 px-4 py-3 text-[13px] text-warning-200">
        ადმინი განიხილავს კლუბს. დოკ. (სარეგ. ან წერ.) გამოგვიგზავნე{' '}
        <strong>admin@sportvisa.ge</strong>-ზე.
      </div>
    </div>
  );
}
