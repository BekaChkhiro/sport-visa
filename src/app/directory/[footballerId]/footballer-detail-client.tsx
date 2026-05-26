'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  MessageCircleIcon,
  MapPinIcon,
} from '@/components/icons';
import {
  DOMINANT_FOOT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  POSITION_LABELS,
  COUNTRIES,
} from '@/lib/onboarding/schemas';
import type { AppSidebarStats } from '@/components/app-sidebar';
import { toggleShortlist } from '@/lib/directory/actions';
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

type FootballerData = {
  id: string;
  firstName: string;
  lastName: string;
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
  phone?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  careerEntries: CareerEntry[];
  galleryPhotos: GalleryPhoto[];
  isShortlisted: boolean;
};

type FootballerDetailClientProps = {
  currentPath: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
  };
  sidebarStats?: AppSidebarStats;
  unreadNotifications: number;
  footballer: FootballerData;
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function getCountryLabel(code?: string): string | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}

export function FootballerDetailClient({
  currentPath,
  user,
  sidebarStats,
  unreadNotifications,
  footballer,
}: FootballerDetailClientProps) {
  const router = useRouter();
  const [isShortlisted, setIsShortlisted] = React.useState(footballer.isShortlisted);
  const [shortlistPending, setShortlistPending] = React.useState(false);
  const [galleryIndex, setGalleryIndex] = React.useState(0);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  async function handleShortlistToggle() {
    if (shortlistPending) return;
    setShortlistPending(true);
    const next = !isShortlisted;
    setIsShortlisted(next);

    const result = await toggleShortlist(footballer.id);
    if (result.status === 'error') {
      setIsShortlisted(!next); // revert
      showToast(result.message, 'error');
    } else {
      setIsShortlisted(result.shortlisted);
      showToast(result.shortlisted ? 'შ. სიაში დაემატა' : 'შ. სიადან წაიშალა');
    }
    setShortlistPending(false);
  }

  const name = `${footballer.firstName} ${footballer.lastName}`.trim();
  const primaryPosition = footballer.positions[0];

  const sportInfoRows: [string, string][] = [
    primaryPosition
      ? ['პოზ.', `${primaryPosition} — ${POSITION_LABELS[primaryPosition] ?? ''}`]
      : null,
    footballer.dominantFoot
      ? ['ფეხი', DOMINANT_FOOT_LABELS[footballer.dominantFoot] ?? footballer.dominantFoot]
      : null,
    footballer.experienceLevel
      ? ['გამ.', EXPERIENCE_LEVEL_LABELS[footballer.experienceLevel] ?? footballer.experienceLevel]
      : null,
    footballer.currentClub ? ['ამ. კლ.', footballer.currentClub] : null,
    footballer.jerseyNumber ? ['#', String(footballer.jerseyNumber)] : null,
    footballer.desiredLeague ? ['სეზ.', footballer.desiredLeague] : null,
  ].filter((r): r is [string, string] => r !== null);

  const physicalRows: [string, string][] = [
    footballer.height ? ['სიმ.', `${footballer.height} სმ`] : null,
    footballer.weight ? ['წონა', `${footballer.weight} კგ`] : null,
    footballer.age !== undefined ? ['ასაკი', `${footballer.age}`] : null,
    footballer.nationality ? ['ეროვ.', footballer.nationality] : null,
    footballer.city ? ['ქ.', footballer.city] : null,
    footballer.country ? ['ქვ.', getCountryLabel(footballer.country) ?? footballer.country] : null,
  ].filter((r): r is [string, string] => r !== null);

  const hasAgent = footballer.agentName || footballer.agentPhone || footballer.agentEmail;

  return (
    <AppShell
      role="club"
      currentPath={currentPath}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg transition-all sm:bottom-6',
            toast.type === 'error'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-foreground text-background',
          )}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/directory">
              <ArrowLeftIcon className="size-4" />
              Directory-ში დაბრუნება
            </Link>
          </Button>
        </div>

        {/* Hero */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {footballer.coverUrl ? (
            <div className="relative aspect-[3/1] w-full overflow-hidden bg-muted">
              <Image
                src={footballer.coverUrl}
                alt={`${name} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted sm:size-24">
              {footballer.avatarUrl ? (
                <Image
                  src={footballer.avatarUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <UserIcon className="size-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold leading-tight">{name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {footballer.positions.map((p) => (
                      <PositionChip key={p} position={p} />
                    ))}
                    {footballer.age !== undefined ? <span>{footballer.age} წ.</span> : null}
                    {footballer.nationality ? <span>{footballer.nationality}</span> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={isShortlisted ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleShortlistToggle}
                    disabled={shortlistPending}
                    aria-pressed={isShortlisted}
                  >
                    <StarIcon className={cn('size-4', isShortlisted ? 'fill-current' : '')} />
                    {isShortlisted ? 'შ. სიაშია' : 'შ. სიაში'}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/chats">
                      <MessageCircleIcon className="size-4" />
                      ჩატი
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <VerificationBadge status={footballer.verificationStatus} />
                <span className="flex items-center gap-1">
                  <EyeIcon className="size-3.5" />
                  {footballer.profileViewCount} ნახვა
                </span>
                {footballer.city ? (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="size-3.5" />
                    {footballer.city}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Sport + Physical info */}
        <div className="grid gap-4 sm:grid-cols-2">
          {sportInfoRows.length > 0 ? (
            <section
              aria-labelledby="sport-info-heading"
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <h2
                id="sport-info-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                სპ. ინფო
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {sportInfoRows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="font-medium text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          ) : null}

          {physicalRows.length > 0 ? (
            <section
              aria-labelledby="physical-heading"
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <h2
                id="physical-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                ფიზ. მაჩვ.
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {physicalRows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="font-medium text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        {/* Bio */}
        {footballer.bio ? (
          <section
            aria-labelledby="bio-heading"
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <h2
              id="bio-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              ბიო
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{footballer.bio}</p>
          </section>
        ) : null}

        {/* Career history */}
        {footballer.careerEntries.length > 0 ? (
          <section
            aria-labelledby="career-heading"
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <h2
              id="career-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              კარიერა
            </h2>
            <ul className="flex flex-col gap-2">
              {footballer.careerEntries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm">
                  <span
                    className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="flex-1">
                    <span className="font-medium">{entry.clubName}</span>
                    <span className="ml-2 text-muted-foreground">
                      {entry.startYear}–{entry.endYear ?? 'ახლ.'}
                    </span>
                    {entry.position ? (
                      <span className="ml-2 text-muted-foreground">{entry.position}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Gallery */}
        {footballer.galleryPhotos.length > 0 ? (
          <section
            aria-labelledby="gallery-heading"
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <h2
              id="gallery-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              გალერეა
            </h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={footballer.galleryPhotos[galleryIndex]!.url}
                alt={`${name} გალერეა ${galleryIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            {footballer.galleryPhotos.length > 1 ? (
              <div className="mt-3 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGalleryIndex((i) => Math.max(0, i - 1))}
                  disabled={galleryIndex === 0}
                  aria-label="წინა ფოტო"
                >
                  ←
                </Button>
                <span className="text-xs text-muted-foreground">
                  {galleryIndex + 1}/{footballer.galleryPhotos.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGalleryIndex((i) => Math.min(footballer.galleryPhotos.length - 1, i + 1))
                  }
                  disabled={galleryIndex === footballer.galleryPhotos.length - 1}
                  aria-label="შემდეგი ფოტო"
                >
                  →
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Videos */}
        {footballer.videoLinks.length > 0 ? (
          <section
            aria-labelledby="videos-heading"
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <h2
              id="videos-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              ვიდეოები
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {footballer.videoLinks.map((url) => {
                const embedUrl = getYouTubeEmbedUrl(url);
                return embedUrl ? (
                  <div key={url} className="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={embedUrl}
                      title="Football video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="size-full border-0"
                      loading="lazy"
                    />
                  </div>
                ) : null;
              })}
            </div>
          </section>
        ) : null}

        {/* Contact info — gated: only visible when footballer is in shortlist */}
        {footballer.phone ? (
          <section
            aria-labelledby="contact-heading"
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <h2
              id="contact-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              კონტაქტი
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-muted-foreground">ტელ.</dt>
              <dd>
                <a href={`tel:${footballer.phone}`} className="text-primary hover:underline">
                  {footballer.phone}
                </a>
              </dd>
            </dl>
          </section>
        ) : null}

        {/* Agent info */}
        {hasAgent ? (
          <section
            aria-labelledby="agent-heading"
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <h2
              id="agent-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              აგენტი
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {footballer.agentName ? (
                <>
                  <dt className="font-medium text-muted-foreground">სახ.</dt>
                  <dd>{footballer.agentName}</dd>
                </>
              ) : null}
              {footballer.agentPhone ? (
                <>
                  <dt className="font-medium text-muted-foreground">ტელ.</dt>
                  <dd>
                    <a
                      href={`tel:${footballer.agentPhone}`}
                      className="text-primary hover:underline"
                    >
                      {footballer.agentPhone}
                    </a>
                  </dd>
                </>
              ) : null}
              {footballer.agentEmail ? (
                <>
                  <dt className="font-medium text-muted-foreground">ელ.ფ.</dt>
                  <dd>
                    <a
                      href={`mailto:${footballer.agentEmail}`}
                      className="text-primary hover:underline"
                    >
                      {footballer.agentEmail}
                    </a>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>
        ) : null}

        {/* Sticky mobile actions */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            type="button"
            variant={isShortlisted ? 'default' : 'outline'}
            className="flex-1"
            onClick={handleShortlistToggle}
            disabled={shortlistPending}
            aria-pressed={isShortlisted}
          >
            <StarIcon className={cn('size-4', isShortlisted ? 'fill-current' : '')} />
            {isShortlisted ? 'შ. სიაშია' : 'შ. სიაში დამ.'}
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/chats">
              <MessageCircleIcon className="size-4" />
              ჩატის დაწ.
            </Link>
          </Button>
        </div>
        <div className="sm:hidden h-16" aria-hidden="true" />
      </div>
    </AppShell>
  );
}
