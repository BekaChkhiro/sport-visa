import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { Position, DominantFoot, ExperienceLevel } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import type { ComboboxOption } from '@/components/ui/combobox-field';
import { DirectoryClient } from './directory-client';

export const metadata: Metadata = {
  title: 'Footballer Directory',
};

const PAGE_SIZE = 24;

type SortKey = 'newest' | 'age-asc' | 'age-desc' | 'height-asc' | 'height-desc';

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

function parseSort(raw: string | undefined): SortKey {
  const valid: SortKey[] = ['newest', 'age-asc', 'age-desc', 'height-asc', 'height-desc'];
  return valid.includes(raw as SortKey) ? (raw as SortKey) : 'newest';
}

function sortToOrderBy(sort: SortKey) {
  switch (sort) {
    case 'age-asc':
      return { dateOfBirth: 'desc' as const };
    case 'age-desc':
      return { dateOfBirth: 'asc' as const };
    case 'height-asc':
      return { height: 'asc' as const };
    case 'height-desc':
      return { height: 'desc' as const };
    default:
      return { updatedAt: 'desc' as const };
  }
}

const EXPERIENCE_MAP: Record<string, ExperienceLevel> = {
  professional: 'PROFESSIONAL',
  semi: 'SEMI_PROFESSIONAL',
  amateur: 'AMATEUR',
};

const FOOT_MAP: Record<string, DominantFoot> = {
  right: 'RIGHT',
  left: 'LEFT',
  both: 'BOTH',
};

function str(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  return s || undefined;
}

function int(v: unknown): number | undefined {
  const n = parseInt(String(v ?? ''), 10);
  return isNaN(n) ? undefined : n;
}

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  const s = str(v);
  return s ? [s] : [];
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'CLUB') redirect('/dashboard');

  const sp = await searchParams;

  const page = Math.max(1, int(sp.page) ?? 1);
  const sort = parseSort(str(sp.sort));
  const view = sp.view === 'list' ? ('list' as const) : ('grid' as const);

  const positionsRaw = arr(sp.positions).map((p) => p.toUpperCase() as Position);
  const ageMin = int(sp.ageMin);
  const ageMax = int(sp.ageMax);
  const heightMin = int(sp.heightMin);
  const heightMax = int(sp.heightMax);
  const weightMin = int(sp.weightMin);
  const weightMax = int(sp.weightMax);

  const footRaw = str(sp.foot);
  const foot: DominantFoot | undefined =
    footRaw && footRaw !== 'all' ? FOOT_MAP[footRaw] : undefined;

  const nationality = str(sp.nationality);
  const city = str(sp.city);
  const experienceRaw = arr(sp.experience);
  const experience: ExperienceLevel[] = experienceRaw
    .map((e) => EXPERIENCE_MAP[e])
    .filter((e): e is ExperienceLevel => !!e);

  const now = new Date();
  const dobMax =
    ageMin !== undefined
      ? new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate())
      : undefined;
  const dobMin =
    ageMax !== undefined
      ? new Date(now.getFullYear() - ageMax - 1, now.getMonth(), now.getDate())
      : undefined;

  const where = {
    verificationStatus: 'VERIFIED' as const,
    isVisible: true,
    ...(positionsRaw.length > 0 && { positions: { hasSome: positionsRaw } }),
    ...(dobMin !== undefined || dobMax !== undefined
      ? {
          dateOfBirth: {
            ...(dobMin !== undefined && { gte: dobMin }),
            ...(dobMax !== undefined && { lte: dobMax }),
          },
        }
      : {}),
    ...(heightMin !== undefined || heightMax !== undefined
      ? {
          height: {
            ...(heightMin !== undefined && { gte: heightMin }),
            ...(heightMax !== undefined && { lte: heightMax }),
          },
        }
      : {}),
    ...(weightMin !== undefined || weightMax !== undefined
      ? {
          weight: {
            ...(weightMin !== undefined && { gte: weightMin }),
            ...(weightMax !== undefined && { lte: weightMax }),
          },
        }
      : {}),
    ...(foot && { dominantFoot: foot }),
    ...(nationality && { nationality }),
    ...(city && { city }),
    ...(experience.length > 0 && { experienceLevel: { in: experience } }),
  };

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [total, footballers, clubProfile, nationalityRows, cityRows, unreadNotifications] =
    await Promise.all([
      db.footballerProfile.count({ where }),
      db.footballerProfile.findMany({
        where,
        orderBy: sortToOrderBy(sort),
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          positions: true,
          height: true,
          dateOfBirth: true,
          nationality: true,
          avatarKey: true,
          verificationStatus: true,
        },
      }),
      db.clubProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          city: true,
          logoKey: true,
          verificationStatus: true,
          _count: { select: { shortlistedPlayers: true } },
        },
      }),
      db.footballerProfile.findMany({
        where: { verificationStatus: 'VERIFIED', isVisible: true, nationality: { not: null } },
        select: { nationality: true },
        distinct: ['nationality'],
        orderBy: { nationality: 'asc' },
      }),
      db.footballerProfile.findMany({
        where: { verificationStatus: 'VERIFIED', isVisible: true, city: { not: null } },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      }),
      db.notification.count({ where: { userId: session.user.id, read: false } }),
    ]);

  if (!clubProfile) redirect('/onboarding');

  const shortlistedIds = await db.clubShortlist
    .findMany({
      where: {
        clubProfileId: clubProfile.id,
        footballerProfileId: { in: footballers.map((f) => f.id) },
      },
      select: { footballerProfileId: true },
    })
    .then((rows) => new Set(rows.map((r) => r.footballerProfileId)));

  const initials = clubProfile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const items = footballers.map((f) => {
    const age = f.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(f.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        )
      : undefined;
    return {
      id: f.id,
      name: `${f.firstName} ${f.lastName}`.trim(),
      position: f.positions[0] ?? '',
      age,
      height: f.height ?? undefined,
      nationality: f.nationality ?? undefined,
      photoUrl: f.avatarKey ? `${r2BaseUrl}/${f.avatarKey}` : undefined,
      verificationStatus: toUiVerificationStatus(f.verificationStatus),
      isShortlisted: shortlistedIds.has(f.id),
    };
  });

  const nationalityOptions: ComboboxOption[] = nationalityRows
    .filter((r): r is { nationality: string } => r.nationality !== null)
    .map((r) => ({ value: r.nationality, label: r.nationality }));

  const cityOptions: ComboboxOption[] = cityRows
    .filter((r): r is { city: string } => r.city !== null)
    .map((r) => ({ value: r.city, label: r.city }));

  return (
    <DirectoryClient
      currentPath="/directory"
      user={{
        name: clubProfile.name,
        initials,
        image: clubProfile.logoKey ? `${r2BaseUrl}/${clubProfile.logoKey}` : undefined,
        city: clubProfile.city ?? undefined,
        verificationStatus: toUiVerificationStatus(clubProfile.verificationStatus),
      }}
      sidebarStats={{ shortlistCount: clubProfile._count.shortlistedPlayers }}
      unreadNotifications={unreadNotifications}
      items={items}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      sort={sort}
      view={view}
      initialFilters={{
        positions: positionsRaw,
        ageMin,
        ageMax,
        heightMin,
        heightMax,
        weightMin,
        weightMax,
        foot: (footRaw as 'left' | 'right' | 'both' | 'all' | undefined) ?? 'all',
        nationality,
        city,
        experience: experienceRaw as ('professional' | 'semi' | 'amateur')[],
      }}
      nationalityOptions={nationalityOptions}
      cityOptions={cityOptions}
    />
  );
}
