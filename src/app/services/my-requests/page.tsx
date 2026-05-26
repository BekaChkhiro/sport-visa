import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { MyRequestsClient } from './my-requests-client';

export const metadata: Metadata = {
  title: 'ჩემი სერვ. მოთხოვნები',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function MyRequestsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'FOOTBALLER') {
    redirect('/dashboard');
  }

  const userId = session.user.id;

  const [profile, serviceRequests, unreadNotifications] = await Promise.all([
    db.footballerProfile.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        positions: true,
        nationality: true,
        avatarKey: true,
        verificationStatus: true,
        profileViewCount: true,
        shortlistedBy: { select: { id: true } },
      },
    }),
    db.serviceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestCode: true,
        status: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        notes: true,
        adminNote: true,
        contactPref: true,
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = [profile.firstName[0], profile.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  const requests = serviceRequests.map((r) => ({
    id: r.id,
    requestCode: r.requestCode,
    status: r.status as 'PENDING' | 'RESOLVED' | 'REJECTED',
    createdAt: r.createdAt.toISOString(),
    startDate: r.startDate ? r.startDate.toISOString() : null,
    endDate: r.endDate ? r.endDate.toISOString() : null,
    notes: r.notes,
    adminNote: r.adminNote,
    contactPref: r.contactPref,
    category: r.category,
  }));

  return (
    <MyRequestsClient
      currentPath="/services/my-requests"
      userId={userId}
      user={{
        name,
        initials,
        image: profile.avatarKey ? `${r2BaseUrl}/${profile.avatarKey}` : undefined,
        position: profile.positions[0] ?? undefined,
        nationality: profile.nationality ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
        profileCompletion: 100,
      }}
      stats={{
        views: profile.profileViewCount,
        saves: profile.shortlistedBy.length,
        unreadMessages: 0,
      }}
      unreadNotifications={unreadNotifications}
      requests={requests}
    />
  );
}
