import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { countUnreadMessages } from '@/lib/messages';
import type { VerificationStatus } from '@/components/verification-badge';
import { PostEditClient } from './post-edit-client';

type Props = {
  params: Promise<{ postId: string }>;
};

export const metadata: Metadata = {
  title: 'სიახლის რედაქტირება',
};

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function PostEditPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'CLUB') redirect('/dashboard');

  const { postId } = await params;
  const userId = session.user.id;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [profile, unreadNotifications, unreadMessages] = await Promise.all([
    db.clubProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        city: true,
        logoKey: true,
        verificationStatus: true,
        profileViewCount: true,
        _count: { select: { shortlistedPlayers: true } },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
    countUnreadMessages(userId, 'club'),
  ]);

  if (!profile) redirect('/onboarding');

  const post = await db.clubPost.findFirst({
    where: { id: postId, clubId: profile.id },
    select: { id: true, title: true, body: true },
  });

  if (!post) notFound();

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <PostEditClient
      postId={post.id}
      initialTitle={post.title}
      initialBody={post.body}
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
    />
  );
}
