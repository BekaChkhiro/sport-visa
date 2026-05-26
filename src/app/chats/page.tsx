import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ChatsClient } from './chats-client';

export const metadata: Metadata = {
  title: 'ჩატები',
};

export default async function ChatsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const userId = session.user.id;
  const role = session.user.role;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  if (role !== 'FOOTBALLER' && role !== 'CLUB') redirect('/dashboard');

  const [userProfile, rawConversations] = await Promise.all([
    role === 'FOOTBALLER'
      ? db.footballerProfile.findUnique({
          where: { userId },
          select: {
            firstName: true,
            lastName: true,
            avatarKey: true,
            positions: true,
            nationality: true,
          },
        })
      : db.clubProfile.findUnique({
          where: { userId },
          select: { name: true, logoKey: true, city: true, verificationStatus: true },
        }),
    db.conversation.findMany({
      where: role === 'FOOTBALLER' ? { footballerUserId: userId } : { clubUserId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        updatedAt: true,
        clubUser: {
          select: {
            clubProfile: {
              select: { id: true, name: true, logoKey: true, verificationStatus: true },
            },
          },
        },
        footballerUser: {
          select: {
            footballerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarKey: true,
                verificationStatus: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { body: true, createdAt: true, senderUserId: true, read: true },
        },
        _count: {
          select: {
            messages: {
              where: { read: false, senderUserId: { not: userId } },
            },
          },
        },
      },
    }),
  ]);

  if (!userProfile) redirect('/onboarding');

  let currentUser: {
    name: string;
    initials: string;
    image?: string;
    role: 'footballer' | 'club';
    position?: string;
    nationality?: string;
    city?: string;
  };

  if (role === 'FOOTBALLER' && 'firstName' in userProfile) {
    const fp = userProfile;
    const name = `${fp.firstName} ${fp.lastName}`.trim();
    currentUser = {
      name,
      initials: [fp.firstName[0], fp.lastName[0]].filter(Boolean).join('').toUpperCase(),
      image: fp.avatarKey ? `${r2BaseUrl}/${fp.avatarKey}` : undefined,
      role: 'footballer',
      position: fp.positions[0] ?? undefined,
      nationality: fp.nationality ?? undefined,
    };
  } else if (role === 'CLUB' && 'name' in userProfile) {
    const cp = userProfile;
    currentUser = {
      name: cp.name,
      initials: cp.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase(),
      image: cp.logoKey ? `${r2BaseUrl}/${cp.logoKey}` : undefined,
      role: 'club',
      city: cp.city ?? undefined,
    };
  } else {
    redirect('/dashboard');
  }

  const conversations = rawConversations
    .map((c) => {
      const isFootballer = role === 'FOOTBALLER';
      const otherParty = isFootballer ? c.clubUser.clubProfile : c.footballerUser.footballerProfile;

      if (!otherParty) return null;

      let otherName: string;
      let otherInitials: string;
      let otherAvatarUrl: string | undefined;

      if (!isFootballer && 'firstName' in otherParty) {
        const fp = otherParty;
        otherName = `${fp.firstName} ${fp.lastName}`.trim();
        otherInitials = [fp.firstName[0], fp.lastName[0]].filter(Boolean).join('').toUpperCase();
        otherAvatarUrl = fp.avatarKey ? `${r2BaseUrl}/${fp.avatarKey}` : undefined;
      } else if (isFootballer && 'name' in otherParty) {
        const cp = otherParty;
        otherName = cp.name;
        otherInitials = cp.name
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase();
        otherAvatarUrl = cp.logoKey ? `${r2BaseUrl}/${cp.logoKey}` : undefined;
      } else {
        return null;
      }

      const lastMsg = c.messages[0];
      return {
        id: c.id,
        otherName,
        otherInitials,
        otherAvatarUrl,
        lastMessageBody: lastMsg?.body ?? null,
        lastMessageAt: lastMsg?.createdAt.toISOString() ?? c.updatedAt.toISOString(),
        unreadCount: c._count.messages,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ChatsClient
      currentPath="/chats"
      userId={userId}
      role={currentUser.role}
      user={currentUser}
      unreadNotifications={unreadTotal}
      sidebarStats={{ unreadMessages: unreadTotal }}
      conversations={conversations}
    />
  );
}
