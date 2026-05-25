'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { ArrowLeftIcon, EyeIcon, StarIcon, MapPinIcon, GlobeIcon } from '@/components/icons';
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

  const metaParts = [
    profile.city,
    countryLabel,
    profile.league,
    profile.foundedYear ? `დაარ. ${profile.foundedYear}` : null,
  ].filter(Boolean);

  return (
    <AppShell role="club" currentPath={currentPath} user={user} onSignOut={handleSignOut}>
      <div className="max-w-3xl space-y-6">
        {/* ── Preview banner ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <EyeIcon className="size-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-medium">პრევიუ — ფეხბურთელების ხედვა.</span> ასე გამოიყურება
              შენი კლუბის პროფილი.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/club/edit">
              <ArrowLeftIcon className="size-3.5" />
              რედ. დაბრუნება
            </Link>
          </Button>
        </div>

        {/* ── Hero / cover ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {profile.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverUrl}
              alt="სტადიონი / გარეკანი"
              className="h-40 w-full object-cover sm:h-56"
            />
          ) : (
            <div className="h-28 w-full bg-gradient-to-br from-primary/10 to-muted" />
          )}

          <div className="px-5 pb-5">
            {/* Logo overlapping cover */}
            <div className="-mt-10 mb-4 flex items-end justify-between gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-xl border-4 border-card bg-muted shadow-sm flex items-center justify-center shrink-0">
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logoUrl}
                    alt={`${profile.name} ლოგო`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground/40">
                    {profile.name[0]}
                  </span>
                )}
              </div>
              <VerificationBadge status={profile.verificationStatus} />
            </div>

            {/* Name + meta */}
            <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
            {metaParts.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{metaParts.join(' · ')}</p>
            )}

            {/* Stats strip */}
            <div className="mt-4 flex items-center gap-5 border-t border-border pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <EyeIcon className="size-3.5" />
                <span className="font-semibold text-foreground">{profile.profileViewCount}</span>
                ნახვები
              </span>
              <span className="flex items-center gap-1.5">
                <StarIcon className="size-3.5" />
                <span className="font-semibold text-foreground">{profile.shortlistCount}</span>
                შენახვები
              </span>
            </div>
          </div>
        </div>

        {/* ── Tab navigation ─────────────────────────────────────────────── */}
        <div className="flex overflow-x-auto gap-1 rounded-xl border border-border bg-card p-1 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex-1 min-w-max rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab panels ────────────────────────────────────────────────── */}
        {activeTab === 'bio' && (
          <BioTab
            bio={profile.bio}
            historyEvents={profile.historyEvents}
            officialWebsite={profile.officialWebsite}
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

        {/* ── Bottom edit link ───────────────────────────────────────────── */}
        <div className="flex justify-center pb-4">
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
}: {
  bio?: string;
  historyEvents: HistoryEvent[];
  officialWebsite?: string;
}) {
  return (
    <div className="space-y-5">
      {bio ? (
        <section aria-labelledby="bio-heading">
          <SectionHeading id="bio-heading">ისტ. / ბიო</SectionHeading>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm leading-relaxed whitespace-pre-line">{bio}</p>
          </div>
        </section>
      ) : null}

      {historyEvents.length > 0 ? (
        <section aria-labelledby="history-heading">
          <SectionHeading id="history-heading">ისტ. მოვლენები</SectionHeading>
          <div className="rounded-xl border border-border bg-card p-5">
            <ol className="relative border-l border-border ml-2 space-y-5">
              {historyEvents.map((event) => (
                <li key={event.id} className="ml-5">
                  <span className="absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full border border-border bg-background ring-4 ring-background" />
                  <p className="text-sm font-semibold leading-tight">
                    <span className="text-primary">{event.year}</span>
                    {' — '}
                    {event.title}
                  </p>
                  {event.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {officialWebsite ? (
        <section aria-labelledby="contact-heading">
          <SectionHeading id="contact-heading">კონტაქტი</SectionHeading>
          <div className="rounded-xl border border-border bg-card p-5">
            <a
              href={officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
            >
              <GlobeIcon className="size-4 shrink-0" />
              {officialWebsite}
            </a>
          </div>
        </section>
      ) : null}

      {!bio && historyEvents.length === 0 && !officialWebsite ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            ბიო / ისტორია ჯერ არ არის შევსებული. გადადი{' '}
            <Link href="/profile/club/edit" className="text-primary hover:underline">
              პროფილის რედაქტირებაზე
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ── Roster tab ────────────────────────────────────────────────────────────────

function RosterTab({ entries }: { entries: RosterEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          შემადგენლობა ჯერ არ არის დამატებული. გადადი{' '}
          <Link href="/profile/club/edit" className="text-primary hover:underline">
            პროფილის რედაქტირებაზე
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="roster-heading">
      <SectionHeading id="roster-heading">მიმდინარე შემადგენლობა</SectionHeading>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                სახელი
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                პოზ.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {entry.jerseyNumber != null ? entry.jerseyNumber : '—'}
                </td>
                <td className="px-4 py-3 font-medium">{entry.playerName}</td>
                <td className="px-4 py-3">
                  {entry.position ? (
                    <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium uppercase tracking-widest text-secondary-foreground">
                      {entry.position}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          სტადიონის ინფო ჯერ არ არის შევსებული. გადადი{' '}
          <Link href="/profile/club/edit" className="text-primary hover:underline">
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
      <SectionHeading id="stadium-heading">სტადიონი</SectionHeading>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stadiumName && <InfoItem label="სტადიონი" value={stadiumName} />}
          {typeof stadiumCapacity === 'number' && (
            <InfoItem label="ტევადობა" value={`${stadiumCapacity.toLocaleString()} ადგ.`} />
          )}
          {stadiumAddress && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">მისამართი</dt>
              <dd className="mt-0.5 flex items-start gap-1.5 text-sm font-medium">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {stadiumAddress}
              </dd>
            </div>
          )}
        </dl>

        {embedSrc ? (
          <div className="overflow-hidden rounded-lg border border-border">
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
            className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
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
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">
        სიახლეების ფუნქცია მომდევნო ფაზაში გახდება ხელმისაწვდომი.
      </p>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
    >
      {children}
    </h2>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
