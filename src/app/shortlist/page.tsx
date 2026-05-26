import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ShortlistClient } from './shortlist-client';

export const metadata: Metadata = {
  title: 'შ. სია',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ShortlistPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'CLUB') redirect('/dashboard');

  const userId = session.user.id;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [clubProfile, unreadNotifications] = await Promise.all([
    db.clubProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        city: true,
        logoKey: true,
        verificationStatus: true,
        shortlistedPlayers: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            footballerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                positions: true,
                height: true,
                nationality: true,
                city: true,
                avatarKey: true,
                verificationStatus: true,
              },
            },
          },
        },
        _count: { select: { shortlistedPlayers: true } },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
  ]);

  if (!clubProfile) redirect('/onboarding');

  const initials = clubProfile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const items = clubProfile.shortlistedPlayers.map((entry) => ({
    shortlistEntryId: entry.id,
    id: entry.footballerProfile.id,
    firstName: entry.footballerProfile.firstName,
    lastName: entry.footballerProfile.lastName,
    positions: entry.footballerProfile.positions,
    height: entry.footballerProfile.height ?? undefined,
    nationality: entry.footballerProfile.nationality ?? undefined,
    city: entry.footballerProfile.city ?? undefined,
    avatarUrl: entry.footballerProfile.avatarKey
      ? `${r2BaseUrl}/${entry.footballerProfile.avatarKey}`
      : undefined,
    verificationStatus: toUiVerificationStatus(entry.footballerProfile.verificationStatus),
    shortlistedAt: entry.createdAt.toISOString(),
  }));

  return (
    <ShortlistClient
      currentPath="/shortlist"
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
    />
  );
}
