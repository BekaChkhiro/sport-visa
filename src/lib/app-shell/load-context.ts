import 'server-only';

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { countUnreadMessages } from '@/lib/messages';
import { computeFootballerProfileCompletion } from '@/lib/footballer-profile/completion';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';

export type AppShellContext = {
  userId: string;
  role: AppSidebarRole;
  user: AppSidebarUser & { email?: string };
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
};

function toUiVerificationStatus(status: string): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '?'
  );
}

export type AppShellGate = 'unauthenticated' | 'unverified';

// Resolves the AppShell context (role, user, stats, unread counts) from the
// current session. Returns a gate reason instead of the context when the
// session is missing or the email is not verified — callers redirect.
export async function loadAppShellContext(): Promise<AppShellContext | AppShellGate> {
  const session = await auth();
  if (!session?.user) return 'unauthenticated';
  if (!session.user.emailVerified) return 'unverified';

  const userId = session.user.id;
  const role = session.user.role;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  if (role === 'ADMIN') {
    const [adminUser, unreadNotifications, pendingVerifications, pendingServiceRequests] =
      await Promise.all([
        db.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true, email: true },
        }),
        db.notification.count({ where: { userId, read: false } }),
        db.footballerProfile.count({ where: { verificationStatus: 'PENDING' } }),
        db.serviceRequest.count({ where: { status: 'PENDING' } }),
      ]);

    const name = `${adminUser?.firstName ?? ''} ${adminUser?.lastName ?? ''}`.trim() || 'Admin';
    return {
      userId,
      role: 'admin',
      user: {
        name,
        initials: initialsFromName(name),
        email: adminUser?.email ?? undefined,
      },
      adminBadges: { pendingVerifications, pendingServiceRequests },
      unreadNotifications,
    };
  }

  if (role === 'FOOTBALLER') {
    const [profile, unreadNotifications, unreadMessages] = await Promise.all([
      db.footballerProfile.findUnique({
        where: { userId },
        include: {
          _count: { select: { shortlistedBy: true } },
        },
      }),
      db.notification.count({ where: { userId, read: false } }),
      countUnreadMessages(userId, 'footballer'),
    ]);

    if (!profile) {
      const name = session.user.name ?? 'User';
      return {
        userId,
        role: 'footballer',
        user: { name, initials: initialsFromName(name), email: session.user.email ?? undefined },
        unreadNotifications,
      };
    }

    const name = `${profile.firstName} ${profile.lastName}`.trim();
    return {
      userId,
      role: 'footballer',
      user: {
        name,
        initials: initialsFromName(name) || profile.firstName[0]?.toUpperCase() || '?',
        image: profile.avatarKey ? `${r2BaseUrl}/${profile.avatarKey}` : undefined,
        position: profile.positions[0] ?? undefined,
        nationality: profile.nationality ?? undefined,
        city: profile.city ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
        profileCompletion: computeFootballerProfileCompletion(profile).percent,
        email: session.user.email ?? undefined,
      },
      sidebarStats: {
        views: profile.profileViewCount,
        saves: profile._count.shortlistedBy,
        unreadMessages,
      },
      unreadNotifications,
    };
  }

  // CLUB
  const [profile, unreadNotifications, unreadMessages] = await Promise.all([
    db.clubProfile.findUnique({
      where: { userId },
      select: {
        name: true,
        city: true,
        logoKey: true,
        verificationStatus: true,
        profileViewCount: true,
        _count: { select: { shortlistedPlayers: true } },
      },
    }),
    db.notification.count({ where: { userId, read: false } }),
    countUnreadMessages(userId, 'club'),
  ]);

  if (!profile) {
    const name = session.user.name ?? 'Club';
    return {
      userId,
      role: 'club',
      user: { name, initials: initialsFromName(name), email: session.user.email ?? undefined },
      unreadNotifications,
    };
  }

  return {
    userId,
    role: 'club',
    user: {
      name: profile.name,
      initials: initialsFromName(profile.name),
      image: profile.logoKey ? `${r2BaseUrl}/${profile.logoKey}` : undefined,
      city: profile.city ?? undefined,
      verificationStatus: toUiVerificationStatus(profile.verificationStatus),
      email: session.user.email ?? undefined,
    },
    sidebarStats: {
      shortlistCount: profile._count.shortlistedPlayers,
      views: profile.profileViewCount,
      unreadMessages,
    },
    unreadNotifications,
  };
}

// Convenience wrapper: loads the context and redirects on gate failures.
// Pass the current pathname so callbackUrl can route the user back after signin.
export async function requireAppShellContext(callbackUrl: string): Promise<AppShellContext> {
  const result = await loadAppShellContext();
  if (result === 'unauthenticated') {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (result === 'unverified') {
    redirect('/verification-pending');
  }
  return result;
}
