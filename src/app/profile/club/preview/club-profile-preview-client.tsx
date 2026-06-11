'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import {
  ArrowLeftIcon,
  EyeIcon,
  StarIcon,
  MapPinIcon,
  GlobeIcon,
  CalendarIcon,
  ShieldIcon,
  UsersIcon,
} from '@/components/icons';
import { COUNTRIES } from '@/lib/onboarding/schemas';
import { buildMapEmbedSrc } from '@/lib/club-profile/map-embed';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type HistoryEvent = {
  id: string;
  year: number;
  title: string;
  description?: string;
};

type RosterEntry = {
  id: string;
  playerName: string;
  position?: string;
  jerseyNumber?: number;
};

type ClubProfileData = {
  name: string;
  foundedYear?: number;
  country?: string;
  city?: string;
  league?: string;
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
  shortlistCount: number;
  historyEvents: HistoryEvent[];
  rosterEntries: RosterEntry[];
};

type ClubProfilePreviewClientProps = {
  currentPath: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
  };
  profile: ClubProfileData;
};

type Tab = 'bio' | 'roster' | 'stadium' | 'news';

const TABS: { id: Tab; label: string }[] = [
  { id: 'bio', label: 'ისტ. / ბიო' },
  { id: 'roster', label: 'შემ. სია' },
  { id: 'stadium', label: 'სტ. ინფ.' },
  { id: 'news', label: 'სიახლეები' },
];

// ── Root component ────────────────────────────────────────────────────────────

