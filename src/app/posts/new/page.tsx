import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { PostComposerClient } from './post-composer-client';

export const metadata: Metadata = {
  title: 'ახალი სიახლე',
};

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function PostNewPage() {
  const session = await auth();

  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'CLUB') redirect('/dashboard');

  const userId = session.user.id;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [profile, unreadNotifications] = await Promise.all([
    db.clubProfile.findUnique({
      where: { userId },
      select: {
        name: true,
        city: true,
        logoKey: true,
        verificationStatus: true,
        profileViewCount: true,
        _count: { select: { shortlistedPlayers: true } },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
  ]);

  if (!profile) redirect('/onboarding');

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <PostComposerClient
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
    />
  );
}
