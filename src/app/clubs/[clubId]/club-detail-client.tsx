'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import {
  BellIcon,
  EyeIcon,
  GlobeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  HeartIcon,
  UsersIcon,
} from '@/components/icons';
import { toggleSubscription } from '@/lib/clubs/actions';
import { buildMapEmbedSrc } from '@/lib/club-profile/map-embed';
import { cn } from '@/lib/utils';

type RosterEntry = {
  id: string;
  playerName: string;
  position?: string;
  jerseyNumber?: number;
};

type HistoryEvent = {
  id: string;
  year: number;
  title: string;
  description?: string;
};

type Post = {
  id: string;
  title: string;
  body: string;
  likeCount: number;
  createdAt: string;
};

type ClubData = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  league?: string;
  foundedYear?: number;
  officialWebsite?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  stadiumAddress?: string;
  stadiumMapUrl?: string;
  logoUrl?: string;
  coverUrl?: string;
  bio?: string;
  verificationStatus: VerificationStatus;
  profileViewCount: number;
  subscriberCount: number;
  rosterEntries: RosterEntry[];
  historyEvents: HistoryEvent[];
  posts: Post[];
};

type Tab = 'history' | 'roster' | 'stadium' | 'news';

const TAB_LABELS: Record<Tab, string> = {
  history: 'ისტ. / ბიო',
  roster: 'შემ. სია',
  stadium: 'სტ. ინფ.',
  news: 'სიახლეები',
};

const VALID_TABS = new Set<Tab>(['history', 'roster', 'stadium', 'news']);

function toValidTab(raw: string | undefined): Tab {
  if (raw && VALID_TABS.has(raw as Tab)) return raw as Tab;
  return 'history';
}

function clubInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type ClubDetailClientProps = {
  shellRole: AppSidebarRole;
  shellUser: AppSidebarUser & { email?: string };
  userId: string;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
  viewerRole: string;
  activeTab: string;
  club: ClubData;
  isSubscribed: boolean;
};

// Design tokens used throughout
const SECTION_LABEL = 'text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500';
const CARD = 'rounded-card border border-ink-800 bg-ink-900 shadow-card';

