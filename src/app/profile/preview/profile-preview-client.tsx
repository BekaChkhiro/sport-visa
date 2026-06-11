'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { PositionChip } from '@/components/position-chip';
import { ProfileAvatar } from '@/components/profile-avatar';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import {
  ArrowLeftIcon,
  EyeIcon,
  StarIcon,
  VideoIcon,
  MapPinIcon,
  FlagIcon,
  ShieldIcon,
  ClockIcon,
  ImageIcon,
} from '@/components/icons';
import {
  DOMINANT_FOOT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  POSITION_LABELS,
  COUNTRIES,
} from '@/lib/onboarding/schemas';
import { cn } from '@/lib/utils';

type CareerEntry = {
  id: string;
  clubName: string;
  startYear: number;
  endYear?: number;
  position?: string;
};

type GalleryPhoto = {
  id: string;
  url: string;
};

type ProfileData = {
  name: string;
  age?: number;
  nationality?: string;
  city?: string;
  country?: string;
  bio?: string;
  positions: string[];
  dominantFoot?: string;
  height?: number;
  weight?: number;
  currentClub?: string;
  jerseyNumber?: number;
  experienceLevel?: string;
  desiredLeague?: string;
  avatarUrl?: string;
  coverUrl?: string;
  videoLinks: string[];
  verificationStatus: VerificationStatus;
  profileViewCount: number;
  shortlistCount: number;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  careerEntries: CareerEntry[];
  galleryPhotos: GalleryPhoto[];
};

type ProfilePreviewClientProps = {
  currentPath: string;
  userId: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    position?: string;
    nationality?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
    profileCompletion?: number;
  };
  unreadNotifications: number;
  sidebarStats?: { views?: number; saves?: number; unreadMessages?: number };
  profile: ProfileData;
};

type ActiveTab = 'overview' | 'career' | 'gallery';

