import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { listServiceRequests } from '@/lib/admin/service-requests/actions';
import { ServiceRequestsClient } from './service-requests-client';

export const metadata: Metadata = {
  title: 'Service requests · Admin',
};

const PAGE_SIZE = 20;

type StatusFilter = 'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED';

function str(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  return s || undefined;
}

function parseStatus(raw: string | undefined): StatusFilter {
  if (raw === 'PENDING' || raw === 'RESOLVED' || raw === 'REJECTED') return raw;
  return 'ALL';
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function AdminServiceRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const sp = await searchParams;
  const query = str(sp.q);
  const status = parseStatus(str(sp.status));
  const page = parsePage(str(sp.page));

  const [pendingCount, pendingVerifications, requestsPage] = await Promise.all([
    db.serviceRequest.count({ where: { status: 'PENDING' } }),
    db.footballerProfile
      .count({ where: { verificationStatus: 'PENDING' } })
      .then(
        async (f) => f + (await db.clubProfile.count({ where: { verificationStatus: 'PENDING' } })),
      ),
    listServiceRequests({ query, status, page, pageSize: PAGE_SIZE }),
  ]);

  const adminName = session.user.name ?? session.user.email ?? 'Admin';
  const initials =
    adminName
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase() || 'A';

  return (
    <ServiceRequestsClient
      currentPath="/admin/service-requests"
      userId={session.user.id}
      user={{ name: adminName, initials, email: session.user.email ?? undefined }}
      query={query ?? ''}
      status={status}
      page={page}
      pageSize={PAGE_SIZE}
      requestsPage={requestsPage}
      pendingCount={pendingCount}
      pendingVerifications={pendingVerifications}
    />
  );
}
