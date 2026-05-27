import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { computeFootballerProfileCompletion } from '@/lib/footballer-profile/completion';
import { FootballerDashboardClient } from './footballer-dashboard-client';

export const metadata: Metadata = {
  title: 'მთავარი',
};

export default async function FootballerDashboardPage() {
  const shell = await requireAppShellContext('/dashboard/footballer');

  if (shell.role !== 'footballer') {
    redirect('/dashboard');
  }

  const userId = shell.userId;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [profile, newsfeedPosts, rawServiceRequests, unreadMessages] = await Promise.all([
    db.footballerProfile.findUnique({
      where: { userId },
      select: {
        dateOfBirth: true,
        nationality: true,
        city: true,
        phone: true,
        bio: true,
        positions: true,
        height: true,
        weight: true,
        dominantFoot: true,
        currentClub: true,
        experienceLevel: true,
        avatarKey: true,
        subscriptions: {
          select: {
            clubProfile: {
              select: { id: true, name: true, logoKey: true },
            },
          },
        },
      },
    }),
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
    db.serviceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        requestCode: true,
        status: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
    db.message.count({
      where: {
        conversation: { footballerUserId: userId },
        senderUserId: { not: userId },
        read: false,
      },
    }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  const completion = computeFootballerProfileCompletion(profile);

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

  const serviceRequests = rawServiceRequests.map((r) => ({
    id: r.id,
    requestCode: r.requestCode,
    status: r.status as 'PENDING' | 'RESOLVED' | 'REJECTED',
    createdAt: r.createdAt.toISOString(),
    categoryName: r.category.name,
  }));

  return (
    <FootballerDashboardClient
      currentPath="/dashboard/footballer"
      userId={userId}
      user={{
        ...shell.user,
        profileCompletion: completion.percent,
      }}
      stats={{
        ...(shell.sidebarStats ?? {}),
        unreadMessages,
      }}
      unreadNotifications={shell.unreadNotifications}
      subscribedClubs={subscribedClubs}
      newsfeedPosts={newsfeed}
      profileMissingFields={completion.missingFields}
      serviceRequests={serviceRequests}
    />
  );
}
