import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { listMessages, markConversationRead } from '@/lib/messages';

import { ChatThreadClient } from './thread-client';

export const metadata: Metadata = {
  title: 'ჩატი',
};

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ChatThreadPage({ params }: PageProps) {
  const { conversationId } = await params;

  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const userId = session.user.id;
  const role = session.user.role;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  if (role !== 'FOOTBALLER' && role !== 'CLUB') redirect('/dashboard');

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      clubUserId: true,
      footballerUserId: true,
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
              positions: true,
              nationality: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  });

  if (
    !conversation ||
    (conversation.clubUserId !== userId && conversation.footballerUserId !== userId)
  ) {
    notFound();
  }

  // Mark incoming messages as read before loading the full thread so the
  // returned rows reflect post-read state for receipts UI.
  await markConversationRead(conversation.id, userId);

  const [messages, userProfile] = await Promise.all([
    listMessages(conversation.id),
    role === 'FOOTBALLER'
      ? db.footballerProfile.findUnique({
          where: { userId },
          select: { firstName: true, lastName: true, avatarKey: true },
        })
      : db.clubProfile.findUnique({
          where: { userId },
          select: { name: true, logoKey: true },
        }),
  ]);

  if (!userProfile) redirect('/onboarding');

  let currentUser: { name: string; initials: string; image?: string };
  if (role === 'FOOTBALLER' && 'firstName' in userProfile) {
    const fp = userProfile;
    currentUser = {
      name: `${fp.firstName} ${fp.lastName}`.trim(),
      initials: [fp.firstName[0], fp.lastName[0]].filter(Boolean).join('').toUpperCase(),
      image: fp.avatarKey ? `${r2BaseUrl}/${fp.avatarKey}` : undefined,
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
    };
  } else {
    redirect('/dashboard');
  }

  const isFootballer = role === 'FOOTBALLER';
  const otherParty = isFootballer
    ? conversation.clubUser.clubProfile
    : conversation.footballerUser.footballerProfile;

  if (!otherParty) notFound();

  let otherName: string;
  let otherInitials: string;
  let otherAvatarUrl: string | undefined;
  let otherProfileHref: string;

  if (!isFootballer && 'firstName' in otherParty) {
    const fp = otherParty;
    otherName = `${fp.firstName} ${fp.lastName}`.trim();
    otherInitials = [fp.firstName[0], fp.lastName[0]].filter(Boolean).join('').toUpperCase();
    otherAvatarUrl = fp.avatarKey ? `${r2BaseUrl}/${fp.avatarKey}` : undefined;
    otherProfileHref = `/directory/${fp.id}`;
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
    otherProfileHref = `/clubs/${cp.id}`;
  } else {
    notFound();
  }

  return (
    <ChatThreadClient
      currentPath="/chats"
      userId={userId}
      role={isFootballer ? 'footballer' : 'club'}
      user={currentUser}
      conversation={{
        id: conversation.id,
        clubUserId: conversation.clubUserId,
        footballerUserId: conversation.footballerUserId,
        otherName,
        otherInitials,
        otherAvatarUrl,
        otherProfileHref,
      }}
      initialMessages={messages.map((m) => ({
        id: m.id,
        senderUserId: m.senderUserId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        read: m.read,
      }))}
    />
  );
}
