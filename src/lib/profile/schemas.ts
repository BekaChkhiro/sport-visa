import { z } from 'zod';

import {
  DOMINANT_FOOT_VALUES,
  EXPERIENCE_LEVEL_VALUES,
  POSITION_VALUES,
} from '@/lib/onboarding/schemas';

// ── helpers ──────────────────────────────────────────────────────────────────

function toOptStr(v: unknown): string | undefined {
  if (v === '' || v == null) return undefined;
  return String(v);
}

function toOptInt(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

// ── personal info ─────────────────────────────────────────────────────────────

export const updatePersonalInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'სახელი სავალდებულოა').max(100),
  lastName: z.string().trim().min(1, 'გვარი სავალდებულოა').max(100),
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

export type UpdatePersonalInfoInput = z.infer<typeof updatePersonalInfoSchema>;

// ── sport info ────────────────────────────────────────────────────────────────

export const updateSportInfoSchema = z.object({
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

export type UpdateSportInfoInput = z.infer<typeof updateSportInfoSchema>;

// ── career entry ──────────────────────────────────────────────────────────────

export const careerEntrySchema = z.object({
  clubName: z.string().trim().min(1, 'კლუბის სახელი სავალდებულოა').max(200),
  startYear: z.coerce
    .number()
    .int()
    .min(1950, 'წელი 1950-ზე მეტი უნდა იყოს')
    .max(new Date().getFullYear(), 'მომავალი წელი არ შეიძლება'),
  endYear: z.preprocess(
    toOptInt,
    z.number().int().min(1950).max(new Date().getFullYear()).optional(),
  ),
  position: z.enum(POSITION_VALUES).optional(),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

export type CareerEntryInput = z.infer<typeof careerEntrySchema>;

// ── agent info ────────────────────────────────────────────────────────────────

export const updateAgentInfoSchema = z.object({
  agentName: z.preprocess(toOptStr, z.string().max(200).optional()),
  agentPhone: z.preprocess(toOptStr, z.string().max(50).optional()),
  agentEmail: z.preprocess(
    toOptStr,
    z.string().email('სწორი ელ.ფოსტა შეიყვანო').max(200).optional(),
  ),
});

export type UpdateAgentInfoInput = z.infer<typeof updateAgentInfoSchema>;

// ── video links ───────────────────────────────────────────────────────────────

const VIDEO_URL_RE = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/;

export const updateVideoLinksSchema = z.object({
  videoLinks: z
    .array(z.string().regex(VIDEO_URL_RE, 'YouTube ან Vimeo URL სავალდებულოა').max(300))
    .max(3, 'მაქსიმუმ 3 ვიდეო'),
});

export type UpdateVideoLinksInput = z.infer<typeof updateVideoLinksSchema>;

// ── shared action state ───────────────────────────────────────────────────────

export type ProfileActionState =
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };
