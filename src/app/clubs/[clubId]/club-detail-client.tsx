'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import {
  BellIcon,
  EyeIcon,
  GlobeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  HeartIcon,
} from '@/components/icons';
import { toggleSubscription } from '@/lib/clubs/actions';
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
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toGoogleMapsEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already an embed URL
  if (trimmed.includes('maps.google.com/maps?') && trimmed.includes('output=embed')) {
    return trimmed;
  }
  if (trimmed.includes('google.com/maps/embed')) {
    return trimmed;
  }

  // Coordinates: "41.7151,44.8271" or "41.7151 44.8271"
  const coordMatch = trimmed.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
  }

  // Standard Google Maps URL — try to convert
  if (trimmed.includes('google.com/maps') || trimmed.includes('maps.google.com')) {
    try {
      const u = new URL(trimmed);
      // Extract @lat,lng from path
      const atMatch = u.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (atMatch) {
        return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`;
      }
      // Try q param
      const q = u.searchParams.get('q');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
      }
    } catch {
      // fall through
    }
  }

  // Treat as a generic query (address string)
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

type ClubDetailClientProps = {
  viewerRole: string | null;
  activeTab: string;
  club: ClubData;
  isSubscribed: boolean;
};

export function ClubDetailClient({
  viewerRole,
  activeTab: activeTabRaw,
  club,
  isSubscribed: initialIsSubscribed,
}: ClubDetailClientProps) {
  const router = useRouter();
  const activeTab = toValidTab(activeTabRaw);

  const canSubscribe = viewerRole === 'FOOTBALLER';
  const [isSubscribed, setIsSubscribed] = React.useState(initialIsSubscribed);
  const [subscribePending, setSubscribePending] = React.useState(false);

  function handleTabChange(tab: Tab) {
    const url = tab === 'history' ? `/clubs/${club.id}` : `/clubs/${club.id}?tab=${tab}`;
    router.push(url);
  }

  async function handleSubscribeToggle() {
    if (!canSubscribe) {
      router.push('/auth/signin');
      return;
    }
    if (subscribePending) return;
    setSubscribePending(true);
    const next = !isSubscribed;
    setIsSubscribed(next);

    const result = await toggleSubscription(club.id);
    if (result.status === 'error') {
      setIsSubscribed(!next);
    } else {
      setIsSubscribed(result.subscribed);
    }
    setSubscribePending(false);
  }

  const metaParts = [
    club.city,
    club.country,
    club.league,
    club.foundedYear ? `${club.foundedYear} დაარ.` : null,
  ].filter(Boolean) as string[];

  const embedUrl = club.stadiumMapUrl ? toGoogleMapsEmbedUrl(club.stadiumMapUrl) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
      {/* Back link */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clubs">
            <ArrowLeftIcon className="size-4" />
            კლუბებზე დაბრუნება
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {club.coverUrl ? (
          <div className="relative aspect-[4/1] w-full overflow-hidden bg-muted">
            <Image
              src={club.coverUrl}
              alt={`${club.name} cover`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
            />
          </div>
        ) : (
          <div className="h-24 bg-muted/50 sm:h-32" />
        )}

        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
          <div className="shrink-0">
            <Avatar className="size-20 rounded-xl shadow-sm sm:size-24">
              {club.logoUrl ? (
                <AvatarImage
                  src={club.logoUrl}
                  alt={`${club.name} ლოგო`}
                  className="rounded-xl object-contain"
                />
              ) : null}
              <AvatarFallback className="rounded-xl bg-muted text-lg font-bold text-muted-foreground">
                {clubInitials(club.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold leading-tight">{club.name}</h1>
                {metaParts.length > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
                    {metaParts.join(' · ')}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(canSubscribe || viewerRole === null) && (
                  <Button
                    type="button"
                    variant={isSubscribed ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleSubscribeToggle}
                    disabled={subscribePending}
                    aria-pressed={isSubscribed}
                  >
                    <BellIcon
                      className={cn('size-4', isSubscribed ? 'fill-current' : '')}
                      aria-hidden="true"
                    />
                    {isSubscribed ? 'გამოწ.' : 'გამოწ. გაუქ.'}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <VerificationBadge status={club.verificationStatus} />
              <span className="flex items-center gap-1">
                <EyeIcon className="size-3.5" aria-hidden="true" />
                {club.profileViewCount} ნახვა
              </span>
              <span className="flex items-center gap-1">
                <BellIcon className="size-3.5" aria-hidden="true" />
                {club.subscriberCount} გამ.
              </span>
            </div>

            {club.officialWebsite && (
              <div className="flex items-center gap-1 text-xs">
                <GlobeIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a
                  href={club.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {club.officialWebsite.replace(/^https?:\/\//, '')}
                  <ExternalLinkIcon className="ml-0.5 inline size-3" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="კლუბის ტაბები">
          {(Object.entries(TAB_LABELS) as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'history' && <HistoryTab bio={club.bio} historyEvents={club.historyEvents} />}
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
    </div>
  );
}

// ── Tab sub-components ────────────────────────────────────────────────────────

function HistoryTab({ bio, historyEvents }: { bio?: string; historyEvents: HistoryEvent[] }) {
  const hasContent = bio || historyEvents.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        ისტორია / ბიო ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bio && (
        <section
          aria-labelledby="bio-heading"
          className="rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <h2
            id="bio-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            ბიო / ისტორია
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{bio}</p>
        </section>
      )}

      {historyEvents.length > 0 && (
        <section
          aria-labelledby="history-heading"
          className="rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <h2
            id="history-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            მნიშვნელოვანი თარიღები
          </h2>
          <ul className="flex flex-col gap-3">
            {historyEvents.map((event) => (
              <li key={event.id} className="flex gap-3 text-sm">
                <span className="w-12 shrink-0 font-semibold tabular-nums text-primary">
                  {event.year}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{event.title}</span>
                  {event.description && (
                    <span className="text-xs text-muted-foreground">{event.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RosterTab({ rosterEntries }: { rosterEntries: RosterEntry[] }) {
  if (rosterEntries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        შემადგენლობა ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <section aria-labelledby="roster-heading" className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2
          id="roster-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          მიმდინარე შემადგენლობა
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="w-12 px-4 py-2.5 text-center font-medium sm:px-5">#</th>
              <th className="px-4 py-2.5 text-left font-medium sm:px-5">სახელი</th>
              <th className="px-4 py-2.5 text-left font-medium sm:px-5">პოზ.</th>
            </tr>
          </thead>
          <tbody>
            {rosterEntries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-2.5 text-center tabular-nums text-muted-foreground sm:px-5">
                  {entry.jerseyNumber ?? '—'}
                </td>
                <td className="px-4 py-2.5 font-medium sm:px-5">{entry.playerName}</td>
                <td className="px-4 py-2.5 text-muted-foreground sm:px-5">
                  {entry.position ?? '—'}
                </td>
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
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        სტადიონის ინფო ჯერ არ არის დამატებული.
      </div>
    );
  }

  return (
    <section
      aria-labelledby="stadium-heading"
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <h2
        id="stadium-heading"
        className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        სტადიონის ინფო
      </h2>

      <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {stadiumName && (
          <>
            <dt className="font-medium text-muted-foreground">სახ.</dt>
            <dd>{stadiumName}</dd>
          </>
        )}
        {stadiumCapacity && (
          <>
            <dt className="font-medium text-muted-foreground">ტევ.</dt>
            <dd>{stadiumCapacity.toLocaleString()} ადგილი</dd>
          </>
        )}
        {stadiumAddress && (
          <>
            <dt className="font-medium text-muted-foreground">მის.</dt>
            <dd>{stadiumAddress}</dd>
          </>
        )}
      </dl>

      {embedUrl && (
        <div className="aspect-video overflow-hidden rounded-lg border border-border">
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
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
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
          <article className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30 sm:p-5">
            <h3 className="text-sm font-semibold leading-snug">{post.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
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
