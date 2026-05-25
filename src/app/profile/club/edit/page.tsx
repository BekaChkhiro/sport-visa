import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ClubProfileEditClient } from './club-profile-edit-client';

export const metadata: Metadata = {
  title: 'კლუბის პროფილის რედაქტირება',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ClubProfileEditPage() {
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
      stadiumName: true,
      stadiumCapacity: true,
      officialWebsite: true,
      logoKey: true,
      coverKey: true,
      bio: true,
      isVisible: true,
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
    <ClubProfileEditClient
      currentPath="/profile/club/edit"
      user={{
        name: profile.name,
        initials,
        image: profile.logoKey ? `${r2BaseUrl}/${profile.logoKey}` : undefined,
        city: profile.city ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
      }}
      stats={{
        views: profile.profileViewCount,
        shortlistCount: profile._count.shortlistedPlayers,
        unreadMessages: 0,
      }}
      initialIdentity={{
        name: profile.name,
        foundedYear: profile.foundedYear != null ? String(profile.foundedYear) : '',
        country: profile.country ?? '',
        city: profile.city ?? '',
        league: profile.league ?? '',
        stadiumName: profile.stadiumName ?? '',
        stadiumCapacity: profile.stadiumCapacity != null ? String(profile.stadiumCapacity) : '',
        officialWebsite: profile.officialWebsite ?? '',
      }}
      initialMedia={{
        logoUrl: profile.logoKey ? `${r2BaseUrl}/${profile.logoKey}` : undefined,
        logoKey: profile.logoKey ?? undefined,
        coverUrl: profile.coverKey ? `${r2BaseUrl}/${profile.coverKey}` : undefined,
        coverKey: profile.coverKey ?? undefined,
      }}
      initialBio={profile.bio ?? ''}
      initialHistoryEvents={profile.historyEvents}
      initialRosterEntries={profile.rosterEntries}
      isVisible={profile.isVisible}
    />
  );
}
