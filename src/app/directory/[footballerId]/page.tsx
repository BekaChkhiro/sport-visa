import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { FootballerDetailClient } from './footballer-detail-client';

type Props = { params: Promise<{ footballerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { footballerId } = await params;
  const profile = await db.footballerProfile.findUnique({
    where: { id: footballerId },
    select: { firstName: true, lastName: true },
  });
  if (!profile) return { title: 'ფეხბ. ვერ მოიძებნა' };
  return { title: `${profile.firstName} ${profile.lastName}` };
}

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function FootballerDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'CLUB') redirect('/dashboard');

  const { footballerId } = await params;

  const [profile, clubProfile, unreadNotifications] = await Promise.all([
    db.footballerProfile.findUnique({
      where: { id: footballerId, verificationStatus: 'VERIFIED', isVisible: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        nationality: true,
        city: true,
        country: true,
        phone: true,
        bio: true,
        positions: true,
        dominantFoot: true,
        height: true,
        weight: true,
        currentClub: true,
        jerseyNumber: true,
        experienceLevel: true,
        desiredLeague: true,
        avatarKey: true,
        coverKey: true,
        videoLinks: true,
        verificationStatus: true,
        profileViewCount: true,
        agentName: true,
        agentPhone: true,
        agentEmail: true,
        shortlistedBy: { select: { id: true } },
        careerEntries: {
          orderBy: [{ orderIndex: 'asc' }, { startYear: 'desc' }],
          select: { id: true, clubName: true, startYear: true, endYear: true, position: true },
        },
        galleryItems: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, mediaKey: true },
        },
      },
    }),
    db.clubProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        city: true,
        logoKey: true,
        verificationStatus: true,
        _count: { select: { shortlistedPlayers: true } },
      },
    }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  if (!profile) notFound();
  if (!clubProfile) redirect('/onboarding');

  const isShortlisted = await db.clubShortlist
    .findUnique({
      where: {
        clubProfileId_footballerProfileId: {
          clubProfileId: clubProfile.id,
          footballerProfileId: profile.id,
        },
      },
      select: { id: true },
    })
    .then((r) => !!r);

  // Increment profile view count (best-effort)
  db.footballerProfile
    .update({ where: { id: profile.id }, data: { profileViewCount: { increment: 1 } } })
    .catch(() => {});

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const age = profile.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
      )
    : undefined;

  const initials = clubProfile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <FootballerDetailClient
      currentPath="/directory"
      user={{
        name: clubProfile.name,
        initials,
        image: clubProfile.logoKey ? `${r2BaseUrl}/${clubProfile.logoKey}` : undefined,
        city: clubProfile.city ?? undefined,
        verificationStatus: toUiVerificationStatus(clubProfile.verificationStatus),
      }}
      sidebarStats={{ shortlistCount: clubProfile._count.shortlistedPlayers }}
      unreadNotifications={unreadNotifications}
      footballer={{
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        age,
        nationality: profile.nationality ?? undefined,
        city: profile.city ?? undefined,
        country: profile.country ?? undefined,
        bio: profile.bio ?? undefined,
        positions: profile.positions,
        dominantFoot: profile.dominantFoot ?? undefined,
        height: profile.height ?? undefined,
        weight: profile.weight ?? undefined,
        currentClub: profile.currentClub ?? undefined,
        jerseyNumber: profile.jerseyNumber ?? undefined,
        experienceLevel: profile.experienceLevel ?? undefined,
        desiredLeague: profile.desiredLeague ?? undefined,
        avatarUrl: profile.avatarKey ? `${r2BaseUrl}/${profile.avatarKey}` : undefined,
        coverUrl: profile.coverKey ? `${r2BaseUrl}/${profile.coverKey}` : undefined,
        videoLinks: profile.videoLinks,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
        profileViewCount: profile.profileViewCount,
        shortlistCount: profile.shortlistedBy.length,
        phone: isShortlisted ? (profile.phone ?? undefined) : undefined,
        agentName: profile.agentName ?? undefined,
        agentPhone: profile.agentPhone ?? undefined,
        agentEmail: profile.agentEmail ?? undefined,
        careerEntries: profile.careerEntries.map((e) => ({
          id: e.id,
          clubName: e.clubName,
          startYear: e.startYear,
          endYear: e.endYear ?? undefined,
          position: e.position ?? undefined,
        })),
        galleryPhotos: profile.galleryItems.map((g) => ({
          id: g.id,
          url: `${r2BaseUrl}/${g.mediaKey}`,
        })),
        isShortlisted,
      }}
    />
  );
}
