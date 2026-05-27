'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/icons';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';

type ClubPostDetailClientProps = {
  shellRole: AppSidebarRole;
  shellUser: AppSidebarUser & { email?: string };
  userId: string;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
  clubId: string;
  club: { name: string; logoUrl?: string; initials: string };
  post: { title: string; body: string; publishedAt: string; likeCount: number };
};

export function ClubPostDetailClient({
  shellRole,
  shellUser,
  userId,
  sidebarStats,
  adminBadges,
  unreadNotifications,
  clubId,
  club,
  post,
}: ClubPostDetailClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
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

          <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            ❤ {post.likeCount}
          </div>
        </article>
      </div>
    </AppShell>
  );
}
