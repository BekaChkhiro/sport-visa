import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ClubDashboardClient } from './club-dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ClubDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'CLUB') {
    redirect('/dashboard');
  }

  const userId = session.user.id;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [profile, unreadNotifications] = await Promise.all([
    db.clubProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        city: true,
        logoKey: true,
        verificationStatus: true,
        profileViewCount: true,
        shortlistedPlayers: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            createdAt: true,
            footballerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                positions: true,
                height: true,
                nationality: true,
                avatarKey: true,
              },
            },
          },
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: { select: { likes: true } },
          },
        },
        _count: {
          select: { shortlistedPlayers: true },
        },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const recentShortlist = profile.shortlistedPlayers.map((entry) => ({
    id: entry.footballerProfile.id,
    firstName: entry.footballerProfile.firstName,
    lastName: entry.footballerProfile.lastName,
    positions: entry.footballerProfile.positions,
    height: entry.footballerProfile.height,
    nationality: entry.footballerProfile.nationality,
    avatarUrl: entry.footballerProfile.avatarKey
      ? `${r2BaseUrl}/${entry.footballerProfile.avatarKey}`
      : undefined,
    shortlistedAt: entry.createdAt.toISOString(),
  }));

  const recentPosts = profile.posts.map((p) => ({
    id: p.id,
    title: p.title,
    likeCount: p._count.likes,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <ClubDashboardClient
      currentPath="/dashboard/club"
      user={{
        name: profile.name,
        initials,
        image: profile.logoKey ? `${r2BaseUrl}/${profile.logoKey}` : undefined,
        city: profile.city ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
      }}
      stats={{
        views: profile.profileViewCount,
        shortlistCount: profile._count.shortlistedPlayers,
        unreadMessages: 0,
      }}
      unreadNotifications={unreadNotifications}
      recentShortlist={recentShortlist}
      recentPosts={recentPosts}
    />
  );
}
