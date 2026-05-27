'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  AppSidebar,
  type AppSidebarAdminBadges,
  type AppSidebarRole,
  type AppSidebarStats,
  type AppSidebarUser,
} from '@/components/app-sidebar';
import { MobileNavDrawer } from '@/components/mobile-nav-drawer';
import { NotificationsBell } from '@/components/notifications-bell';
import { NotificationsPanel } from '@/components/notifications-panel';
import { UserMenu } from '@/components/user-menu';
import { MenuIcon } from '@/components/icons';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

type AppShellRole = AppSidebarRole;

type AppShellUser = AppSidebarUser & {
  email?: string;
};

type AppShellProps = {
  role: AppShellRole;
  currentPath: string;
  user: AppShellUser;
  userId?: string | null;
  unreadNotifications?: number;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  onSignOut: () => void;
  children: React.ReactNode;
};

function AppShell({
  role,
  currentPath,
  user,
  userId = null,
  unreadNotifications = 0,
  sidebarStats,
  adminBadges,
  onSignOut,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const router = useRouter();

  const {
    notifications,
    unreadCount: liveUnreadCount,
    loading,
    markRead,
    markAllRead,
  } = useNotifications(userId);

  const unreadCount = userId ? liveUnreadCount : unreadNotifications;

  const profilePath =
    role === 'club' ? '/profile/club/edit' : role === 'admin' ? '/admin' : '/profile/edit';
  const settingsPath = role === 'admin' ? '/admin' : '/settings/notifications';

  return (
    <div data-slot="app-shell" className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:h-16 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="მენიუს გახსნა"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden"
          >
            <MenuIcon className="size-5" />
          </Button>
          <Link
            href={role === 'admin' ? '/admin' : '/dashboard'}
            className="flex items-center"
            aria-label="Sport Visa"
          >
            <Logo size="md" showWordmark />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {userId ? (
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
            />
          ) : (
            <NotificationsBell unreadCount={unreadCount} />
          )}
          <UserMenu
            user={{ name: user.name, initials: user.initials, image: user.image }}
            onProfile={() => router.push(profilePath)}
            onSettings={() => router.push(settingsPath)}
            onSignOut={onSignOut}
          />
        </div>
      </header>

      <div className="flex flex-1">
        <AppSidebar
          role={role}
          currentPath={currentPath}
          user={user}
          stats={sidebarStats}
          adminBadges={adminBadges}
        />

        <main className={cn('flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8')}>{children}</main>
      </div>

      <MobileNavDrawer
        role={role}
        currentPath={currentPath}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        user={{ name: user.name, initials: user.initials, image: user.image }}
      />
    </div>
  );
}

export { AppShell };
export type { AppShellRole, AppShellUser };
