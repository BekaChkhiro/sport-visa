import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { loadAppShellContext } from '@/lib/app-shell/load-context';
import type { VerificationStatus } from '@/components/verification-badge';
import { ClubsDirectoryClient } from './clubs-directory-client';

export const metadata: Metadata = {
  title: 'კლუბები',
};

const PAGE_SIZE = 24;

type SortKey = 'newest' | 'name-asc' | 'name-desc';

function parseSort(raw: string | undefined): SortKey {
  const valid: SortKey[] = ['newest', 'name-asc', 'name-desc'];
  return valid.includes(raw as SortKey) ? (raw as SortKey) : 'newest';
}

function sortToOrderBy(sort: SortKey) {
  switch (sort) {
    case 'name-asc':
      return { name: 'asc' as const };
    case 'name-desc':
      return { name: 'desc' as const };
    default:
      return { updatedAt: 'desc' as const };
  }
}

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

function str(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  return s || undefined;
}

function int(v: unknown): number | undefined {
  const n = parseInt(String(v ?? ''), 10);
  return isNaN(n) ? undefined : n;
}

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [shell, sp] = await Promise.all([loadAppShellContext(), searchParams]);
  if (!shell) redirect('/auth/signin?callbackUrl=/clubs');

  const viewerRole = shell.role.toUpperCase();
  const viewerUserId = shell.userId;

  const page = Math.max(1, int(sp.page) ?? 1);
  const sort = parseSort(str(sp.sort));
  const search = str(sp.search);
  const countryFilter = str(sp.country);
  const cityFilter = str(sp.city);

  const where = {
    verificationStatus: 'VERIFIED' as const,
    isVisible: true,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(countryFilter && { country: countryFilter }),
    ...(cityFilter && { city: cityFilter }),
  };

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [total, clubs, countryRows, cityRows] = await Promise.all([
    db.clubProfile.count({ where }),
    db.clubProfile.findMany({
      where,
      orderBy: sortToOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        league: true,
        foundedYear: true,
        logoKey: true,
        verificationStatus: true,
      },
    }),
    db.clubProfile.findMany({
      where: { verificationStatus: 'VERIFIED', isVisible: true, country: { not: null } },
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    }),
    db.clubProfile.findMany({
      where: { verificationStatus: 'VERIFIED', isVisible: true, city: { not: null } },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    }),
  ]);

  let subscribedClubIds = new Set<string>();
  if (viewerRole === 'FOOTBALLER') {
    const footballer = await db.footballerProfile.findUnique({
      where: { userId: viewerUserId },
      select: { id: true },
    });
    if (footballer) {
      const subs = await db.clubSubscription.findMany({
        where: {
          footballerProfileId: footballer.id,
          clubProfileId: { in: clubs.map((c) => c.id) },
        },
        select: { clubProfileId: true },
      });
      subscribedClubIds = new Set(subs.map((s) => s.clubProfileId));
    }
  }

  const items = clubs.map((c) => ({
    id: c.id,
    name: c.name,
    city: c.city ?? undefined,
    country: c.country ?? undefined,
    league: c.league ?? undefined,
    foundedYear: c.foundedYear ?? undefined,
    logoUrl: c.logoKey ? `${r2BaseUrl}/${c.logoKey}` : undefined,
    verificationStatus: toUiVerificationStatus(c.verificationStatus),
    isSubscribed: subscribedClubIds.has(c.id),
  }));

  const countryOptions = countryRows
    .filter((r): r is { country: string } => r.country !== null)
    .map((r) => ({ value: r.country, label: r.country }));

  const cityOptions = cityRows
    .filter((r): r is { city: string } => r.city !== null)
    .map((r) => ({ value: r.city, label: r.city }));

  return (
    <ClubsDirectoryClient
      shellRole={shell.role}
      shellUser={shell.user}
      userId={shell.userId}
      sidebarStats={shell.sidebarStats}
      adminBadges={shell.adminBadges}
      unreadNotifications={shell.unreadNotifications}
      viewerRole={viewerRole}
      items={items}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      sort={sort}
      initialSearch={search}
      initialCountry={countryFilter}
      initialCity={cityFilter}
      countryOptions={countryOptions}
      cityOptions={cityOptions}
    />
  );
}