export function ProfilePreviewClient({
  currentPath,
  userId,
  user,
  unreadNotifications,
  sidebarStats,
  profile,
}: ProfilePreviewClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('overview');
  const [lightbox, setLightbox] = React.useState<string | null>(null);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const countryLabel =
    COUNTRIES.find((c) => c.code === (profile.nationality ?? profile.country))?.label ??
    profile.nationality ??
    profile.country;

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'მიმოხილვა' },
    { id: 'career', label: 'კარიერა' },
    { id: 'gallery', label: 'გალერეა' },
  ];

  return (
    <AppShell
      role="footballer"
      currentPath={currentPath}
      userId={userId}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-[900px]">
        {/* ── Preview banner ─────────────────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-400/25 bg-brand-400/8 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <EyeIcon className="size-4 shrink-0 text-brand-300" />
            <p className="text-[13px] text-ink-200">
              <span className="font-semibold text-ink-50">პრევიუ — კლუბების ხედვა.</span> ასე
              გამოიყურება შენი პროფილი კლუბებისთვის.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit">
              <ArrowLeftIcon className="size-3.5" />
              რედ. დაბრუნება
            </Link>
          </Button>
        </div>

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          {/* Cover / banner */}
          {profile.coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.coverUrl}
              alt=""
              className="h-40 w-full object-cover opacity-60 sm:h-48"
            />
          ) : (
            <div className="h-36 w-full bg-gradient-to-br from-brand-400/10 via-iris-400/5 to-ink-900" />
          )}

          {/* Identity row */}
          <div className="px-5 pb-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Avatar overlapping the cover */}
                <div className="relative z-10 -mt-16 shrink-0">
                  <ProfileAvatar
                    src={profile.avatarUrl}
                    fallback={initials}
                    size="xl"
                    rounded="md"
                    className="h-28 w-28 rounded-[22px] ring-4 ring-ink-900 shadow-float sm:h-32 sm:w-32"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-[26px] font-bold leading-none tracking-tight text-ink-50 sm:text-[30px]">
                      {profile.name}
                    </h1>
                    {profile.verificationStatus === 'verified' && (
                      <VerificationBadge status="verified" />
                    )}
                  </div>
                  {/* Positions */}
                  {profile.positions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.positions.map((pos) => (
                        <PositionChip key={pos} position={pos} />
                      ))}
                    </div>
                  )}
                  {/* Meta row */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-400">
                    {profile.currentClub && (
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldIcon className="size-3.5 text-ink-500" />
                        {profile.currentClub}
                      </span>
                    )}
                    {profile.city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon className="size-3.5 text-ink-500" />
                        {profile.city}
                      </span>
                    )}
                    {countryLabel && (
                      <span className="inline-flex items-center gap-1.5">
                        <FlagIcon className="size-3.5 text-ink-500" />
                        {countryLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-facts strip */}
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-ink-800 bg-ink-800/60 sm:grid-cols-3 lg:grid-cols-6">
              {[
                {
                  l: 'ასაკი',
                  v: typeof profile.age === 'number' ? String(profile.age) : '—',
                  u: typeof profile.age === 'number' ? 'წ' : '',
                },
                {
                  l: 'სიმაღლე',
                  v: typeof profile.height === 'number' ? String(profile.height) : '—',
                  u: typeof profile.height === 'number' ? 'სმ' : '',
                },
                {
                  l: 'წონა',
                  v: typeof profile.weight === 'number' ? String(profile.weight) : '—',
                  u: typeof profile.weight === 'number' ? 'კგ' : '',
                },
                {
                  l: 'ძირ. ფეხი',
                  v: profile.dominantFoot
                    ? (DOMINANT_FOOT_LABELS[profile.dominantFoot] ?? profile.dominantFoot)
                    : '—',
                  u: '',
                },
                {
                  l: 'ნომ.',
                  v: typeof profile.jerseyNumber === 'number' ? `#${profile.jerseyNumber}` : '—',
                  u: '',
                },
                {
                  l: 'ნახვები',
                  v: String(profile.profileViewCount),
                  u: '',
                },
              ].map((f) => (
                <div key={f.l} className="bg-ink-900 px-4 py-3.5">
                  <div className="text-[10.5px] font-medium uppercase tracking-wide text-ink-500">
                    {f.l}
                  </div>
                  <div className="mt-1.5 font-display text-[19px] font-bold tabular-nums text-ink-50">
                    {f.v}
                    {f.u && (
                      <span className="ml-0.5 text-[12px] font-medium text-ink-500">{f.u}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="mt-5 flex items-center gap-1 border-b border-ink-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'relative px-4 py-3 text-[14px] font-semibold transition-colors',
                activeTab === t.id ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200',
              )}
            >
              {t.label}
              {activeTab === t.id && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-400" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────────────────────── */}
        <div className="mt-5">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
              {/* Main column */}
              <div className="space-y-5">
                {/* Bio */}
                {profile.bio && (
                  <section
                    aria-labelledby="bio-heading"
                    className="rounded-card border border-ink-800 bg-ink-900 shadow-card"
                  >
                    <div className="border-b border-ink-800 px-5 py-3.5">
                      <h2 id="bio-heading" className="text-[14px] font-bold text-ink-50">
                        ფეხბურთელის შესახებ
                      </h2>
                    </div>
                    <div className="p-5">
                      <p className="text-[14px] leading-relaxed text-ink-300">{profile.bio}</p>

                      {/* Sub-stats grid */}
                      <div className="mt-5 grid gap-px overflow-hidden rounded-[12px] border border-ink-800 bg-ink-800/60 sm:grid-cols-3">
                        {[
                          {
                            l: 'გამოცდილება',
                            v: profile.experienceLevel
                              ? (EXPERIENCE_LEVEL_LABELS[profile.experienceLevel] ??
                                profile.experienceLevel)
                              : '—',
                          },
                          { l: 'სასურველი ლიგა', v: profile.desiredLeague ?? '—' },
                          { l: 'მიმდინარე კლუბი', v: profile.currentClub ?? '—' },
                        ].map((f) => (
                          <div key={f.l} className="bg-ink-900 px-4 py-3.5">
                            <div className="text-[10.5px] font-medium uppercase tracking-wide text-ink-500">
                              {f.l}
                            </div>
                            <div className="mt-1.5 text-[13.5px] font-semibold text-ink-100">
                              {f.v}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Video links */}
                {profile.videoLinks.length > 0 && (
                  <section
                    aria-labelledby="videos-heading"
                    className="rounded-card border border-ink-800 bg-ink-900 shadow-card"
                  >
                    <div className="flex items-center justify-between border-b border-ink-800 px-5 py-3.5">
                      <h2
                        id="videos-heading"
                        className="flex items-center gap-2 text-[14px] font-bold text-ink-50"
                      >
                        <VideoIcon className="size-4 text-brand-400" />
                        ვიდეო მასალა
                      </h2>
                      <span className="text-[11px] text-ink-500">
                        {profile.videoLinks.length} ვიდეო
                      </span>
                    </div>
                    <div className="space-y-2.5 p-5">
                      {profile.videoLinks.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-[10px] border border-ink-800 bg-ink-950/40 px-3.5 py-3 text-[13px] text-ink-200 transition-colors hover:border-ink-700 hover:text-brand-300"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-ink-800 text-ink-400">
                            <VideoIcon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{url}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Physical info */}
                <section
                  aria-labelledby="physical-heading"
                  className="rounded-card border border-ink-800 bg-ink-900 shadow-card"
                >
                  <div className="border-b border-ink-800 px-5 py-3.5">
                    <h2 id="physical-heading" className="text-[14px] font-bold text-ink-50">
                      ფიზიკური მახასიათებლები
                    </h2>
                  </div>
                  <div className="grid gap-px bg-ink-800/60 sm:grid-cols-2">
                    {[
                      [
                        'სიმაღლე',
                        typeof profile.height === 'number' ? `${profile.height} სმ` : '—',
                      ],
                      ['წონა', typeof profile.weight === 'number' ? `${profile.weight} კგ` : '—'],
                      [
                        'დომინ. ფეხი',
                        profile.dominantFoot
                          ? (DOMINANT_FOOT_LABELS[profile.dominantFoot] ?? profile.dominantFoot)
                          : '—',
                      ],
                      ['ასაკი', typeof profile.age === 'number' ? `${profile.age} წ.` : '—'],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        className="flex items-center justify-between bg-ink-900 px-5 py-3.5"
                      >
                        <span className="text-[12.5px] text-ink-400">{l}</span>
                        <span className="text-[13.5px] font-semibold text-ink-100">{v}</span>
                      </div>
                    ))}
                  </div>
                  {profile.positions.length > 0 && (
                    <div className="border-t border-ink-800 px-5 py-4">
                      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
                        პოზიციები
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.positions.map((pos, idx) => (
                          <span
                            key={pos}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[12px] font-bold',
                              positionTone(pos),
                            )}
                          >
                            {pos}
                            {idx === 0 && <span className="font-normal opacity-70">მთავარი</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar column */}
              <div className="space-y-5">
                {/* Verification card */}
                {profile.verificationStatus === 'verified' && (
                  <div className="flex items-center gap-3 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-success-400/15 text-success-300">
                      <ShieldIcon className="size-5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-ink-50">დადასტურებული პროფილი</p>
                      <p className="mt-0.5 text-[12px] text-ink-400">
                        Sport Visa-ს ადმინმა გადაამოწმა მონაცემები.
                      </p>
                    </div>
                  </div>
                )}

                {/* Agent card */}
                {(profile.agentName || profile.agentPhone || profile.agentEmail) && (
                  <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
                    <div className="border-b border-ink-800 px-5 py-3.5">
                      <h2 className="text-[14px] font-bold text-ink-50">აგენტი</h2>
                    </div>
                    <div className="p-5">
                      {profile.agentName && (
                        <p className="text-[13.5px] font-semibold text-ink-100">
                          {profile.agentName}
                        </p>
                      )}
                      <p className="mt-0.5 text-[12px] text-ink-500">ლიცენზირებული აგენტი</p>
                      <div className="mt-4 flex items-start gap-2 rounded-btn border border-ink-800 bg-ink-950/50 px-3 py-2.5 text-[11.5px] text-ink-400">
                        <ShieldIcon className="mt-0.5 size-3.5 shrink-0 text-ink-500" />
                        საკონტაქტო მონაცემები ხელმისაწვდომია ჩატის დაწყების შემდეგ.
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats card */}
                <div className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
                    სტატისტიკა
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[13px] text-ink-400">
                      <EyeIcon className="size-3.5" />
                      ნახვები
                    </span>
                    <span className="font-display text-[17px] font-bold tabular-nums text-ink-50">
                      {profile.profileViewCount}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[13px] text-ink-400">
                      <StarIcon className="size-3.5" />
                      შენახვები
                    </span>
                    <span className="font-display text-[17px] font-bold tabular-nums text-ink-50">
                      {profile.shortlistCount}
                    </span>
                  </div>
                </div>

                {/* Location */}
                {(profile.city || countryLabel) && (
                  <div className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
                      მდებარეობა
                    </p>
                    <p className="flex items-center gap-2 text-[13.5px] font-medium text-ink-100">
                      <MapPinIcon className="size-4 text-ink-500" />
                      {[profile.city, countryLabel].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CAREER */}
          {activeTab === 'career' && (
            <>
              {profile.careerEntries.length === 0 ? (
                <div className="rounded-card border border-dashed border-ink-700 bg-ink-900 p-8 text-center text-[13px] text-ink-500">
                  კარიერის ჩანაწერი ჯერ არ არის.
                </div>
              ) : (
                <div
                  aria-labelledby="career-heading"
                  className="max-w-[760px] rounded-card border border-ink-800 bg-ink-900 shadow-card"
                >
                  <div className="border-b border-ink-800 px-5 py-3.5">
                    <h2
                      id="career-heading"
                      className="flex items-center gap-2 text-[14px] font-bold text-ink-50"
                    >
                      <ClockIcon className="size-4 text-brand-400" />
                      კარიერის ისტორია
                    </h2>
                  </div>
                  <ol className="relative px-5 py-5">
                    <span className="absolute bottom-8 left-[27px] top-8 w-px bg-ink-800" />
                    {profile.careerEntries.map((entry) => {
                      const isCurrent = !entry.endYear;
                      return (
                        <li key={entry.id} className="relative flex gap-4 pb-7 last:pb-0">
                          <span
                            className={cn(
                              'relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-ink-900',
                              isCurrent ? 'bg-brand-400 text-ink-950' : 'bg-ink-800 text-ink-400',
                            )}
                          >
                            <ShieldIcon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1 rounded-card border border-ink-800 bg-ink-950/40 px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-display text-[15px] font-bold text-ink-50">
                                {entry.clubName}
                              </h3>
                              <span
                                className={cn(
                                  'rounded-pill px-2 py-0.5 font-mono text-[11.5px] font-semibold tabular-nums',
                                  isCurrent
                                    ? 'bg-brand-400/15 text-brand-300'
                                    : 'bg-ink-800 text-ink-400',
                                )}
                              >
                                {entry.startYear} — {isCurrent ? 'ახლა' : entry.endYear}
                              </span>
                            </div>
                            {entry.position && (
                              <p className="mt-1 text-[12.5px] text-ink-400">
                                {POSITION_LABELS[entry.position] ?? entry.position}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </>
          )}

          {/* GALLERY */}
          {activeTab === 'gallery' && (
            <>
              {profile.galleryPhotos.length === 0 ? (
                <div className="rounded-card border border-dashed border-ink-700 bg-ink-900 p-8 text-center text-[13px] text-ink-500">
                  გალერეა ცარიელია.
                </div>
              ) : (
                <section
                  aria-labelledby="gallery-heading"
                  className="rounded-card border border-ink-800 bg-ink-900 shadow-card"
                >
                  <div className="flex items-center justify-between border-b border-ink-800 px-5 py-3.5">
                    <h2
                      id="gallery-heading"
                      className="flex items-center gap-2 text-[14px] font-bold text-ink-50"
                    >
                      <ImageIcon className="size-4 text-brand-400" />
                      ფოტო გალერეა
                    </h2>
                    <span className="text-[11px] text-ink-500">
                      {profile.galleryPhotos.length} ფოტო
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                    {profile.galleryPhotos.map((photo, idx) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setLightbox(photo.url)}
                        aria-label={`ფოტო ${idx + 1}`}
                        className="group relative aspect-[4/3] overflow-hidden rounded-card border border-ink-800 transition-colors hover:border-ink-600"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={`ფოტო ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-ink-950/0 transition-colors group-hover:bg-ink-950/20" />
                        {idx === 0 && (
                          <span className="absolute left-2 top-2 rounded-pill bg-brand-400 px-2 py-0.5 text-[10px] font-bold text-ink-950">
                            მთავარი
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* ── Bottom edit link ───────────────────────────────────────────── */}
        <div className="mt-8 flex justify-center pb-4">
          <Button variant="outline" asChild>
            <Link href="/profile/edit">
              <ArrowLeftIcon className="size-4" />
              პროფილის რედაქტირებაზე დაბრუნება
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="დახურვა"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-btn border border-ink-700 bg-ink-900/70 text-ink-200 hover:text-ink-50"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 max-h-[680px] w-auto max-w-[900px] rounded-card object-contain shadow-float"
          />
        </div>
      )}
    </AppShell>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function positionTone(position: string): string {
  if (position === 'GK') return 'bg-flame-400/15 text-flame-300';
  if (['CB', 'LB', 'RB'].includes(position)) return 'bg-accent-400/15 text-accent-300';
  if (['DM', 'CM', 'AM'].includes(position)) return 'bg-iris-400/15 text-iris-300';
  return 'bg-brand-400/15 text-brand-300';
}