export function ClubProfilePreviewClient({
  currentPath,
  user,
  profile,
}: ClubProfilePreviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab: Tab =
    rawTab === 'roster' || rawTab === 'stadium' || rawTab === 'news' ? rawTab : 'bio';

  function handleTabChange(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'bio') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`${currentPath}?${params.toString()}`);
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const countryLabel = COUNTRIES.find((c) => c.code === profile.country)?.label ?? profile.country;

  return (
    <AppShell role="club" currentPath={currentPath} user={user} onSignOut={handleSignOut}>
      <div className="mx-auto max-w-[900px]">
        {/* ── Preview / completion banner ─────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-card border border-brand-400/25 bg-brand-400/8 px-4 py-3 shadow-card">
          <div className="flex items-center gap-2.5">
            <EyeIcon className="size-4 shrink-0 text-brand-300" />
            <p className="text-[13px] text-ink-200">
              <span className="font-semibold text-ink-50">პრევიუ — ფეხბურთელების ხედვა.</span> ასე
              გამოიყურება შენი კლუბის პროფილი.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/club/edit">
              <ArrowLeftIcon className="size-3.5" />
              რედ. დაბრუნება
            </Link>
          </Button>
        </div>

        {/* ── Public hero card ────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          {/* Cover / banner */}
          {profile.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverUrl}
              alt="სტ. / გარეკანი"
              className="h-44 w-full object-cover opacity-50 sm:h-52"
            />
          ) : (
            <div className="h-36 w-full bg-gradient-to-br from-accent-400/10 via-ink-900/60 to-ink-900" />
          )}

          <div className="px-5 pb-6 sm:px-7">
            {/* Logo + identity */}
            <div className="-mt-12 flex flex-wrap items-end gap-4">
              {/* Club logo */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] border-4 border-ink-900 bg-accent-400/15 text-accent-300 shadow-float">
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logoUrl}
                    alt={`${profile.name} ლოგო`}
                    className="h-full w-full rounded-[16px] object-contain"
                  />
                ) : (
                  <ShieldIcon className="size-11 stroke-[1.5]" />
                )}
              </div>

              <div className="mb-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-50 sm:text-[28px]">
                    {profile.name}
                  </h1>
                  {profile.verificationStatus === 'verified' && (
                    <VerificationBadge status="verified" />
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-400">
                  {(profile.city || countryLabel) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3.5 text-ink-500" />
                      {[profile.city, countryLabel].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {profile.foundedYear && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="size-3.5 text-ink-500" />
                      დაარ. {profile.foundedYear}
                    </span>
                  )}
                  {profile.league && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-accent-400/15 px-2 py-0.5 font-semibold text-accent-300">
                      {profile.league}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-5 flex items-center gap-5 border-t border-ink-800 pt-4 text-[13px] text-ink-400">
              <span className="flex items-center gap-1.5">
                <EyeIcon className="size-3.5" />
                <span className="font-semibold text-ink-50">{profile.profileViewCount}</span>
                ნახვები
              </span>
              <span className="flex items-center gap-1.5">
                <StarIcon className="size-3.5" />
                <span className="font-semibold text-ink-50">{profile.shortlistCount}</span>
                შენახვები
              </span>
              {profile.rosterEntries.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="size-3.5" />
                  <span className="font-semibold text-ink-50">{profile.rosterEntries.length}</span>
                  მოთ.
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="mt-5 flex gap-1 border-b border-ink-800">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'relative -mb-px px-4 py-3 text-[13.5px] font-medium transition-colors',
                    activeTab === tab.id ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200',
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pt-5">
              {activeTab === 'bio' && (
                <BioTab
                  bio={profile.bio}
                  historyEvents={profile.historyEvents}
                  officialWebsite={profile.officialWebsite}
                  stadiumName={profile.stadiumName}
                  stadiumCapacity={profile.stadiumCapacity}
                />
              )}
              {activeTab === 'roster' && <RosterTab entries={profile.rosterEntries} />}
              {activeTab === 'stadium' && (
                <StadiumTab
                  stadiumName={profile.stadiumName}
                  stadiumCapacity={profile.stadiumCapacity}
                  stadiumAddress={profile.stadiumAddress}
                  stadiumMapUrl={profile.stadiumMapUrl}
                />
              )}
              {activeTab === 'news' && <NewsTab />}
            </div>
          </div>
        </div>

        {/* ── Bottom edit link ─────────────────────────────────────────────── */}
        <div className="mt-8 flex justify-center pb-4">
          <Button variant="outline" asChild>
            <Link href="/profile/club/edit">
              <ArrowLeftIcon className="size-4" />
              პროფილის რედაქტირებაზე დაბრუნება
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

// ── Bio tab ───────────────────────────────────────────────────────────────────

function BioTab({
  bio,
  historyEvents,
  officialWebsite,
  stadiumName,
  stadiumCapacity,
}: {
  bio?: string;
  historyEvents: HistoryEvent[];
  officialWebsite?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      {/* Main column */}
      <div className="space-y-5">
        {bio ? (
          <section aria-labelledby="bio-heading">
            <SectionLabel id="bio-heading">კლუბის შესახებ</SectionLabel>
            <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4">
              <p className="text-[14.5px] leading-[1.7] text-ink-300 whitespace-pre-line">{bio}</p>
            </div>
          </section>
        ) : null}

        {historyEvents.length > 0 ? (
          <section aria-labelledby="history-heading">
            <SectionLabel id="history-heading">ისტ. მოვლენები</SectionLabel>
            <ol className="relative space-y-4 pl-6">
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-ink-800" />
              {historyEvents.map((event, i) => (
                <li key={event.id} className="relative">
                  <span
                    className={cn(
                      'absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-ink-900',
                      i === 0 ? 'bg-brand-400' : 'bg-ink-700',
                    )}
                  />
                  <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-pill bg-brand-400/15 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand-300">
                        {event.year}
                      </span>
                      <p className="text-[14.5px] font-semibold text-ink-50">{event.title}</p>
                    </div>
                    {event.description ? (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {officialWebsite ? (
          <section aria-labelledby="contact-heading">
            <SectionLabel id="contact-heading">კონტაქტი</SectionLabel>
            <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4">
              <a
                href={officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13.5px] text-brand-300 hover:text-brand-200 hover:underline break-all"
              >
                <GlobeIcon className="size-4 shrink-0" />
                {officialWebsite}
              </a>
            </div>
          </section>
        ) : null}

        {!bio && historyEvents.length === 0 && !officialWebsite ? (
          <div className="rounded-card border border-dashed border-ink-700 bg-ink-900 p-8 text-center">
            <p className="text-[13px] text-ink-500">
              ბიო / ისტორია ჯერ არ არის შევსებული. გადადი{' '}
              <Link href="/profile/club/edit" className="text-brand-300 hover:underline">
                პროფილის რედაქტირებაზე
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        {stadiumName || typeof stadiumCapacity === 'number' ? (
          <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4">
            <SectionLabel>სტადიონი</SectionLabel>
            {stadiumName && <p className="text-[14px] font-semibold text-ink-100">{stadiumName}</p>}
            {typeof stadiumCapacity === 'number' && (
              <p className="text-[12.5px] text-ink-500">
                ტევადობა {stadiumCapacity.toLocaleString()} ადგ.
              </p>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

// ── Roster tab ────────────────────────────────────────────────────────────────

function RosterTab({ entries }: { entries: RosterEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink-700 bg-ink-900 p-8 text-center">
        <p className="text-[13px] text-ink-500">
          შემადგენლობა ჯერ არ არის დამატებული. გადადი{' '}
          <Link href="/profile/club/edit" className="text-brand-300 hover:underline">
            პროფილის რედაქტირებაზე
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="roster-heading">
      <SectionLabel id="roster-heading">მიმდინარე შემადგენლობა</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 rounded-card border border-ink-800 bg-ink-950/40 p-3.5 transition-colors hover:border-ink-700"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-ink-800 font-mono text-[14px] font-bold tabular-nums text-ink-300">
              {entry.jerseyNumber != null ? entry.jerseyNumber : '—'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-ink-50">{entry.playerName}</p>
              {entry.position ? (
                <span className="mt-0.5 inline-block rounded-pill bg-iris-400/15 px-2 py-0.5 text-[10.5px] font-bold text-iris-300">
                  {entry.position}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Stadium tab ───────────────────────────────────────────────────────────────

function StadiumTab({
  stadiumName,
  stadiumCapacity,
  stadiumAddress,
  stadiumMapUrl,
}: {
  stadiumName?: string;
  stadiumCapacity?: number;
  stadiumAddress?: string;
  stadiumMapUrl?: string;
}) {
  const hasAny = stadiumName || stadiumCapacity || stadiumAddress || stadiumMapUrl;

  if (!hasAny) {
    return (
      <div className="rounded-card border border-dashed border-ink-700 bg-ink-900 p-8 text-center">
        <p className="text-[13px] text-ink-500">
          სტადიონის ინფო ჯერ არ არის შევსებული. გადადი{' '}
          <Link href="/profile/club/edit" className="text-brand-300 hover:underline">
            პროფილის რედაქტირებაზე
          </Link>
          .
        </p>
      </div>
    );
  }

  const embedSrc = buildMapEmbedSrc(stadiumMapUrl);

  return (
    <section aria-labelledby="stadium-heading">
      <SectionLabel id="stadium-heading">სტადიონი</SectionLabel>
      <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4 space-y-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stadiumName && (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                სახელი
              </dt>
              <dd className="mt-1 text-[14px] font-semibold text-ink-100">{stadiumName}</dd>
            </div>
          )}
          {typeof stadiumCapacity === 'number' && (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                ტევადობა
              </dt>
              <dd className="mt-1 text-[14px] font-semibold text-ink-100">
                {stadiumCapacity.toLocaleString()} ადგ.
              </dd>
            </div>
          )}
          {stadiumAddress && (
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                მისამართი
              </dt>
              <dd className="mt-1 flex items-start gap-1.5 text-[13.5px] font-medium text-ink-100">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-ink-500" />
                {stadiumAddress}
              </dd>
            </div>
          )}
        </dl>

        {embedSrc ? (
          <div className="overflow-hidden rounded-card border border-ink-800">
            <iframe
              src={embedSrc}
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="სტადიონის რუკა"
            />
          </div>
        ) : stadiumMapUrl ? (
          <a
            href={stadiumMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[13.5px] text-brand-300 hover:underline break-all"
          >
            <MapPinIcon className="size-4 shrink-0" />
            Google Maps-ზე ნახვა
          </a>
        ) : null}
      </div>
    </section>
  );
}

// ── News tab ──────────────────────────────────────────────────────────────────

function NewsTab() {
  return (
    <div className="rounded-card border border-dashed border-ink-700 bg-ink-900 p-8 text-center">
      <p className="text-[13px] text-ink-500">
        სიახლეების ფუნქცია მომდევნო ფაზაში გახდება ხელმისაწვდომი.
      </p>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionLabel({ id, children }: { id?: string; children?: React.ReactNode }) {
  return (
    <p id={id} className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
      {children}
    </p>
  );
}
