import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { FootballerDashboardClient } from './footballer-dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

function computeProfileCompletion(profile: {
  dateOfBirth: Date | null;
  nationality: string | null;
  city: string | null;
  phone: string | null;
  bio: string | null;
  positions: string[];
  height: number | null;
  weight: number | null;
  dominantFoot: string | null;
  currentClub: string | null;
  experienceLevel: string | null;
  avatarKey: string | null;
}): { percent: number; missingFields: string[] } {
  const checks: [boolean, string][] = [
    [!!profile.dateOfBirth, 'დაბადების თარიღი'],
    [!!profile.nationality, 'ეროვნება'],
    [!!profile.city, 'ქალაქი'],
    [!!profile.phone, 'ტელეფონი'],
    [!!profile.bio, 'ბიო'],
    [profile.positions.length > 0, 'პოზიცია'],
    [!!profile.height, 'სიმაღლე'],
    [!!profile.weight, 'წონა'],
    [!!profile.dominantFoot, 'სასურველი ფეხი'],
    [!!profile.currentClub, 'მიმდინარე კლუბი'],
    [!!profile.experienceLevel, 'გამოცდილება'],
    [!!profile.avatarKey, 'ავატარი'],
  ];

  const filled = checks.filter(([ok]) => ok).length;
  const missingFields = checks.filter(([ok]) => !ok).map(([, label]) => label);
  return {
    percent: Math.round((filled / checks.length) * 100),
    missingFields,
  };
}

export default async function FootballerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'FOOTBALLER') {
    redirect('/dashboard');
  }

  const userId = session.user.id;

  const [profile, unreadNotifications, newsfeedPosts] = await Promise.all([
    db.footballerProfile.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        nationality: true,
        city: true,
        positions: true,
        avatarKey: true,
        dateOfBirth: true,
        phone: true,
        bio: true,
        height: true,
        weight: true,
        dominantFoot: true,
        currentClub: true,
        experienceLevel: true,
        verificationStatus: true,
        profileViewCount: true,
        shortlistedBy: { select: { id: true } },
        subscriptions: {
          select: {
            clubProfile: {
              select: { id: true, name: true, logoKey: true },
            },
          },
        },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
    db.clubPost.findMany({
      where: {
        club: {
          subscribers: {
            some: {
              footballerProfile: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        club: { select: { id: true, name: true, logoKey: true } },
        _count: { select: { likes: true } },
      },
    }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  const completion = computeProfileCompletion(profile);
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = [profile.firstName[0], profile.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const subscribedClubs = profile.subscriptions.map((s) => ({
    id: s.clubProfile.id,
    name: s.clubProfile.name,
    logoUrl: s.clubProfile.logoKey ? `${r2BaseUrl}/${s.clubProfile.logoKey}` : undefined,
  }));

  const newsfeed = newsfeedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    createdAt: p.createdAt.toISOString(),
    likeCount: p._count.likes,
    club: {
      id: p.club.id,
      name: p.club.name,
      logoUrl: p.club.logoKey ? `${r2BaseUrl}/${p.club.logoKey}` : undefined,
    },
  }));

  return (
    <FootballerDashboardClient
      currentPath="/dashboard/footballer"
      user={{
        name,
        initials,
        image: profile.avatarKey ? `${r2BaseUrl}/${profile.avatarKey}` : undefined,
        position: profile.positions[0] ?? undefined,
        nationality: profile.nationality ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
        profileCompletion: completion.percent,
      }}
      stats={{
        views: profile.profileViewCount,
        saves: profile.shortlistedBy.length,
        unreadMessages: 0,
      }}
      unreadNotifications={unreadNotifications}
      subscribedClubs={subscribedClubs}
      newsfeedPosts={newsfeed}
      profileMissingFields={completion.missingFields}
    />
  );
}
