import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ServiceCategoriesClient } from './service-categories-client';

export const metadata: Metadata = {
  title: 'სერვისის მოთხოვნა',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ServiceRequestPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'FOOTBALLER') {
    redirect('/dashboard');
  }

  const userId = session.user.id;

  const [profile, categories, unreadNotifications] = await Promise.all([
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
    db.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        description: true,
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

  return (
    <ServiceCategoriesClient
      currentPath="/services/request"
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
      categories={categories}
    />
  );
}
