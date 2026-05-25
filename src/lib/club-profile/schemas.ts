import { z } from 'zod';

function toOptStr(v: unknown): string | undefined {
  if (v === '' || v == null) return undefined;
  return String(v);
}

function toOptInt(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export const updateClubIdentitySchema = z.object({
  name: z.string().trim().min(1, 'კლუბის სახელი სავალდებულოა').max(200),
  foundedYear: z.preprocess(
    toOptInt,
    z
      .number()
      .int()
      .min(1800, 'წელი 1800-ზე მეტი უნდა იყოს')
      .max(new Date().getFullYear(), 'მომავალი წელი არ შეიძლება')
      .optional(),
  ),
  country: z.preprocess(
    toOptStr,
    z
      .string()
      .regex(/^[A-Za-z]{2}$/, 'ქვეყანა — 2-ასოიანი ISO კოდი')
      .transform((v) => v.toUpperCase())
      .optional(),
  ),
  city: z.preprocess(toOptStr, z.string().max(100).optional()),
  league: z.preprocess(toOptStr, z.string().max(200).optional()),
  stadiumName: z.preprocess(toOptStr, z.string().max(200).optional()),
  stadiumCapacity: z.preprocess(toOptInt, z.number().int().min(0).optional()),
  officialWebsite: z.preprocess(toOptStr, z.string().url('სწორი URL შეიყვანო').max(300).optional()),
});

export type ClubIdentityInput = z.infer<typeof updateClubIdentitySchema>;

export type ClubActionState =
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };

export const updateClubBioSchema = z.object({
  bio: z.preprocess(toOptStr, z.string().max(2000, 'ბიო/ისტ. მაქს. 2000 სიმბ.').optional()),
});

export const clubHistoryEventSchema = z.object({
  year: z.preprocess(
    toOptInt,
    z
      .number()
      .int()
      .min(1800, 'წელი 1800-ზე მეტი')
      .max(new Date().getFullYear(), 'მომავალი წელი არ შეიძლება'),
  ),
  title: z.string().trim().min(1, 'სათაური სავალდებულოა').max(200),
  description: z.preprocess(toOptStr, z.string().max(500).optional()),
});

export type ClubHistoryEventInput = z.infer<typeof clubHistoryEventSchema>;

export type ClubHistoryEventAddState =
  | { status: 'success'; eventId: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> };
