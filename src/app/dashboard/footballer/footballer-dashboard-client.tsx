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
import {
  EyeIcon,
  StarIcon,
  MessageCircleIcon,
  TrendingUpIcon,
  PlusIcon,
  ArrowRightIcon,
  HeartIcon,
  ShieldIcon,
} from '@/components/icons';
import { formatRelativeTime } from '@/lib/format-relative-time';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';

// BookmarkIcon re-exported from lucide via icons.tsx if present, otherwise inline:
function BookmarkIcon(props: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

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

/** Section label matching the artboard: small-caps, tracked, ink-500 */
function SectionLabel({
  children,
  action,
  id,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 id={id} className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** KPI card — icon square + mono value + delta pill + label */
function KpiCard({
  icon: Icon,
  value,
  delta,
  label,
  primary = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  delta?: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <div className="group rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
            primary ? 'bg-brand-400/15 text-brand-300' : 'bg-ink-800 text-ink-400'
          }`}
          aria-hidden="true"
        >
          <Icon className="size-[17px]" />
        </span>
        {delta ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-success-400/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-success-300">
            <TrendingUpIcon className="size-[11px]" aria-hidden="true" />
            {delta}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-[28px] font-bold leading-none tracking-tight text-ink-50 tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[12.5px] text-ink-400">{label}</p>
    </div>
  );
}

/** Newsfeed post card — artboard style */
function FeedCard({ post }: { post: NewsfeedPost }) {
  const initials = post.club.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const excerpt = post.body.length > 180 ? post.body.slice(0, 180).trimEnd() + '…' : post.body;

  return (
    <article className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card transition-colors hover:border-ink-700">
      {/* head */}
      <div className="flex items-center gap-3 px-5 pt-4">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] bg-accent-400/15 text-accent-300">
          {post.club.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.club.logoUrl}
              alt={post.club.name}
              className="h-[42px] w-[42px] rounded-[11px] object-contain"
            />
          ) : (
            <span className="text-[13px] font-bold">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14px] font-semibold text-ink-50">{post.club.name}</p>
            <ShieldIcon className="size-[13px] text-accent-400" aria-hidden="true" />
          </div>
          <p className="text-[11.5px] text-ink-500">{formatRelativeTime(post.createdAt)}</p>
        </div>
      </div>

      {/* body */}
      <div className="px-5 pt-3">
        <Link href={`/clubs/${post.club.id}/posts/${post.id}`} className="group/title outline-none">
          <h3 className="font-display text-[16.5px] font-bold leading-snug tracking-tight text-ink-50 group-hover/title:text-brand-300 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-400">{excerpt}</p>
      </div>

      {/* actions */}
      <div className="mt-4 flex items-center gap-1 border-t border-ink-800 px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-btn px-3 py-1.5 text-[13px] font-medium text-ink-400">
          <HeartIcon className="size-[17px]" aria-hidden="true" />
          <span className="tabular-nums">{post.likeCount}</span>
          <span className="text-ink-500">მოწონება</span>
        </div>
        <Link
          href={`/clubs/${post.club.id}/posts/${post.id}`}
          aria-label={`${post.title} — სრულად ნახვა`}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-btn text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
        >
          <BookmarkIcon className="size-4" />
        </Link>
      </div>
    </article>
  );
}

/** Service-request row */
function ServiceRequestRow({ req }: { req: DashboardServiceRequest }) {
  const date = new Intl.DateTimeFormat('ka', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(req.createdAt));

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-800/40">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-ink-800 text-ink-300">
        <MessageCircleIcon className="size-[17px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink-100">{req.categoryName}</p>
        <p className="truncate font-mono text-[11px] tabular-nums text-ink-500">
          {req.requestCode} · {date}
        </p>
      </div>
      <StatusPill status={toStatusPill(req.status)} />
    </div>
  );
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
  const [showAllPosts, setShowAllPosts] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const kpiStats = [
    {
      icon: EyeIcon,
      value: String(stats.views ?? 0),
      delta: '+12%',
      label: 'პროფილის ნახვები',
      primary: true,
    },
    {
      icon: StarIcon,
      value: String(stats.saves ?? 0),
      delta: stats.saves ? '+2' : undefined,
      label: 'შენახული პროფილი',
      primary: false,
    },
    {
      icon: MessageCircleIcon,
      value: String(stats.unreadMessages ?? 0),
      delta: (stats.unreadMessages ?? 0) > 0 ? 'ახალი' : undefined,
      label: 'შეტყობინებები',
      primary: false,
    },
  ];

  const visiblePosts = showAllPosts ? newsfeedPosts : newsfeedPosts.slice(0, 2);

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
      {/* ── Greeting ── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12.5px] text-ink-500">
            {new Intl.DateTimeFormat('ka-GE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold tracking-tight text-ink-50">
            გამარჯობა, {user.name.split(' ')[0]} 👋
          </h1>
        </div>
        <Button variant="default" size="default" asChild>
          <Link href="/services/request">
            <PlusIcon className="size-[17px]" />
            სერვისის მოთხოვნა
          </Link>
        </Button>
      </div>

      {/* ── Profile-completion banner ── */}
      {!bannerDismissed && user.profileCompletion < 100 ? (
        <div className="mb-6">
          <ProfileCompletionBanner
            percent={user.profileCompletion}
            missingFields={profileMissingFields}
            onComplete={() => router.push('/profile/edit')}
            onDismiss={() => setBannerDismissed(true)}
          />
        </div>
      ) : null}

      {/* ── KPI strip ── */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpiStats.map((s) => (
          <KpiCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Two-column: feed + aside ── */}
      <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
        {/* ──── Feed ──── */}
        <section aria-labelledby="newsfeed-heading">
          <SectionLabel
            id="newsfeed-heading"
            action={
              <Link
                href="/clubs"
                className="text-[12px] font-medium text-accent-300 transition-colors hover:text-accent-200 outline-none focus-visible:underline"
              >
                ყველა კლუბი
              </Link>
            }
          >
            კლუბების ფიდი
          </SectionLabel>

          {newsfeedPosts.length === 0 ? (
            <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
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
            <>
              <div className="space-y-4">
                {visiblePosts.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>

              {!showAllPosts && newsfeedPosts.length > 2 ? (
                <button
                  type="button"
                  onClick={() => setShowAllPosts(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-ink-700 py-3 text-[13px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                >
                  მეტის ჩვენება
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : null}
            </>
          )}
        </section>

        {/* ──── Aside ──── */}
        <aside className="space-y-7">
          {/* Service requests */}
          <section aria-labelledby="service-requests-heading">
            <SectionLabel
              id="service-requests-heading"
              action={
                serviceRequests.length > 0 ? (
                  <Link
                    href="/services/my-requests"
                    className="text-[12px] font-medium text-accent-300 transition-colors hover:text-accent-200 outline-none focus-visible:underline"
                  >
                    ყველა
                  </Link>
                ) : undefined
              }
            >
              სერვისის მოთხოვნები
            </SectionLabel>

            {serviceRequests.length === 0 ? (
              <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <EmptyState
                  title="მოთხოვნები არ არის"
                  description="სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია."
                />
                <Link
                  href="/services/request"
                  className="flex w-full items-center justify-center gap-2 border-t border-ink-800 py-3 text-[13px] font-medium text-brand-400 transition-colors hover:bg-brand-400/5 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                >
                  <PlusIcon className="size-4" />
                  ახალი მოთხოვნა
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <div className="divide-y divide-ink-800">
                  {serviceRequests.slice(0, 5).map((req) => (
                    <ServiceRequestRow key={req.id} req={req} />
                  ))}
                </div>
                <Link
                  href="/services/request"
                  className="flex w-full items-center justify-center gap-2 border-t border-ink-800 py-3 text-[13px] font-medium text-brand-400 transition-colors hover:bg-brand-400/5 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                >
                  <PlusIcon className="size-4" />
                  ახალი მოთხოვნა
                </Link>
              </div>
            )}
          </section>

          {/* Subscribed clubs */}
          {subscribedClubs.length > 0 ? (
            <section aria-labelledby="subscribed-clubs-heading">
              <SectionLabel
                id="subscribed-clubs-heading"
                action={
                  <Link
                    href="/clubs"
                    className="text-[12px] font-medium text-accent-300 transition-colors hover:text-accent-200 outline-none focus-visible:underline"
                  >
                    ყველა კლუბი
                  </Link>
                }
              >
                გამოწერილი კლუბები
              </SectionLabel>

              <div className="rounded-card border border-ink-800 bg-ink-900 p-3 shadow-card">
                <div className="space-y-1">
                  {subscribedClubs.map((club) => {
                    const abbr = club.name
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <Link
                        key={club.id}
                        href={`/clubs/${club.id}`}
                        className="flex items-center gap-3 rounded-btn px-2 py-2 transition-colors hover:bg-ink-800/50 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-400/15 text-accent-300 text-[11px] font-bold">
                          {club.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={club.logoUrl}
                              alt=""
                              className="h-9 w-9 rounded-[10px] object-contain"
                            />
                          ) : (
                            abbr
                          )}
                        </span>
                        <p className="truncate text-[13px] font-medium text-ink-100">{club.name}</p>
                        <span className="ml-auto rounded-pill border border-ink-700 px-2.5 py-1 text-[11px] font-medium text-ink-400">
                          გამოწერილი
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href="/clubs"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-btn border border-dashed border-ink-700 py-2.5 text-[12.5px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                >
                  <PlusIcon className="size-[15px]" />
                  მეტი კლუბის პოვნა
                </Link>
              </div>
            </section>
          ) : (
            <section aria-labelledby="subscribed-clubs-empty-heading">
              <SectionLabel id="subscribed-clubs-empty-heading">გამოწერილი კლუბები</SectionLabel>
              <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <EmptyState
                  title="კლუბები არ არის"
                  description="გამოწერე კლუბი, რომ მათი სიახლეები ნახო."
                  action={
                    <Button variant="default" size="sm" asChild>
                      <Link href="/clubs">
                        <ArrowRightIcon className="size-4" />
                        კლუბების ძიება
                      </Link>
                    </Button>
                  }
                />
              </div>
            </section>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
