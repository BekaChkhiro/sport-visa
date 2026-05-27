import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { ProfileEditClient } from './profile-edit-client';

export const metadata: Metadata = {
  title: 'პროფილის რედაქტირება',
};

export default async function ProfileEditPage() {
  const shell = await requireAppShellContext('/profile/edit');
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
          orderIndex: true,
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

  return (
    <ProfileEditClient
      currentPath="/profile/edit"
      userId={userId}
      user={shell.user}
      unreadNotifications={shell.unreadNotifications}
      sidebarStats={shell.sidebarStats}
      initialAvatar={
        profile.avatarKey
          ? { key: profile.avatarKey, url: `${r2BaseUrl}/${profile.avatarKey}` }
          : null
      }
      initialCover={
        profile.coverKey ? { key: profile.coverKey, url: `${r2BaseUrl}/${profile.coverKey}` } : null
      }
      initialPersonalInfo={{
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : '',
        nationality: profile.nationality ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
      }}
      initialSportInfo={{
        positions: profile.positions,
        dominantFoot: profile.dominantFoot ?? '',
        height: profile.height != null ? String(profile.height) : '',
        weight: profile.weight != null ? String(profile.weight) : '',
        currentClub: profile.currentClub ?? '',
        jerseyNumber: profile.jerseyNumber != null ? String(profile.jerseyNumber) : '',
        experienceLevel: profile.experienceLevel ?? '',
        desiredLeague: profile.desiredLeague ?? '',
      }}
      initialCareerEntries={profile.careerEntries.map((e) => ({
        id: e.id,
        clubName: e.clubName,
        startYear: e.startYear,
        endYear: e.endYear ?? undefined,
        position: e.position ?? undefined,
        orderIndex: e.orderIndex,
      }))}
      initialAgentInfo={{
        agentName: profile.agentName ?? '',
        agentPhone: profile.agentPhone ?? '',
        agentEmail: profile.agentEmail ?? '',
      }}
      initialGalleryPhotos={profile.galleryItems.map((g) => ({
        id: g.id,
        mediaKey: g.mediaKey,
        url: `${r2BaseUrl}/${g.mediaKey}`,
      }))}
    />
  );
}
