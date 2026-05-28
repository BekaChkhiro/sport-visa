import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { countUnreadMessages } from '@/lib/messages';
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

  const [profile, unreadNotifications, unreadMessages, rawConversations] = await Promise.all([
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
    countUnreadMessages(userId, 'club'),
    db.conversation.findMany({
      where: { clubUserId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        updatedAt: true,
        footballerUser: {
          select: {
            footballerProfile: {
              select: { firstName: true, lastName: true, avatarKey: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { body: true, createdAt: true },
        },
        _count: {
          select: { messages: { where: { read: false, senderUserId: { not: userId } } } },
        },
      },
    }),
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

  const recentChats = rawConversations
    .map((c) => {
      const fp = c.footballerUser.footballerProfile;
      if (!fp) return null;
      const name = `${fp.firstName} ${fp.lastName}`.trim();
      const initials = [fp.firstName[0], fp.lastName[0]].filter(Boolean).join('').toUpperCase();
      const lastMsg = c.messages[0];
      return {
        id: c.id,
        otherName: name,
        otherInitials: initials,
        otherAvatarUrl: fp.avatarKey ? `${r2BaseUrl}/${fp.avatarKey}` : undefined,
        lastMessageBody: lastMsg?.body ?? null,
        lastMessageAt: (lastMsg?.createdAt ?? c.updatedAt).toISOString(),
        unreadCount: c._count.messages,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <ClubDashboardClient
      currentPath="/dashboard/club"
      userId={userId}
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
        unreadMessages,
      }}
      unreadNotifications={unreadNotifications}
      recentShortlist={recentShortlist}
      recentPosts={recentPosts}
      recentChats={recentChats}
    />
  );
}
