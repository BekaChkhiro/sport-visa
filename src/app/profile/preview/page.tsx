import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import type { VerificationStatus } from '@/components/verification-badge';
import { ProfilePreviewClient } from './profile-preview-client';

export const metadata: Metadata = {
  title: 'პროფილის პრევიუ — კლუბების ხედვა',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ProfilePreviewPage() {
  const shell = await requireAppShellContext('/profile/preview');
  if (shell.role !== 'footballer') {
    redirect('/dashboard');
  }
  const userId = shell.userId;

  const profile = await db.footballerProfile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      nationality: true,
      city: true,
      country: true,
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
        select: {
          id: true,
          clubName: true,
          startYear: true,
          endYear: true,
          position: true,
        },
      },
      galleryItems: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true, mediaKey: true, orderIndex: true },
      },
    },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const name = `${profile.firstName} ${profile.lastName}`.trim();

  const age = profile.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
      )
    : undefined;

  return (
    <ProfilePreviewClient
      currentPath="/profile/preview"
      userId={userId}
      user={shell.user}
      unreadNotifications={shell.unreadNotifications}
      sidebarStats={shell.sidebarStats}
      profile={{
        name,
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
      }}
    />
  );
}
