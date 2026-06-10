'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, HeartIcon, ChevronRightIcon } from '@/components/icons';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';
import { togglePostLike } from '@/lib/clubs/actions';
import { cn } from '@/lib/utils';

// Inline bookmark icon (not in shared icons)
function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function CheckSmallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

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
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
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
      <div className="mx-auto max-w-[1180px]">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-[12.5px] text-ink-500">
          <Link href="/clubs" className="transition-colors hover:text-ink-200">
            კლუბები
          </Link>
          <ChevronRightIcon className="size-3.5 text-ink-700" />
          <Link href={`/clubs/${clubId}`} className="transition-colors hover:text-ink-200">
            {club.name}
          </Link>
          <ChevronRightIcon className="size-3.5 text-ink-700" />
          <span className="text-ink-300">სიახლე</span>
        </nav>

        <div className="grid gap-7 lg:grid-cols-[1fr_336px]">
          {/* Article */}
          <main className="min-w-0">
            <Link
              href={`/clubs/${clubId}?tab=news`}
              className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 transition-colors hover:text-ink-100"
            >
              <ArrowLeftIcon className="size-4" />
              უკან კლუბის გვერდზე
            </Link>

            <article className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              {/* Club header row */}
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-800 px-5 py-4 sm:px-6">
                <Avatar className="h-11 w-11 shrink-0 rounded-[12px]">
                  {club.logoUrl && (
                    <AvatarImage
                      src={club.logoUrl}
                      alt={club.name}
                      className="rounded-[12px] object-contain"
                    />
                  )}
                  <AvatarFallback className="rounded-[12px] bg-accent-400/15 text-sm font-semibold text-accent-300">
                    {club.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/clubs/${clubId}`}
                      className="truncate text-[14.5px] font-semibold text-ink-50 transition-colors hover:text-brand-300"
                    >
                      {club.name}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-[12px] text-ink-500">{post.publishedAt}</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-6 sm:px-8 sm:py-8">
                <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink-50 sm:text-[32px]">
                  {post.title}
                </h1>

                <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-ink-300 whitespace-pre-wrap">
                  {post.body}
                </div>
              </div>

              {/* Like / share bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-800 px-5 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                  {canLike ? (
                    <button
                      type="button"
                      onClick={handleToggleLike}
                      disabled={pending}
                      aria-pressed={liked}
                      aria-label={liked ? 'მოწონების მოხსნა' : 'მოწონება'}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-pill px-4 py-2 text-[13.5px] font-semibold transition-colors',
                        liked
                          ? 'bg-danger-400/15 text-danger-300'
                          : 'border border-ink-700 bg-ink-800/60 text-ink-300 hover:border-ink-600 hover:text-ink-100',
                      )}
                    >
                      <HeartIcon
                        className={cn('size-4', liked ? 'fill-current' : '')}
                        aria-hidden="true"
                      />
                      <span className="font-mono tabular-nums">{likeCount}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-[13px] text-ink-500">
                      <HeartIcon className="size-4" aria-hidden="true" />
                      <span className="font-mono tabular-nums">{likeCount}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSaved((v) => !v)}
                    aria-pressed={saved}
                    aria-label={saved ? 'შენახული' : 'შენახვა'}
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-pill transition-colors',
                      saved
                        ? 'bg-brand-400/15 text-brand-300'
                        : 'border border-ink-700 bg-ink-800/60 text-ink-400 hover:text-ink-100',
                    )}
                  >
                    <BookmarkIcon className="size-4" filled={saved} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-pill border border-ink-700 bg-ink-800/60 px-4 py-2 text-[13px] font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-100"
                >
                  {copied ? (
                    <>
                      <CheckSmallIcon className="size-4 text-success-400" />
                      ლინკი დაკოპირდა
                    </>
                  ) : (
                    <>
                      <ShareIcon className="size-4" />
                      გაზიარება
                    </>
                  )}
                </button>
              </div>
            </article>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-[88px] lg:self-start">
            {/* Club summary card */}
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              <div className="relative h-20 overflow-hidden rounded-t-card bg-gradient-to-br from-accent-900 to-ink-900">
                {/* intentionally empty cover strip */}
              </div>
              <div className="px-5 pb-5">
                <div className="-mt-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[16px] border-2 border-ink-900 shadow-card">
                  {club.logoUrl ? (
                    <Avatar className="h-16 w-16 rounded-[16px]">
                      <AvatarImage
                        src={club.logoUrl}
                        alt={club.name}
                        className="rounded-[16px] object-contain"
                      />
                      <AvatarFallback className="rounded-[16px] bg-accent-400/15 text-sm font-semibold text-accent-300">
                        {club.initials}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-[16px] bg-accent-400/15 text-accent-300">
                      <span className="text-lg font-bold">{club.initials}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-display text-[17px] font-bold tracking-tight text-ink-50">
                    {club.name}
                  </h3>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href={`/clubs/${clubId}`}>კლუბის პროფილი</Link>
                </Button>
              </div>
            </div>

            {/* Back to news */}
            <div>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href={`/clubs/${clubId}?tab=news`}>
                  <ArrowLeftIcon className="size-4" />
                  სიახლეებზე დაბრუნება
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
