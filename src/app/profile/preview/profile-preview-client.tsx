'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { PositionChip } from '@/components/position-chip';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import {
  ArrowLeftIcon,
  EyeIcon,
  UserIcon,
  StarIcon,
  VideoIcon,
  MapPinIcon,
} from '@/components/icons';
import {
  DOMINANT_FOOT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  POSITION_LABELS,
  COUNTRIES,
} from '@/lib/onboarding/schemas';

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

export function ProfilePreviewClient({
  currentPath,
  userId,
  user,
  unreadNotifications,
  sidebarStats,
  profile,
}: ProfilePreviewClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const countryLabel =
    COUNTRIES.find((c) => c.code === (profile.nationality ?? profile.country))?.label ??
    profile.nationality ??
    profile.country;

  const metaParts = [
    typeof profile.age === 'number' ? `${profile.age} წ.` : null,
    countryLabel,
    profile.city,
    typeof profile.height === 'number' ? `${profile.height} სმ` : null,
  ].filter(Boolean);

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
      <div className="max-w-3xl space-y-6">
        {/* ── Preview banner ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <EyeIcon className="size-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-medium">პრევიუ — კლუბების ხედვა.</span> ასე გამოიყურება შენი
              პროფილი კლუბებისთვის.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit">
              <ArrowLeftIcon className="size-3.5" />
              რედ. დაბრუნება
            </Link>
          </Button>
        </div>

        {/* ── Hero / cover ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {profile.coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.coverUrl} alt="cover" className="h-40 w-full object-cover sm:h-56" />
          ) : (
            <div className="h-28 w-full bg-gradient-to-br from-primary/10 to-muted" />
          )}

          <div className="px-5 pb-5">
            {/* Avatar overlapping cover */}
            <div className="-mt-10 mb-4 flex items-end justify-between gap-4">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-card bg-muted shadow-sm">
                  {profile.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <UserIcon className="size-8" />
                    </div>
                  )}
                </div>
              </div>
              <VerificationBadge status={profile.verificationStatus} />
            </div>

            {/* Name + positions */}
            <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
            {metaParts.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{metaParts.join(' · ')}</p>
            )}
            {profile.positions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.positions.map((pos) => (
                  <PositionChip key={pos} position={pos} />
                ))}
              </div>
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

        {/* ── Bio ────────────────────────────────────────────────────────── */}
        {profile.bio && (
          <section aria-labelledby="bio-heading">
            <SectionHeading id="bio-heading">ბიოგრაფია</SectionHeading>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed text-foreground">{profile.bio}</p>
            </div>
          </section>
        )}

        {/* ── Physical & sport info ───────────────────────────────────────── */}
        <section aria-labelledby="sport-info-heading">
          <SectionHeading id="sport-info-heading">სპორტული ინფორმაცია</SectionHeading>
          <div className="rounded-xl border border-border bg-card p-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {typeof profile.height === 'number' && (
                <InfoItem label="სიმაღლე" value={`${profile.height} სმ`} />
              )}
              {typeof profile.weight === 'number' && (
                <InfoItem label="წონა" value={`${profile.weight} კგ`} />
              )}
              {profile.dominantFoot && (
                <InfoItem
                  label="ძირ. ფეხი"
                  value={DOMINANT_FOOT_LABELS[profile.dominantFoot] ?? profile.dominantFoot}
                />
              )}
              {profile.positions.length > 0 && (
                <InfoItem
                  label="პოზიცია"
                  value={profile.positions
                    .map((p) => `${p} — ${POSITION_LABELS[p] ?? p}`)
                    .join(', ')}
                />
              )}
              {profile.currentClub && <InfoItem label="ამჟ. კლუბი" value={profile.currentClub} />}
              {typeof profile.jerseyNumber === 'number' && (
                <InfoItem label="ნომ." value={`#${profile.jerseyNumber}`} />
              )}
              {profile.experienceLevel && (
                <InfoItem
                  label="გამოცდ."
                  value={
                    EXPERIENCE_LEVEL_LABELS[profile.experienceLevel] ?? profile.experienceLevel
                  }
                />
              )}
              {profile.desiredLeague && (
                <InfoItem label="სასურ. ლიგა" value={profile.desiredLeague} />
              )}
            </dl>
          </div>
        </section>

        {/* ── Gallery ────────────────────────────────────────────────────── */}
        {profile.galleryPhotos.length > 0 && (
          <section aria-labelledby="gallery-heading">
            <SectionHeading id="gallery-heading">ფოტო გალერეა</SectionHeading>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {profile.galleryPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`ფოტო ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-primary/80 px-1 py-0.5 text-[10px] leading-none text-primary-foreground">
                        გარეკ.
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Video links ────────────────────────────────────────────────── */}
        {profile.videoLinks.length > 0 && (
          <section aria-labelledby="videos-heading">
            <SectionHeading id="videos-heading">ვიდეოები</SectionHeading>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              {profile.videoLinks.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
                >
                  <VideoIcon className="size-4 shrink-0" />
                  {url}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Career history ─────────────────────────────────────────────── */}
        {profile.careerEntries.length > 0 && (
          <section aria-labelledby="career-heading">
            <SectionHeading id="career-heading">კარიერის ისტორია</SectionHeading>
            <div className="rounded-xl border border-border bg-card p-5">
              <ul className="divide-y divide-border">
                {profile.careerEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{entry.clubName}</p>
                      {entry.position && (
                        <p className="text-xs text-muted-foreground">
                          {POSITION_LABELS[entry.position] ?? entry.position}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {entry.startYear}–{entry.endYear ?? 'დღ.'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Agent info ─────────────────────────────────────────────────── */}
        {(profile.agentName || profile.agentPhone || profile.agentEmail) && (
          <section aria-labelledby="agent-heading">
            <SectionHeading id="agent-heading">აგენტის ინფო</SectionHeading>
            <div className="rounded-xl border border-border bg-card p-5">
              <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
                {profile.agentName && <InfoItem label="სახელი" value={profile.agentName} />}
                {profile.agentPhone && <InfoItem label="ტელეფონი" value={profile.agentPhone} />}
                {profile.agentEmail && <InfoItem label="ელ. ფოსტა" value={profile.agentEmail} />}
              </dl>
            </div>
          </section>
        )}

        {/* ── Location ───────────────────────────────────────────────────── */}
        {(profile.city || profile.country) && (
          <section aria-labelledby="location-heading">
            <SectionHeading id="location-heading">მდებარეობა</SectionHeading>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm text-foreground">
                <MapPinIcon className="size-4 text-muted-foreground" />
                {[
                  profile.city,
                  COUNTRIES.find((c) => c.code === profile.country)?.label ?? profile.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          </section>
        )}

        {/* ── Bottom edit link ───────────────────────────────────────────── */}
        <div className="flex justify-center pb-4">
          <Button variant="outline" asChild>
            <Link href="/profile/edit">
              <ArrowLeftIcon className="size-4" />
              პროფილის რედაქტირებაზე დაბრუნება
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

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
