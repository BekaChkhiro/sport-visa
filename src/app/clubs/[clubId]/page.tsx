import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import type { VerificationStatus } from '@/components/verification-badge';
import { ClubDetailClient } from './club-detail-client';

type Props = {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clubId } = await params;
  const club = await db.clubProfile.findUnique({
    where: { id: clubId },
    select: { name: true, city: true, logoKey: true },
  });
  if (!club) return { title: 'კლუბი ვერ მოიძებნა' };
  const title = club.name;
  const description = club.city ? `${club.name} — ${club.city}` : club.name;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const logoUrl = club.logoKey ? `${r2BaseUrl}/${club.logoKey}` : undefined;
  const ogImage = logoUrl ? [{ url: logoUrl, alt: club.name }] : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ogImage,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: logoUrl ? [logoUrl] : undefined,
    },
  };
}

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ClubDetailPage({ params, searchParams }: Props) {
  const { clubId } = await params;
  const [shell, sp] = await Promise.all([requireAppShellContext(`/clubs/${clubId}`), searchParams]);

  const tab = sp.tab ?? 'history';

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const club = await db.clubProfile.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      league: true,
      foundedYear: true,
      officialWebsite: true,
      stadiumName: true,
      stadiumCapacity: true,
      stadiumAddress: true,
      stadiumMapUrl: true,
      logoKey: true,
      coverKey: true,
      bio: true,
      verificationStatus: true,
      profileViewCount: true,
      _count: { select: { subscribers: true } },
      rosterEntries: {
        orderBy: [{ orderIndex: 'asc' }, { jerseyNumber: 'asc' }],
        select: {
          id: true,
          playerName: true,
          position: true,
          jerseyNumber: true,
        },
      },
      historyEvents: {
        orderBy: [{ year: 'asc' }, { orderIndex: 'asc' }],
        select: {
          id: true,
          year: true,
          title: true,
          description: true,
        },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          title: true,
          body: true,
          createdAt: true,
          _count: { select: { likes: true } },
        },
      },
    },
  });

  if (!club) notFound();

  const viewerRole = shell.role.toUpperCase();

  let isSubscribed = false;
  if (viewerRole === 'FOOTBALLER') {
    const footballer = await db.footballerProfile.findUnique({
      where: { userId: shell.userId },
      select: { id: true },
    });
    if (footballer) {
      const sub = await db.clubSubscription.findUnique({
        where: {
          footballerProfileId_clubProfileId: {
            footballerProfileId: footballer.id,
            clubProfileId: club.id,
          },
        },
        select: { id: true },
      });
      isSubscribed = !!sub;
    }
  }

  return (
    <ClubDetailClient
      shellRole={shell.role}
      shellUser={shell.user}
      userId={shell.userId}
      sidebarStats={shell.sidebarStats}
      adminBadges={shell.adminBadges}
      unreadNotifications={shell.unreadNotifications}
      viewerRole={viewerRole}
      activeTab={tab}
      club={{
        id: club.id,
        name: club.name,
        city: club.city ?? undefined,
        country: club.country ?? undefined,
        league: club.league ?? undefined,
        foundedYear: club.foundedYear ?? undefined,
        officialWebsite: club.officialWebsite ?? undefined,
        stadiumName: club.stadiumName ?? undefined,
        stadiumCapacity: club.stadiumCapacity ?? undefined,
        stadiumAddress: club.stadiumAddress ?? undefined,
        stadiumMapUrl: club.stadiumMapUrl ?? undefined,
        logoUrl: club.logoKey ? `${r2BaseUrl}/${club.logoKey}` : undefined,
        coverUrl: club.coverKey ? `${r2BaseUrl}/${club.coverKey}` : undefined,
        bio: club.bio ?? undefined,
        verificationStatus: toUiVerificationStatus(club.verificationStatus),
        profileViewCount: club.profileViewCount,
        subscriberCount: club._count.subscribers,
        rosterEntries: club.rosterEntries.map((e) => ({
          id: e.id,
          playerName: e.playerName,
          position: e.position ?? undefined,
          jerseyNumber: e.jerseyNumber ?? undefined,
        })),
        historyEvents: club.historyEvents.map((e) => ({
          id: e.id,
          year: e.year,
          title: e.title,
          description: e.description ?? undefined,
        })),
        posts: club.posts.map((p) => ({
          id: p.id,
          title: p.title,
          body: p.body,
          likeCount: p._count.likes,
          createdAt: p.createdAt.toISOString(),
        })),
      }}
      isSubscribed={isSubscribed}
    />
  );
}
