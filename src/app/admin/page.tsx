import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminDashboardClient } from './admin-dashboard-client';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [
    totalUsers,
    pendingFootballers,
    pendingClubs,
    pendingServiceRequests,
    verifiedFootballers,
    verifiedClubs,
    rawPendingFootballers,
    rawPendingClubs,
    rawServiceRequests,
  ] = await Promise.all([
    db.user.count(),
    db.footballerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    db.clubProfile.count({ where: { verificationStatus: 'PENDING' } }),
    db.serviceRequest.count({ where: { status: 'PENDING' } }),
    db.footballerProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
    db.clubProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
    db.footballerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
    db.clubProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
    db.serviceRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        requestCode: true,
        createdAt: true,
        category: { select: { name: true } },
        user: { select: { email: true } },
      },
    }),
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
    <AdminDashboardClient
      currentPath="/admin"
      userId={session.user.id}
      user={{ name: adminName, initials, email: session.user.email ?? undefined }}
      kpi={{
        totalUsers,
        pendingFootballers,
        pendingClubs,
        pendingServiceRequests,
        verifiedFootballers,
        verifiedClubs,
      }}
      recentPendingFootballers={rawPendingFootballers.map((f) => ({
        id: f.id,
        firstName: f.firstName,
        lastName: f.lastName,
        email: f.user.email,
        createdAt: f.createdAt.toISOString(),
      }))}
      recentPendingClubs={rawPendingClubs.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.user.email,
        createdAt: c.createdAt.toISOString(),
      }))}
      recentServiceRequests={rawServiceRequests.map((r) => ({
        id: r.id,
        requestCode: r.requestCode,
        categoryName: r.category.name,
        email: r.user.email,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
