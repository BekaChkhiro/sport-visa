import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { ChatsClient } from './chats-client';

export const metadata: Metadata = {
  title: 'ჩატები',
};

export default async function ChatsPage() {
  const shell = await requireAppShellContext('/chats');
  if (shell.role !== 'footballer' && shell.role !== 'club') {
    redirect('/dashboard');
  }

  const userId = shell.userId;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const rawConversations = await db.conversation.findMany({
    where: shell.role === 'footballer' ? { footballerUserId: userId } : { clubUserId: userId },
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
  });

  const conversations = rawConversations
    .map((c) => {
      const isFootballer = shell.role === 'footballer';
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

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ChatsClient
      currentPath="/chats"
      userId={userId}
      role={shell.role}
      user={shell.user}
      unreadNotifications={shell.unreadNotifications}
      sidebarStats={{ ...(shell.sidebarStats ?? {}), unreadMessages }}
      conversations={conversations}
    />
  );
}
