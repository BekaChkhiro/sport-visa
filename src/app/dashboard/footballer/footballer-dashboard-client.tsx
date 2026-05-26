'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/ui/status-pill';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRightIcon, PlusIcon, HeartIcon } from '@/components/icons';
import { formatRelativeTime } from '@/lib/format-relative-time';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';

type SubscribedClub = {
  id: string;
  name: string;
  logoUrl?: string;
};

type NewsfeedPost = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  likeCount: number;
  club: {
    id: string;
    name: string;
    logoUrl?: string;
  };
};

type FootballerDashboardUser = {
  name: string;
  initials: string;
  image?: string;
  email?: string;
  position?: string;
  nationality?: string;
  verificationStatus?: VerificationStatus;
  profileCompletion: number;
};

type DashboardServiceRequest = {
  id: string;
  requestCode: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  categoryName: string;
};

type FootballerDashboardClientProps = {
  currentPath: string;
  userId: string;
  user: FootballerDashboardUser;
  stats: AppSidebarStats;
  unreadNotifications: number;
  subscribedClubs: SubscribedClub[];
  newsfeedPosts: NewsfeedPost[];
  profileMissingFields: string[];
  serviceRequests: DashboardServiceRequest[];
};

function toStatusPill(
  status: 'PENDING' | 'RESOLVED' | 'REJECTED',
): 'pending' | 'approved' | 'rejected' {
  if (status === 'RESOLVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

export function FootballerDashboardClient({
  currentPath,
  userId,
  user,
  stats,
  unreadNotifications,
  subscribedClubs,
  newsfeedPosts,
  profileMissingFields,
  serviceRequests,
}: FootballerDashboardClientProps) {
  const router = useRouter();
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell
      role="footballer"
      currentPath={currentPath}
      userId={userId}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="space-y-8 max-w-3xl">
        {!bannerDismissed && user.profileCompletion < 100 ? (
          <ProfileCompletionBanner
            percent={user.profileCompletion}
            missingFields={profileMissingFields}
            onComplete={() => router.push('/onboarding')}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}

        <section aria-labelledby="newsfeed-heading">
          <h2
            id="newsfeed-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            კლუბის სიახლეები
          </h2>
          {newsfeedPosts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                title="სიახლეები არ არის"
                description="გამოწერე კლუბი, რომ მათი სიახლეები გამოჩნდეს."
                action={
                  <Button variant="default" size="sm" asChild>
                    <Link href="/clubs">
                      <PlusIcon className="size-4" />
                      კლუბების ძიება
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {newsfeedPosts.map((post) => {
                const initials = post.club.name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const excerpt =
                  post.body.length > 150 ? post.body.slice(0, 150).trimEnd() + '…' : post.body;
                return (
                  <Link
                    key={post.id}
                    href={`/clubs/${post.club.id}/posts/${post.id}`}
                    className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar className="size-7 rounded-md">
                        {post.club.logoUrl && (
                          <AvatarImage
                            src={post.club.logoUrl}
                            alt={post.club.name}
                            className="rounded-md object-contain"
                          />
                        )}
                        <AvatarFallback className="rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.club.name}</span>
                      <span className="text-xs text-muted-foreground">
                        · {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                    <p className="mb-1 text-sm font-semibold leading-snug">{post.title}</p>
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{excerpt}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <HeartIcon className="size-3.5" />
                      <span>{post.likeCount}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="service-requests-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="service-requests-heading"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              სერვის მოთხოვნები
            </h2>
            <div className="flex items-center gap-2">
              {serviceRequests.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/services/my-requests">
                    ყველა
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/services/request">
                  <PlusIcon className="size-4" />
                  ახ. მოთხ.
                </Link>
              </Button>
            </div>
          </div>
          {serviceRequests.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                title="მოთხოვნები არ არის"
                description="სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია."
              />
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {serviceRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="truncate text-sm">{req.categoryName}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={toStatusPill(req.status)} />
                    <time
                      dateTime={req.createdAt}
                      className="hidden text-xs text-muted-foreground sm:inline"
                    >
                      {new Intl.DateTimeFormat('ka', {
                        day: '2-digit',
                        month: 'short',
                      }).format(new Date(req.createdAt))}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {subscribedClubs.length > 0 ? (
          <section aria-labelledby="subscribed-clubs-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="subscribed-clubs-heading"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                გამოწერილი კლუბები
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clubs">
                  ყველა
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {subscribedClubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  {club.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      className="size-6 rounded object-cover"
                    />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                      {club.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="font-medium">{club.name}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
