import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ClubProfilePreviewClient } from './club-profile-preview-client';

export const metadata: Metadata = {
  title: 'კლუბის პროფილის პრევიუ',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ClubProfilePreviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'CLUB') {
    redirect('/dashboard');
  }

  const userId = session.user.id;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const profile = await db.clubProfile.findUnique({
    where: { userId },
    select: {
      name: true,
      foundedYear: true,
      country: true,
      city: true,
      league: true,
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
      _count: { select: { shortlistedPlayers: true } },
      historyEvents: {
        select: { id: true, year: true, title: true, description: true },
        orderBy: [{ year: 'asc' }, { orderIndex: 'asc' }],
      },
      rosterEntries: {
        select: { id: true, playerName: true, position: true, jerseyNumber: true },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <ClubProfilePreviewClient
      currentPath="/profile/club/preview"
      user={{
        name: profile.name,
        initials,
        image: profile.logoKey ? `${r2BaseUrl}/${profile.logoKey}` : undefined,
        city: profile.city ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
      }}
      profile={{
        name: profile.name,
        foundedYear: profile.foundedYear ?? undefined,
        country: profile.country ?? undefined,
        city: profile.city ?? undefined,
        league: profile.league ?? undefined,
        officialWebsite: profile.officialWebsite ?? undefined,
        stadiumName: profile.stadiumName ?? undefined,
        stadiumCapacity: profile.stadiumCapacity ?? undefined,
        stadiumAddress: profile.stadiumAddress ?? undefined,
        stadiumMapUrl: profile.stadiumMapUrl ?? undefined,
        logoUrl: profile.logoKey ? `${r2BaseUrl}/${profile.logoKey}` : undefined,
        coverUrl: profile.coverKey ? `${r2BaseUrl}/${profile.coverKey}` : undefined,
        bio: profile.bio ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
        profileViewCount: profile.profileViewCount,
        shortlistCount: profile._count.shortlistedPlayers,
        historyEvents: profile.historyEvents.map((e) => ({
          id: e.id,
          year: e.year,
          title: e.title,
          description: e.description ?? undefined,
        })),
        rosterEntries: profile.rosterEntries.map((e) => ({
          id: e.id,
          playerName: e.playerName,
          position: e.position ?? undefined,
          jerseyNumber: e.jerseyNumber ?? undefined,
        })),
      }}
    />
  );
}
