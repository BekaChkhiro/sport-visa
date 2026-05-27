import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { ClubPostDetailClient } from './club-post-detail-client';

type Props = {
  params: Promise<{ clubId: string; postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await db.clubPost.findUnique({
    where: { id: postId },
    select: { title: true },
  });
  if (!post) return { title: 'პოსტი ვერ მოიძებნა' };
  return { title: post.title };
}

function clubInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default async function ClubPostDetailPage({ params }: Props) {
  const { clubId, postId } = await params;
  const shell = await requireAppShellContext(`/clubs/${clubId}/posts/${postId}`);

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const post = await db.clubPost.findFirst({
    where: { id: postId, clubId },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      _count: { select: { likes: true } },
      club: {
        select: { name: true, logoKey: true },
      },
    },
  });

  if (!post) notFound();

  // For footballers, check if they have already liked this post so the heart
  // shows the correct initial state. Other roles cannot like, so skip.
  let isLiked = false;
  if (shell.role === 'footballer') {
    const footballer = await db.footballerProfile.findUnique({
      where: { userId: shell.userId },
      select: { id: true },
    });
    if (footballer) {
      const like = await db.postLike.findUnique({
        where: {
          postId_footballerProfileId: { postId, footballerProfileId: footballer.id },
        },
        select: { id: true },
      });
      isLiked = !!like;
    }
  }

  const logoUrl = post.club.logoKey ? `${r2BaseUrl}/${post.club.logoKey}` : undefined;
  const initials = clubInitials(post.club.name);
  const publishedAt = post.createdAt.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ClubPostDetailClient
      shellRole={shell.role}
      shellUser={shell.user}
      userId={shell.userId}
      sidebarStats={shell.sidebarStats}
      adminBadges={shell.adminBadges}
      unreadNotifications={shell.unreadNotifications}
      canLike={shell.role === 'footballer'}
      clubId={clubId}
      club={{ name: post.club.name, logoUrl, initials }}
      post={{
        id: post.id,
        title: post.title,
        body: post.body,
        publishedAt,
        likeCount: post._count.likes,
        isLiked,
      }}
    />
  );
}
