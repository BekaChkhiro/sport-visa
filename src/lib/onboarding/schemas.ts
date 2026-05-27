import { z } from 'zod';

export const POSITION_VALUES = [
  'GK',
  'CB',
  'LB',
  'RB',
  'CM',
  'DM',
  'AM',
  'LW',
  'RW',
  'CF',
  'ST',
] as const;

export const POSITION_LABELS: Record<string, string> = {
  GK: 'მეკარე',
  CB: 'ცენტრ. დამც.',
  LB: 'მარც. დამც.',
  RB: 'მარჯ. დამც.',
  CM: 'ცენტრ. ნახ.დ.',
  DM: 'დამც. ნახ.დ.',
  AM: 'შეტ. ნახ.დ.',
  LW: 'მარც. ფლანგი',
  RW: 'მარჯ. ფლანგი',
  CF: 'ფორვარდი',
  ST: 'მეწინავე',
};

export const DOMINANT_FOOT_VALUES = ['RIGHT', 'LEFT', 'BOTH'] as const;
export const DOMINANT_FOOT_LABELS: Record<string, string> = {
  RIGHT: 'მარჯვენა',
  LEFT: 'მარცხენა',
  BOTH: 'ორივე',
};

export const EXPERIENCE_LEVEL_VALUES = ['PROFESSIONAL', 'SEMI_PROFESSIONAL', 'AMATEUR'] as const;
export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  PROFESSIONAL: 'პროფესიონალი',
  SEMI_PROFESSIONAL: 'ნახევარ-პროფ.',
  AMATEUR: 'სამოყვარულო',
};

export const COUNTRIES = [
  { code: 'GE', label: 'საქართველო' },
  { code: 'DE', label: 'გერმანია' },
  { code: 'ES', label: 'ესპანეთი' },
  { code: 'FR', label: 'საფრანგეთი' },
  { code: 'GB', label: 'გაერთ. სამეფო' },
  { code: 'IT', label: 'იტალია' },
  { code: 'NL', label: 'ნიდერლანდი' },
  { code: 'PT', label: 'პორტუგალია' },
  { code: 'TR', label: 'თურქეთი' },
  { code: 'UA', label: 'უკრაინა' },
  { code: 'AM', label: 'სომხეთი' },
  { code: 'AZ', label: 'აზერბაიჯანი' },
  { code: 'BR', label: 'ბრაზილია' },
  { code: 'AR', label: 'არგენტინა' },
  { code: 'US', label: 'აშშ' },
  { code: 'PL', label: 'პოლონეთი' },
  { code: 'CZ', label: 'ჩეხეთი' },
  { code: 'HU', label: 'უნგრეთი' },
  { code: 'RO', label: 'რუმინეთი' },
  { code: 'RS', label: 'სერბეთი' },
  { code: 'HR', label: 'ხორვატია' },
  { code: 'GR', label: 'საბერძნეთი' },
  { code: 'BE', label: 'ბელგია' },
  { code: 'AT', label: 'ავსტრია' },
  { code: 'CH', label: 'შვეიცარია' },
  { code: 'SE', label: 'შვედეთი' },
  { code: 'NO', label: 'ნორვეგია' },
  { code: 'DK', label: 'დანია' },
  { code: 'RU', label: 'რუსეთი' },
] as const;

// Empty string → undefined for optional form fields.
function toOptStr(v: unknown): string | undefined {
  if (v === '' || v == null) return undefined;
  return String(v);
}
function toOptInt(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export const footballerStep1Schema = z.object({
  dateOfBirth: z
    .string()
    .min(1, 'დაბადების თარიღი სავალდებულოა')
    .superRefine((v, ctx) => {
      const ts = Date.parse(v);
      if (Number.isNaN(ts)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'სწორი თარიღი შეიყვანო' });
        return z.NEVER;
      }
      const ageYears = (Date.now() - ts) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageYears < 12 || ageYears > 75) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ასაკი უნდა იყოს 12-დან 75 წლამდე',
        });
      }
    }),
  nationality: z
    .string()
    .min(1, 'ეროვნება სავალდებულოა')
    .regex(/^[A-Za-z]{2}$/, 'ეროვნება — 2-ასოიანი ISO კოდი')
    .transform((v) => v.toUpperCase()),
  city: z.string().trim().min(1, 'ქალაქი სავალდებულოა').max(100),
  country: z
    .string()
    .min(1, 'ქვეყანა სავალდებულოა')
    .regex(/^[A-Za-z]{2}$/, 'ქვეყანა — 2-ასოიანი ISO კოდი')
    .transform((v) => v.toUpperCase()),
  phone: z.preprocess(toOptStr, z.string().max(30).optional()),
  bio: z.preprocess(toOptStr, z.string().max(500).optional()),
});

export const footballerStep2Schema = z.object({
  positions: z
    .array(z.enum(POSITION_VALUES))
    .min(1, 'მინიმუმ ერთი პოზიცია სავალდებულოა')
    .max(2, 'მაქსიმუმ 2 პოზიცია'),
  dominantFoot: z.enum(DOMINANT_FOOT_VALUES),
  height: z.coerce.number().int().min(100, 'სიმაღლე 100-250 სმ').max(250, 'სიმაღლე 100-250 სმ'),
  weight: z.coerce.number().int().min(30, 'წონა 30-200 კგ').max(200, 'წონა 30-200 კგ'),
  currentClub: z.preprocess(toOptStr, z.string().max(100).optional()),
  jerseyNumber: z.preprocess(toOptInt, z.number().int().min(1).max(99).optional()),
  experienceLevel: z.enum(EXPERIENCE_LEVEL_VALUES).optional(),
  desiredLeague: z.preprocess(toOptStr, z.string().max(100).optional()),
});

export const footballerStep3Schema = z.object({
  // R2 object key of the uploaded avatar (e.g. "avatar/<uuid>.jpg"). Optional —
  // the user can skip and upload later from /profile/edit.
  avatarKey: z.preprocess(toOptStr, z.string().max(255).optional()),
});

export const footballerOnboardingSchema = footballerStep1Schema
  .merge(footballerStep2Schema)
  .merge(footballerStep3Schema);
export type FootballerOnboardingInput = z.infer<typeof footballerOnboardingSchema>;

export const clubOnboardingSchema = z.object({
  name: z.string().trim().min(1, 'კლუბის სახელი სავალდებულოა').max(200),
  foundedYear: z.preprocess(toOptInt, z.number().int().min(1850).max(2030).optional()),
  country: z.preprocess(
    toOptStr,
    z
      .string()
      .regex(/^[A-Za-z]{2}$/, 'ქვეყანა — 2-ასოიანი ISO კოდი')
      .transform((v) => v.toUpperCase())
      .optional(),
  ),
  city: z.preprocess(toOptStr, z.string().trim().max(100).optional()),
  league: z.preprocess(toOptStr, z.string().max(100).optional()),
  stadiumName: z.preprocess(toOptStr, z.string().max(200).optional()),
  stadiumCapacity: z.preprocess(toOptInt, z.number().int().min(0).optional()),
  officialWebsite: z.preprocess(
    toOptStr,
    z.string().url('სწორი URL შეიყვანო (https://...)').max(300).optional(),
  ),
  bio: z.preprocess(toOptStr, z.string().max(1000).optional()),
});

export type ClubOnboardingInput = z.infer<typeof clubOnboardingSchema>;

export type OnboardingActionState =
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };
