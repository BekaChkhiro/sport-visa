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
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  UserIcon,
  StarIcon,
  MessageCircleIcon,
  MapPinIcon,
  ShieldIcon,
  LockIcon,
  MailIcon,
  BriefcaseIcon,
} from 'lucide-react';
import { DOMINANT_FOOT_LABELS, EXPERIENCE_LEVEL_LABELS, COUNTRIES } from '@/lib/onboarding/schemas';
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

// Section label style matching design spec
const SECTION_LABEL = 'text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500';

// Card style
const CARD = 'rounded-card border border-ink-800 bg-ink-900 shadow-card';

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
  const [chatPending, setChatPending] = React.useState(false);
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

  async function handleStartChat() {
    if (chatPending) return;
    setChatPending(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footballerProfileId: footballer.id }),
      });
      if (!res.ok) {
        showToast('ჩატის გახსნა ვერ მოხერხდა', 'error');
        return;
      }
      const data = (await res.json()) as { conversationId: string };
      router.push(`/chat/${data.conversationId}`);
    } catch {
      showToast('ჩატის გახსნა ვერ მოხერხდა', 'error');
    } finally {
      setChatPending(false);
    }
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
  const hasAgent = footballer.agentName || footballer.agentPhone || footballer.agentEmail;

  const physicalStats: { label: string; value: string; unit?: string }[] = [
    footballer.height ? { label: 'სიმაღლე', value: String(footballer.height), unit: 'სმ' } : null,
    footballer.weight ? { label: 'წონა', value: String(footballer.weight), unit: 'კგ' } : null,
    footballer.dominantFoot
      ? {
          label: 'დომ. ფეხი',
          value: DOMINANT_FOOT_LABELS[footballer.dominantFoot] ?? footballer.dominantFoot,
        }
      : null,
    footballer.jerseyNumber ? { label: 'ნომერი', value: String(footballer.jerseyNumber) } : null,
  ].filter((r): r is { label: string; value: string; unit?: string } => r !== null);

  const infoRows: [string, string][] = [
    footballer.experienceLevel
      ? [
          'გამოცდილება',
          EXPERIENCE_LEVEL_LABELS[footballer.experienceLevel] ?? footballer.experienceLevel,
        ]
      : null,
    footballer.desiredLeague ? ['სასურ. ლიგა', footballer.desiredLeague] : null,
    footballer.currentClub ? ['ამჟ. კლუბი', footballer.currentClub] : null,
    footballer.age !== undefined ? ['ასაკი', `${footballer.age} წ.`] : null,
    footballer.nationality ? ['ეროვნება', footballer.nationality] : null,
    footballer.city ? ['ქალაქი', footballer.city] : null,
    footballer.country
      ? ['ქვეყანა', getCountryLabel(footballer.country) ?? footballer.country]
      : null,
  ].filter((r): r is [string, string] => r !== null);

  return (
    <AppShell
      role="club"
      currentPath={currentPath}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
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
            <Link href="/directory">
              <ArrowLeftIcon className="size-4" />
              ფეხბურთელები
            </Link>
          </Button>
          <ChevronRightIcon className="size-3.5 text-ink-700" aria-hidden="true" />
          <span className="font-medium text-ink-300">{name}</span>
        </div>

        {/* ── HERO CARD ── */}
        <div className={cn(CARD, 'overflow-hidden')}>
          {/* Cover */}
          <div className="relative h-40 sm:h-52">
            {footballer.coverUrl ? (
              <Image
                src={footballer.coverUrl}
                alt={`${name} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-iris-900/60 to-ink-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
          </div>

          <div className="px-5 pb-6 sm:px-7">
            {/* Avatar + actions row */}
            <div className="flex items-end justify-between gap-4 pt-5">
              {/* Avatar — overlaps cover */}
              <div className="relative -mt-14 size-24 shrink-0 overflow-hidden rounded-full border-4 border-ink-900 bg-ink-800 shadow-pop sm:-mt-16 sm:size-28">
                {footballer.avatarUrl ? (
                  <Image
                    src={footballer.avatarUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <UserIcon className="size-10 text-ink-500" />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mb-1 flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShortlistToggle}
                  disabled={shortlistPending}
                  aria-pressed={isShortlisted}
                  className={cn(
                    isShortlisted && 'border-brand-400/40 text-brand-300 hover:border-brand-400/60',
                  )}
                >
                  <StarIcon
                    className={cn('size-4', isShortlisted ? 'fill-current' : '')}
                    aria-hidden="true"
                  />
                  {isShortlisted ? 'შ. სიაშია' : 'შ. სიაში'}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleStartChat}
                  disabled={chatPending}
                >
                  <MessageCircleIcon className="size-4" aria-hidden="true" />
                  {chatPending ? '...' : 'ჩატი'}
                </Button>
              </div>
            </div>

            {/* Name + chips */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-[28px] font-bold tracking-tight text-ink-50 leading-tight">
                  {name}
                </h1>
                <VerificationBadge status={footballer.verificationStatus} />
              </div>

              {/* Meta line */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-ink-400">
                {footballer.age !== undefined && (
                  <>
                    <span>{footballer.age} წ.</span>
                    <span className="text-ink-700">·</span>
                  </>
                )}
                {footballer.city && (
                  <>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="size-3.5 text-ink-500" aria-hidden="true" />
                      {footballer.city}
                    </span>
                    <span className="text-ink-700">·</span>
                  </>
                )}
                {footballer.nationality && <span>{footballer.nationality}</span>}
                {footballer.currentClub && (
                  <>
                    <span className="text-ink-700">·</span>
                    <span className="text-ink-300">{footballer.currentClub}</span>
                  </>
                )}
              </div>

              {/* Position chips */}
              {footballer.positions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {footballer.positions.map((p) => (
                    <PositionChip key={p} position={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Meta strip */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-800 pt-4 text-[13px]">
              <span className="flex items-center gap-2 text-ink-400">
                <EyeIcon className="size-4 text-ink-500" aria-hidden="true" />
                {footballer.profileViewCount} ნახვა
              </span>
              <span className="flex items-center gap-2 text-ink-400">
                <StarIcon className="size-4 text-ink-500" aria-hidden="true" />
                <span>
                  შ. სიაში{' '}
                  <b className="font-mono font-semibold tabular-nums text-ink-100">
                    {footballer.shortlistCount}
                  </b>{' '}
                  კლუბის
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── MAIN COLUMN ── */}
          <main className="min-w-0 space-y-6">
            {/* Physical stats */}
            {physicalStats.length > 0 && (
              <section aria-labelledby="physical-heading" className={cn(CARD, 'p-5 sm:p-6')}>
                <h2 id="physical-heading" className={cn(SECTION_LABEL, 'mb-4')}>
                  ფიზიკური მონაცემები
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {physicalStats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-card border border-ink-800 bg-ink-950/40 p-4"
                    >
                      <p className="mt-1 font-mono text-[22px] font-bold leading-none tabular-nums text-ink-50">
                        {s.unit ? `${s.value} ${s.unit}` : s.value}
                      </p>
                      <p className="mt-1.5 text-[12px] text-ink-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {infoRows.length > 0 && (
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {infoRows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-card border border-ink-800 bg-ink-950/40 px-4 py-2.5 text-[13px]"
                      >
                        <span className="text-ink-500">{label}</span>
                        <span className="font-medium text-ink-100">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Bio */}
            {footballer.bio ? (
              <section aria-labelledby="bio-heading" className={cn(CARD, 'p-5 sm:p-6')}>
                <h2 id="bio-heading" className={cn(SECTION_LABEL, 'mb-3')}>
                  ბიოგრაფია
                </h2>
                <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-300">
                  {footballer.bio}
                </p>
              </section>
            ) : null}

            {/* Career */}
            {footballer.careerEntries.length > 0 ? (
              <section aria-labelledby="career-heading" className={cn(CARD, 'p-5 sm:p-6')}>
                <h2 id="career-heading" className={cn(SECTION_LABEL, 'mb-5')}>
                  კარიერა
                </h2>
                <div className="space-y-0">
                  {footballer.careerEntries.map((entry, i) => (
                    <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < footballer.careerEntries.length - 1 && (
                        <span
                          className="absolute left-[15px] top-8 h-full w-px bg-ink-800"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border',
                          entry.endYear === undefined
                            ? 'border-brand-400/40 bg-brand-400/15 text-brand-300'
                            : 'border-ink-700 bg-ink-800 text-ink-400',
                        )}
                        aria-hidden="true"
                      >
                        <ShieldIcon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14.5px] font-semibold text-ink-50">
                            {entry.clubName}
                          </p>
                          {entry.endYear === undefined && (
                            <span className="rounded-pill bg-brand-400/15 px-2 py-0.5 text-[10.5px] font-bold uppercase text-brand-300">
                              მიმდ.
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 font-mono text-[12.5px] tabular-nums text-ink-500">
                          {entry.startYear}–{entry.endYear ?? 'ახლ.'}
                          {entry.position && (
                            <>
                              <span className="mx-2 text-ink-700">·</span>
                              <span className="text-iris-300">{entry.position}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Gallery */}
            {footballer.galleryPhotos.length > 0 ? (
              <section aria-labelledby="gallery-heading" className={cn(CARD, 'p-5 sm:p-6')}>
                <h2 id="gallery-heading" className={cn(SECTION_LABEL, 'mb-4')}>
                  გალერეა
                </h2>
                <div className="relative aspect-video w-full overflow-hidden rounded-card bg-ink-800">
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
                      <ChevronLeftIcon className="size-4" aria-hidden="true" />
                    </Button>
                    <span className="font-mono text-[13px] tabular-nums text-ink-400">
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
                      <ChevronRightIcon className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Videos */}
            {footballer.videoLinks.length > 0 ? (
              <section aria-labelledby="videos-heading" className={cn(CARD, 'p-5 sm:p-6')}>
                <h2 id="videos-heading" className={cn(SECTION_LABEL, 'mb-4')}>
                  ვიდეოები
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {footballer.videoLinks.map((url) => {
                    const embedUrl = getYouTubeEmbedUrl(url);
                    return embedUrl ? (
                      <div
                        key={url}
                        className="aspect-video overflow-hidden rounded-card border border-ink-800"
                      >
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
          </main>

          {/* ── ASIDE COLUMN ── */}
          <aside className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
            {/* Contact gate — gated when phone present */}
            {footballer.phone ? (
              <div className={cn(CARD, 'overflow-hidden')}>
                <div className="border-b border-ink-800 px-5 py-4">
                  <h3 className="font-display text-[15px] font-bold text-ink-50">
                    საკონტაქტო ინფო
                  </h3>
                </div>
                <div className="divide-y divide-ink-800">
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-400/15 text-brand-300"
                      aria-hidden="true"
                    >
                      <BriefcaseIcon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-ink-500">ტელეფონი</p>
                      <a
                        href={`tel:${footballer.phone}`}
                        className="font-mono text-[13.5px] font-medium tabular-nums text-ink-100 hover:text-brand-300 transition-colors"
                      >
                        {footballer.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Locked state */
              <div className={cn(CARD, 'overflow-hidden')}>
                <div className="border-b border-ink-800 px-5 py-4">
                  <h3 className="font-display text-[15px] font-bold text-ink-50">
                    საკონტაქტო ინფო
                  </h3>
                </div>
                <div className="px-5 py-7 text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ink-800 text-ink-400">
                    <LockIcon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-[13.5px] font-semibold text-ink-100">კონტაქტი დაცულია</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                    დაამატე შ. სიაში, რომ ნახო ტელეფონი.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleShortlistToggle}
                    disabled={shortlistPending}
                    aria-pressed={isShortlisted}
                    className="mt-3.5 w-full"
                  >
                    <StarIcon className="size-4" aria-hidden="true" />
                    შ. სიაში
                  </Button>
                </div>
              </div>
            )}

            {/* Agent section */}
            {hasAgent ? (
              <div className={cn(CARD, 'overflow-hidden')}>
                <div className="border-b border-ink-800 px-5 py-4">
                  <h3 className="font-display text-[15px] font-bold text-ink-50">აგენტი</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {footballer.agentName && (
                    <p className="text-[14px] font-semibold text-ink-100">{footballer.agentName}</p>
                  )}
                  {footballer.agentPhone && (
                    <p className="flex items-center gap-2 text-[13px] text-ink-400">
                      <BriefcaseIcon
                        className="size-3.5 text-ink-500 shrink-0"
                        aria-hidden="true"
                      />
                      <a
                        href={`tel:${footballer.agentPhone}`}
                        className="font-mono tabular-nums hover:text-ink-100 transition-colors"
                      >
                        {footballer.agentPhone}
                      </a>
                    </p>
                  )}
                  {footballer.agentEmail && (
                    <p className="flex items-center gap-2 text-[13px] text-ink-400">
                      <MailIcon className="size-3.5 text-ink-500 shrink-0" aria-hidden="true" />
                      <a
                        href={`mailto:${footballer.agentEmail}`}
                        className="hover:text-ink-100 transition-colors truncate"
                      >
                        {footballer.agentEmail}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Chat CTA */}
            <div className="rounded-card border border-brand-400/25 bg-gradient-to-br from-brand-400/10 to-ink-900 p-5 shadow-card">
              <h3 className="font-display text-[15px] font-bold text-ink-50">დაინტერესდი?</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400">
                დაიწყე საუბარი პირდაპირ — მხოლოდ კლუბს შეუძლია ჩატის ინიცირება.
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleStartChat}
                disabled={chatPending}
                className="mt-3.5 w-full"
              >
                <MessageCircleIcon className="size-4" aria-hidden="true" />
                {chatPending ? '...' : 'ჩატი დაიწყება'}
              </Button>
            </div>
          </aside>
        </div>

        {/* Sticky mobile actions */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-ink-800 bg-ink-950/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-ink-950/80">
          <Button
            type="button"
            variant={isShortlisted ? 'default' : 'outline'}
            className={cn('flex-1', isShortlisted && 'border-brand-400/40 text-brand-300')}
            onClick={handleShortlistToggle}
            disabled={shortlistPending}
            aria-pressed={isShortlisted}
          >
            <StarIcon
              className={cn('size-4', isShortlisted ? 'fill-current' : '')}
              aria-hidden="true"
            />
            {isShortlisted ? 'შ. სიაშია' : 'შ. სიაში დამ.'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleStartChat}
            disabled={chatPending}
          >
            <MessageCircleIcon className="size-4" aria-hidden="true" />
            {chatPending ? '...' : 'ჩატის დაწ.'}
          </Button>
        </div>
        <div className="sm:hidden h-16" aria-hidden="true" />
      </div>
    </AppShell>
  );
}
