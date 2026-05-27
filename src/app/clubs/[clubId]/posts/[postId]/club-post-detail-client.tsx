'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, HeartIcon } from '@/components/icons';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';
import { togglePostLike } from '@/lib/clubs/actions';
import { cn } from '@/lib/utils';

type ClubPostDetailClientProps = {
  shellRole: AppSidebarRole;
  shellUser: AppSidebarUser & { email?: string };
  userId: string;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
  canLike: boolean;
  clubId: string;
  club: { name: string; logoUrl?: string; initials: string };
  post: {
    id: string;
    title: string;
    body: string;
    publishedAt: string;
    likeCount: number;
    isLiked: boolean;
  };
};

export function ClubPostDetailClient({
  shellRole,
  shellUser,
  userId,
  sidebarStats,
  adminBadges,
  unreadNotifications,
  canLike,
  clubId,
  club,
  post,
}: ClubPostDetailClientProps) {
  const router = useRouter();
  const [liked, setLiked] = React.useState(post.isLiked);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);
  const [pending, setPending] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  async function handleToggleLike() {
    if (!canLike || pending) return;
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setLikeCount((c) => c + (optimisticLiked ? 1 : -1));
    setPending(true);

    const result = await togglePostLike(post.id);
    if (result.status === 'error') {
      setLiked(!optimisticLiked);
      setLikeCount((c) => c + (optimisticLiked ? -1 : 1));
    } else {
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    }
    setPending(false);
  }

  return (
    <AppShell
      role={shellRole}
      currentPath="/clubs"
      user={shellUser}
      userId={userId}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      adminBadges={adminBadges}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/clubs/${clubId}?tab=news`}>
              <ArrowLeftIcon className="size-4" />
              სიახლეებზე დაბრუნება
            </Link>
          </Button>
        </div>

        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Avatar className="size-9 rounded-lg">
              {club.logoUrl && (
                <AvatarImage
                  src={club.logoUrl}
                  alt={club.name}
                  className="rounded-lg object-contain"
                />
              )}
              <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                {club.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link href={`/clubs/${clubId}`} className="text-sm font-medium hover:underline">
                {club.name}
              </Link>
              <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold leading-snug">{post.title}</h1>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {post.body}
          </p>

          <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
            {canLike ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleLike}
                disabled={pending}
                aria-pressed={liked}
                aria-label={liked ? 'მოწონების მოხსნა' : 'მოწონება'}
                className="gap-1.5"
              >
                <HeartIcon
                  className={cn('size-4', liked ? 'fill-current text-red-500' : '')}
                  aria-hidden="true"
                />
                <span className="text-xs">{likeCount}</span>
              </Button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <HeartIcon className="size-4" aria-hidden="true" />
                {likeCount}
              </span>
            )}
          </div>
        </article>
      </div>
    </AppShell>
  );
}
