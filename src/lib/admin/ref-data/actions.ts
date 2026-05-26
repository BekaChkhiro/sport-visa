'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LeagueRow = {
  id: string;
  name: string;
  country: string | null;
  isActive: boolean;
  orderIndex: number;
};

export type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  orderIndex: number;
  requestCount: number;
};

export type RefDataActionState = {
  status: 'success' | 'error' | 'idle';
  message?: string;
};

// ── Validation schemas ────────────────────────────────────────────────────────

const leagueCreateSchema = z.object({
  name: z.string().trim().min(1, 'სახელი სავალდებულოა').max(120),
  country: z
    .string()
    .trim()
    .length(2)
    .toUpperCase()
    .optional()
    .or(z.literal(''))
    .transform((v) => v || null),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

const leagueUpdateSchema = leagueCreateSchema.extend({
  id: z.string().min(1),
  isActive: z.boolean().optional(),
});

const leagueIdSchema = z.object({ id: z.string().min(1) });

const serviceCategoryCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'slug სავალდებულოა')
    .max(60)
    .regex(/^[a-z0-9_]+$/, 'slug: მხოლოდ a-z, 0-9, _'),
  name: z.string().trim().min(1, 'სახელი სავალდებულოა').max(120),
  icon: z
    .string()
    .trim()
    .max(10)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || null),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || null),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

const serviceCategoryUpdateSchema = serviceCategoryCreateSchema.extend({
  id: z.string().min(1),
  isActive: z.boolean().optional(),
});

const serviceCategoryIdSchema = z.object({ id: z.string().min(1) });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  if (session.user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return session.user.id;
}

function revalidateRefDataPages() {
  revalidatePath('/admin/ref-data');
  revalidatePath('/admin');
}

// ── League actions ────────────────────────────────────────────────────────────

export async function listLeagues(): Promise<LeagueRow[]> {
  await ensureAdmin();
  const rows = await db.league.findMany({
    orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, country: true, isActive: true, orderIndex: true },
  });
  return rows;
}

export async function createLeague(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = leagueCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები' };
  }

  const league = await db.league.create({ data: parsed.data });
  logger.info(
    { adminId, leagueId: league.id, name: league.name, action: 'create_league' },
    'league_created',
  );
  revalidateRefDataPages();
  return { status: 'success', message: 'ლიგა დაემატა' };
}

export async function updateLeague(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = leagueUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები' };
  }

  const { id, ...rest } = parsed.data;
  const existing = await db.league.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { status: 'error', message: 'ლიგა ვერ მოიძებნა' };

  await db.league.update({ where: { id }, data: rest });
  logger.info({ adminId, leagueId: id, action: 'update_league' }, 'league_updated');
  revalidateRefDataPages();
  return { status: 'success', message: 'ლიგა განახლდა' };
}

export async function deleteLeague(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = leagueIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const existing = await db.league.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, name: true },
  });
  if (!existing) return { status: 'error', message: 'ლიგა ვერ მოიძებნა' };

  await db.league.delete({ where: { id: existing.id } });
  logger.info(
    { adminId, leagueId: existing.id, name: existing.name, action: 'delete_league' },
    'league_deleted',
  );
  revalidateRefDataPages();
  return { status: 'success', message: 'ლიგა წაიშალა' };
}

export async function toggleLeagueActive(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = leagueIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const existing = await db.league.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, isActive: true },
  });
  if (!existing) return { status: 'error', message: 'ლიგა ვერ მოიძებნა' };

  await db.league.update({ where: { id: existing.id }, data: { isActive: !existing.isActive } });
  logger.info({ adminId, leagueId: existing.id, action: 'toggle_league_active' }, 'league_toggled');
  revalidateRefDataPages();
  return { status: 'success' };
}

// ── Service category actions ──────────────────────────────────────────────────

export async function listServiceCategories(): Promise<ServiceCategoryRow[]> {
  await ensureAdmin();
  const rows = await db.serviceCategory.findMany({
    orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      description: true,
      isActive: true,
      orderIndex: true,
      _count: { select: { requests: true } },
    },
  });
  return rows.map(
    (r) => ({ ...r, requestCount: r._count.requests, _count: undefined }) as ServiceCategoryRow,
  );
}

export async function createServiceCategory(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = serviceCategoryCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები' };
  }

  const slugExists = await db.serviceCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (slugExists) return { status: 'error', message: 'ეს slug უკვე გამოიყენება' };

  const cat = await db.serviceCategory.create({ data: parsed.data });
  logger.info(
    { adminId, categoryId: cat.id, slug: cat.slug, action: 'create_service_category' },
    'service_category_created',
  );
  revalidateRefDataPages();
  return { status: 'success', message: 'კატეგორია დაემატა' };
}

export async function updateServiceCategory(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = serviceCategoryUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები' };
  }

  const { id, ...rest } = parsed.data;
  const existing = await db.serviceCategory.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) return { status: 'error', message: 'კატეგორია ვერ მოიძებნა' };

  if (rest.slug !== existing.slug) {
    const conflict = await db.serviceCategory.findUnique({ where: { slug: rest.slug } });
    if (conflict) return { status: 'error', message: 'ეს slug უკვე გამოიყენება' };
  }

  await db.serviceCategory.update({ where: { id }, data: rest });
  logger.info(
    { adminId, categoryId: id, action: 'update_service_category' },
    'service_category_updated',
  );
  revalidateRefDataPages();
  return { status: 'success', message: 'კატეგორია განახლდა' };
}

export async function deleteServiceCategory(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = serviceCategoryIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const existing = await db.serviceCategory.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, slug: true, name: true, _count: { select: { requests: true } } },
  });
  if (!existing) return { status: 'error', message: 'კატეგორია ვერ მოიძებნა' };
  if (existing._count.requests > 0) {
    return {
      status: 'error',
      message: 'კატეგორიას აქვს მოთხოვნები — წაშლა შეუძლებელია. გამორთეთ.',
    };
  }

  await db.serviceCategory.delete({ where: { id: existing.id } });
  logger.info(
    { adminId, categoryId: existing.id, slug: existing.slug, action: 'delete_service_category' },
    'service_category_deleted',
  );
  revalidateRefDataPages();
  return { status: 'success', message: 'კატეგორია წაიშალა' };
}

export async function toggleServiceCategoryActive(data: unknown): Promise<RefDataActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = serviceCategoryIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const existing = await db.serviceCategory.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, isActive: true },
  });
  if (!existing) return { status: 'error', message: 'კატეგორია ვერ მოიძებნა' };

  await db.serviceCategory.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });
  logger.info(
    { adminId, categoryId: existing.id, action: 'toggle_service_category_active' },
    'service_category_toggled',
  );
  revalidateRefDataPages();
  return { status: 'success' };
}
