import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { listLeagues, listServiceCategories } from '@/lib/admin/ref-data/actions';
import { RefDataClient } from './ref-data-client';

export const metadata: Metadata = {
  title: 'Reference data · Admin',
};

export default async function AdminRefDataPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const [leagues, serviceCategories, pendingCount, pendingVerifications] = await Promise.all([
    listLeagues(),
    listServiceCategories(),
    db.serviceRequest.count({ where: { status: 'PENDING' } }),
    db.footballerProfile
      .count({ where: { verificationStatus: 'PENDING' } })
      .then(
        async (f) => f + (await db.clubProfile.count({ where: { verificationStatus: 'PENDING' } })),
      ),
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
    <RefDataClient
      currentPath="/admin/ref-data"
      userId={session.user.id}
      user={{ name: adminName, initials, email: session.user.email ?? undefined }}
      leagues={leagues}
      serviceCategories={serviceCategories}
      pendingCount={pendingCount}
      pendingVerifications={pendingVerifications}
    />
  );
}
