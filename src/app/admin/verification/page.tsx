import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { listPendingClubs, listPendingFootballers } from '@/lib/admin/verification/actions';
import { VerificationQueueClient } from './verification-queue-client';

export const metadata: Metadata = {
  title: 'Verification queue · Admin',
};

const PAGE_SIZE = 10;

type Tab = 'footballers' | 'clubs';
type Sort = 'oldest' | 'newest';

function str(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  return s || undefined;
}

function parseTab(raw: string | undefined): Tab {
  return raw === 'clubs' ? 'clubs' : 'footballers';
}

function parseSort(raw: string | undefined): Sort {
  return raw === 'newest' ? 'newest' : 'oldest';
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const sp = await searchParams;
  const tab = parseTab(str(sp.tab));
  const query = str(sp.q);
  const sort = parseSort(str(sp.sort));
  const page = parsePage(str(sp.page));

  const [pendingFootballerCount, pendingClubCount] = await Promise.all([
    db.footballerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    db.clubProfile.count({ where: { verificationStatus: 'PENDING' } }),
  ]);

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const composeMediaUrl = (key: string | null): string | null =>
    key && r2BaseUrl ? `${r2BaseUrl}/${key}` : null;

  const footballerPage =
    tab === 'footballers'
      ? await listPendingFootballers({ query, sort, page, pageSize: PAGE_SIZE })
      : null;
  const clubPage =
    tab === 'clubs' ? await listPendingClubs({ query, sort, page, pageSize: PAGE_SIZE }) : null;

  const adminName = session.user.name ?? session.user.email ?? 'Admin';
  const initials =
    adminName
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase() || 'A';

  return (
    <VerificationQueueClient
      currentPath="/admin/verification"
      userId={session.user.id}
      user={{ name: adminName, initials, email: session.user.email ?? undefined }}
      tab={tab}
      query={query ?? ''}
      sort={sort}
      page={page}
      pageSize={PAGE_SIZE}
      counts={{ footballers: pendingFootballerCount, clubs: pendingClubCount }}
      footballerPage={
        footballerPage
          ? {
              items: footballerPage.items.map((f) => ({
                id: f.id,
                firstName: f.firstName,
                lastName: f.lastName,
                email: f.email,
                positions: f.positions,
                city: f.city,
                nationality: f.nationality,
                avatarUrl: composeMediaUrl(f.avatarKey),
                createdAt: f.createdAt.toISOString(),
              })),
              total: footballerPage.total,
              pageCount: footballerPage.pageCount,
            }
          : null
      }
      clubPage={
        clubPage
          ? {
              items: clubPage.items.map((c) => ({
                id: c.id,
                name: c.name,
                email: c.email,
                league: c.league,
                city: c.city,
                country: c.country,
                logoUrl: composeMediaUrl(c.logoKey),
                createdAt: c.createdAt.toISOString(),
              })),
              total: clubPage.total,
              pageCount: clubPage.pageCount,
            }
          : null
      }
    />
  );
}