export function ClubDetailClient({
  shellRole,
  shellUser,
  userId,
  sidebarStats,
  adminBadges,
  unreadNotifications,
  viewerRole,
  activeTab: activeTabRaw,
  club,
  isSubscribed: initialIsSubscribed,
}: ClubDetailClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const activeTab = toValidTab(activeTabRaw);
  const canSubscribe = viewerRole === 'FOOTBALLER';

  const [isSubscribed, setIsSubscribed] = React.useState(initialIsSubscribed);
  const [subscribePending, setSubscribePending] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function handleTabChange(tab: Tab) {
    const url = tab === 'history' ? `/clubs/${club.id}` : `/clubs/${club.id}?tab=${tab}`;
    router.push(url);
  }

  async function handleSubscribeToggle() {
    if (!canSubscribe) return;
    if (subscribePending) return;
    setSubscribePending(true);
    const next = !isSubscribed;
    setIsSubscribed(next);

    const result = await toggleSubscription(club.id);
    if (result.status === 'error') {
      setIsSubscribed(!next);
      showToast(result.message, 'error');
    } else {
      setIsSubscribed(result.subscribed);
      showToast(result.subscribed ? 'კლუბზე გამოიწ.' : 'გამ. გაუქ.');
    }
    setSubscribePending(false);
  }

  const metaParts = [
    club.city,
    club.country,
    club.league,
    club.foundedYear ? `${club.foundedYear} დაარ.` : null,
  ].filter(Boolean) as string[];

  const embedUrl = buildMapEmbedSrc(club.stadiumMapUrl);

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
      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-pill border px-4 py-2.5 text-[13px] font-medium shadow-float transition-all sm:bottom-6',
            toast.type === 'error'
              ? 'border-danger-400/30 bg-ink-900 text-danger-300'
              : 'border-brand-400/30 bg-ink-900 text-ink-100',
          )}
        >
          {toast.message}
        </div>
      ) : null}

      {/* Page container — max-w-[1200px] matching artboard */}
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-ink-500">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-auto p-0 text-ink-500 hover:text-ink-200 hover:bg-transparent"
          >
            <Link href="/clubs">
              <ArrowLeftIcon className="size-4" />
              კლუბები
            </Link>
          </Button>
          <ChevronRightIcon className="size-3.5 text-ink-700" aria-hidden="true" />
          <span className="font-medium text-ink-300">{club.name}</span>
        </div>

        {/* ── HERO CARD ── */}
        <div className={cn(CARD, 'overflow-hidden')}>
          {/* Cover strip */}
          <div className="relative h-44 sm:h-56">
            {club.coverUrl ? (
              <Image
                src={club.coverUrl}
                alt={`${club.name} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-accent-900 to-ink-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent" />
          </div>

          <div className="px-5 pb-5 sm:px-7">
            {/* Crest + name row */}
            <div className="flex flex-wrap items-end gap-5">
              {/* Club crest / logo — overlaps cover */}
              <div className="-mt-7 shrink-0">
                <Avatar className="size-24 rounded-[20px] shadow-float ring-4 ring-ink-900 sm:size-28">
                  {club.logoUrl ? (
                    <AvatarImage
                      src={club.logoUrl}
                      alt={`${club.name} ლოგო`}
                      className="rounded-[20px] object-contain"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-[20px] bg-gradient-to-br from-accent-400 to-accent-600 text-lg font-bold text-ink-950">
                    {clubInitials(club.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name + meta */}
              <div className="mb-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-[28px] font-bold tracking-tight text-ink-50 leading-tight">
                    {club.name}
                  </h1>
                  <VerificationBadge status={club.verificationStatus} />
                </div>
                {metaParts.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-400">
                    <MapPinIcon className="size-3.5 shrink-0 text-ink-500" aria-hidden="true" />
                    {metaParts.join(' · ')}
                  </p>
                )}
                {club.league && (
                  <div className="mt-2">
                    <span className="rounded-pill bg-accent-400/15 px-2.5 py-0.5 text-[12px] font-semibold text-accent-300">
                      {club.league}
                    </span>
                  </div>
                )}
              </div>

              {/* Subscribe button */}
              <div className="mb-1 flex items-center gap-2.5">
                {canSubscribe && (
                  <Button
                    type="button"
                    variant={isSubscribed ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleSubscribeToggle}
                    disabled={subscribePending}
                    aria-pressed={isSubscribed}
                    className={cn(
                      isSubscribed &&
                        'border-brand-400/40 text-brand-300 hover:border-brand-400/60',
                    )}
                  >
                    <BellIcon
                      className={cn('size-4', isSubscribed ? 'fill-current' : '')}
                      aria-hidden="true"
                    />
                    {isSubscribed ? 'გამოწ. გაუქ.' : 'გამოწერა'}
                  </Button>
                )}
              </div>
            </div>

            {/* Meta strip */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-800 pt-4 text-[13px]">
              <span className="flex items-center gap-2 text-ink-400">
                <UsersIcon className="size-4 text-ink-500" aria-hidden="true" />
                <span>{club.subscriberCount} გამ.</span>
              </span>
              <span className="flex items-center gap-2 text-ink-400">
                <EyeIcon className="size-4 text-ink-500" aria-hidden="true" />
                <span>{club.profileViewCount} ნახვა</span>
              </span>
              {club.officialWebsite && (
                <a
                  href={club.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-accent-300 transition-colors hover:text-accent-200"
                >
                  <GlobeIcon className="size-4" aria-hidden="true" />
                  {club.officialWebsite.replace(/^https?:\/\//, '')}
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── MAIN COLUMN ── */}
          <main className="min-w-0 space-y-0">
            {/* Tab nav */}
            <div className="mb-4">
              <nav
                className="-mb-px flex gap-1 overflow-x-auto rounded-btn border border-ink-700 bg-ink-900 p-1"
                aria-label="კლუბის ტაბები"
              >
                {(Object.entries(TAB_LABELS) as [Tab, string][]).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors',
                      activeTab === tab
                        ? 'bg-ink-800 text-ink-50'
                        : 'text-ink-400 hover:text-ink-100',
                    )}
                    aria-current={activeTab === tab ? 'page' : undefined}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'history' && (
              <HistoryTab bio={club.bio} historyEvents={club.historyEvents} />
            )}
            {activeTab === 'roster' && <RosterTab rosterEntries={club.rosterEntries} />}
            {activeTab === 'stadium' && (
              <StadiumTab
                stadiumName={club.stadiumName}
                stadiumCapacity={club.stadiumCapacity}
                stadiumAddress={club.stadiumAddress}
                embedUrl={embedUrl}
              />
            )}
            {activeTab === 'news' && <NewsTab clubId={club.id} posts={club.posts} />}
          </main>

          {/* ── ASIDE COLUMN ── */}
          <aside className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
            {/* Club details */}
            <div className={cn(CARD, 'p-5')}>
              <h3 className={cn(SECTION_LABEL, 'mb-3')}>დეტალები</h3>
              <div className="space-y-2.5 text-[13px]">
                {club.league && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-500">ლიგა</span>
                    <span className="text-right font-medium text-ink-100">{club.league}</span>
                  </div>
                )}
                {club.city && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-500">ქალაქი</span>
                    <span className="text-right font-medium text-ink-100">{club.city}</span>
                  </div>
                )}
                {club.country && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-500">ქვეყანა</span>
                    <span className="text-right font-medium text-ink-100">{club.country}</span>
                  </div>
                )}
                {club.foundedYear && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-500">დაარსდა</span>
                    <span className="font-mono text-right font-medium tabular-nums text-ink-100">
                      {club.foundedYear}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subscribe CTA */}
            {canSubscribe && (
              <div className="rounded-card border border-brand-400/25 bg-gradient-to-br from-brand-400/10 to-ink-900 p-5 shadow-card">
                <h3 className="font-display text-[15px] font-bold text-ink-50">
                  გამოიწერე სიახლეები
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400">
                  მიიღე კლუბის სელექციები და განცხადებები პირდაპირ შენს ფიდში.
                </p>
                <Button
                  type="button"
                  variant={isSubscribed ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleSubscribeToggle}
                  disabled={subscribePending}
                  className={cn(
                    'mt-3.5 w-full',
                    isSubscribed && 'border-brand-400/40 text-brand-300',
                  )}
                >
                  <BellIcon className="size-4" aria-hidden="true" />
                  {isSubscribed ? 'გამოწ. გაუქ.' : 'გამოწერა'}
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

// ── Tab sub-components ────────────────────────────────────────────────────────

function HistoryTab({ bio, historyEvents }: { bio?: string; historyEvents: HistoryEvent[] }) {
  const hasContent = bio || historyEvents.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-card border border-ink-800 bg-ink-900 p-8 text-center text-sm text-ink-500">
        ისტორია / ბიო ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bio && (
        <section
          aria-labelledby="bio-heading"
          className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card sm:p-6"
        >
          <h2
            id="bio-heading"
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500"
          >
            ბიო / ისტორია
          </h2>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-300">{bio}</p>
        </section>
      )}

      {historyEvents.length > 0 && (
        <section
          aria-labelledby="history-heading"
          className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card sm:p-6"
        >
          <h2
            id="history-heading"
            className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500"
          >
            მნიშვნელოვანი თარიღები
          </h2>
          <div className="space-y-0">
            {historyEvents.map((event, i) => (
              <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {i < historyEvents.length - 1 && (
                  <span
                    className="absolute left-[27px] top-12 h-full w-px bg-ink-800"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 flex size-14 shrink-0 flex-col items-center justify-center rounded-[12px] border border-ink-700 bg-ink-950 font-mono text-[13px] font-bold tabular-nums text-brand-300">
                  {event.year}
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-[15px] font-semibold text-ink-50">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-400">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RosterTab({ rosterEntries }: { rosterEntries: RosterEntry[] }) {
  if (rosterEntries.length === 0) {
    return (
      <div className="rounded-card border border-ink-800 bg-ink-900 p-8 text-center text-sm text-ink-500">
        შემადგენლობა ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <section
      aria-labelledby="roster-heading"
      className="rounded-card border border-ink-800 bg-ink-900 overflow-hidden shadow-card"
    >
      <div className="border-b border-ink-800 px-5 py-3.5">
        <h2
          id="roster-heading"
          className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500"
        >
          მიმდინარე შემადგენლობა
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-xs text-ink-500">
              <th className="w-12 px-4 py-2.5 text-center font-medium sm:px-5">#</th>
              <th className="px-4 py-2.5 text-left font-medium sm:px-5">სახელი</th>
              <th className="px-4 py-2.5 text-left font-medium sm:px-5">პოზ.</th>
            </tr>
          </thead>
          <tbody>
            {rosterEntries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-ink-800/50 last:border-0 transition-colors hover:bg-ink-800/40"
              >
                <td className="px-4 py-3 text-center font-mono tabular-nums text-ink-400 sm:px-5">
                  {entry.jerseyNumber ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium text-ink-100 sm:px-5">{entry.playerName}</td>
                <td className="px-4 py-3 text-ink-400 sm:px-5">{entry.position ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StadiumTab({
  stadiumName,
  stadiumCapacity,
  stadiumAddress,
  embedUrl,
}: {
  stadiumName?: string;
  stadiumCapacity?: number;
  stadiumAddress?: string;
  embedUrl: string | null;
}) {
  const hasInfo = stadiumName || stadiumCapacity || stadiumAddress || embedUrl;

  if (!hasInfo) {
    return (
      <div className="rounded-card border border-ink-800 bg-ink-900 p-8 text-center text-sm text-ink-500">
        სტადიონის ინფო ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <section
      aria-labelledby="stadium-heading"
      className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card sm:p-6"
    >
      <h2
        id="stadium-heading"
        className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500"
      >
        სტადიონის ინფო
      </h2>

      <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {stadiumName && (
          <>
            <dt className="font-medium text-ink-500">სახ.</dt>
            <dd className="text-ink-100">{stadiumName}</dd>
          </>
        )}
        {stadiumCapacity && (
          <>
            <dt className="font-medium text-ink-500">ტევ.</dt>
            <dd className="font-mono tabular-nums text-ink-100">
              {stadiumCapacity.toLocaleString()} ადგილი
            </dd>
          </>
        )}
        {stadiumAddress && (
          <>
            <dt className="font-medium text-ink-500">მის.</dt>
            <dd className="text-ink-100">{stadiumAddress}</dd>
          </>
        )}
      </dl>

      {embedUrl && (
        <div className="aspect-video overflow-hidden rounded-card border border-ink-800">
          <iframe
            src={embedUrl}
            title={`${stadiumName ?? 'სტადიონი'} — Google Maps`}
            className="size-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </section>
  );
}

function NewsTab({ clubId, posts }: { clubId: string; posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-card border border-ink-800 bg-ink-900 p-8 text-center text-sm text-ink-500">
        სიახლეები ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <section aria-labelledby="news-heading" className="space-y-3">
      <h2 id="news-heading" className="sr-only">
        სიახლეები
      </h2>
      {posts.map((post) => (
        <Link key={post.id} href={`/clubs/${clubId}/posts/${post.id}`} className="block">
          <article className="rounded-card border border-ink-800 bg-ink-900 p-4 transition-colors hover:bg-ink-800/40 hover:border-ink-700 sm:p-5 shadow-card">
            <h3 className="text-[15px] font-semibold leading-snug text-ink-50">{post.title}</h3>
            <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-ink-400">
              {post.body}
            </p>
            <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-500">
              <span className="flex items-center gap-1">
                <HeartIcon className="size-3" aria-hidden="true" />
                {post.likeCount}
              </span>
              <span>·</span>
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('ka-GE')}
              </time>
            </div>
          </article>
        </Link>
      ))}
    </section>
  );
}
