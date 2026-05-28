'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProfileAvatar } from '@/components/profile-avatar';
import {
  AlertCircleIcon,
  BarChartIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  FlagIcon,
  GridViewIcon,
  ListViewIcon,
  MessageCircleIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  UsersIcon,
} from '@/components/icons';
import { type VerificationStatus } from '@/components/verification-badge';
import { cn } from '@/lib/utils';

type AppSidebarRole = 'footballer' | 'club' | 'admin';

type AppSidebarUser = {
  name: string;
  initials: string;
  image?: string;
  position?: string;
  nationality?: string;
  city?: string;
  verificationStatus?: VerificationStatus;
  profileCompletion?: number;
};

type AppSidebarStats = {
  views?: number;
  saves?: number;
  unreadMessages?: number;
  shortlistCount?: number;
};

type AppSidebarAdminBadges = {
  pendingVerifications?: number;
  pendingServiceRequests?: number;
};

type AppSidebarProps = {
  role: AppSidebarRole;
  currentPath: string;
  user: AppSidebarUser;
  stats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  className?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
};

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function NavRow({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-foreground hover:bg-muted',
      )}
    >
      {isActive ? (
        <span aria-hidden="true" className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-primary" />
      ) : null}
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badgeCount && item.badgeCount > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {item.badgeCount > 99 ? '99+' : item.badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

function FootballerSidebar({
  currentPath,
  user,
  stats,
}: {
  currentPath: string;
  user: AppSidebarUser;
  stats?: AppSidebarStats;
}) {
  const navItems: NavItem[] = [
    { href: '/services/request', label: 'სერვისის მოთხოვნა', icon: PlusIcon },
    { href: '/services/my-requests', label: 'ჩემი მოთხოვნები', icon: ListViewIcon },
    { href: '/clubs', label: 'კლუბების ძიება', icon: SearchIcon },
    { href: '/chats', label: 'ჩატები', icon: MessageCircleIcon, badgeCount: stats?.unreadMessages },
  ];

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-3 py-2 text-center">
        <ProfileAvatar
          src={user.image}
          fallback={user.initials}
          size="lg"
          verificationStatus={user.verificationStatus}
        />
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-semibold leading-snug">{user.name}</h2>
          {(user.position || user.nationality) && (
            <p className="text-xs text-muted-foreground">
              {[user.position, user.nationality].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {typeof user.profileCompletion === 'number' ? (
          <div className="w-full">
            <Progress value={user.profileCompletion} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              პროფ. შესრულდა {Math.round(user.profileCompletion)}%
            </p>
          </div>
        ) : null}
        <div className="flex w-full gap-2">
          <Button variant="default" size="sm" asChild className="flex-1">
            <Link href="/profile/edit">
              <EditIcon className="size-3.5" />
              რედაქტ.
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/profile/preview">
              <EyeIcon className="size-3.5" />
              ნახვა
            </Link>
          </Button>
        </div>
      </div>

      <hr className="my-4 border-border" />

      <GroupHeading>სწრაფი ქმედებები</GroupHeading>
      <nav className="flex flex-col gap-1 px-1">
        {navItems.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            isActive={currentPath === item.href || currentPath.startsWith(`${item.href}/`)}
          />
        ))}
      </nav>

      {stats ? (
        <>
          <hr className="my-4 border-border" />
          <GroupHeading>სტატისტიკა</GroupHeading>
          <ul className="flex flex-col gap-2 px-3">
            <li className="flex items-center gap-2 text-sm">
              <EyeIcon className="size-4 text-muted-foreground" />
              <span className="font-semibold">{stats.views ?? 0}</span>
              <span className="text-xs text-muted-foreground">ნახვები</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <StarIcon className="size-4 text-muted-foreground" />
              <span className="font-semibold">{stats.saves ?? 0}</span>
              <span className="text-xs text-muted-foreground">შენახვები</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <BarChartIcon className="size-4 text-muted-foreground" />
              <span className="font-semibold">{stats.unreadMessages ?? 0}</span>
              <span className="text-xs text-muted-foreground">წერილები</span>
            </li>
          </ul>
        </>
      ) : null}
    </>
  );
}

function ClubSidebar({
  currentPath,
  user,
  stats,
}: {
  currentPath: string;
  user: AppSidebarUser;
  stats?: AppSidebarStats;
}) {
  const navItems: NavItem[] = [
    { href: '/posts/new', label: '+ გამოქვ.', icon: PlusIcon },
    { href: '/directory', label: 'Directory', icon: SearchIcon },
    {
      href: '/shortlist',
      label: 'შ. სია',
      icon: StarIcon,
      badgeCount: stats?.shortlistCount,
    },
    { href: '/chats', label: 'ჩატები', icon: MessageCircleIcon, badgeCount: stats?.unreadMessages },
  ];

  return (
    <>
      <div className="flex flex-col items-start gap-2 px-3 py-2">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            src={user.image}
            fallback={user.initials}
            size="md"
            rounded="md"
            verificationStatus={user.verificationStatus}
          />
          <div className="flex flex-col">
            <h2 className="text-base font-semibold leading-snug">{user.name}</h2>
            {user.city ? <p className="text-xs text-muted-foreground">{user.city}</p> : null}
          </div>
        </div>
        <div className="flex w-full gap-2">
          <Button variant="default" size="sm" asChild className="flex-1">
            <Link href="/profile/club/edit">
              <EditIcon className="size-3.5" />
              რედ.
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/profile/club/preview">
              <EyeIcon className="size-3.5" />
              პრევიუ
            </Link>
          </Button>
        </div>
      </div>

      <hr className="my-4 border-border" />

      <GroupHeading>სწრაფი ქმედებები</GroupHeading>
      <nav className="flex flex-col gap-1 px-1">
        {navItems.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            isActive={currentPath === item.href || currentPath.startsWith(`${item.href}/`)}
          />
        ))}
      </nav>

      <hr className="my-4 border-border" />
      <GroupHeading>სტატისტიკა</GroupHeading>
      <ul className="flex flex-col gap-2 px-3">
        <li className="flex items-center gap-2 text-sm">
          <EyeIcon className="size-4 text-muted-foreground" />
          <span className="font-semibold">{stats?.views ?? 0}</span>
          <span className="text-xs text-muted-foreground">ნახვები</span>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <UsersIcon className="size-4 text-muted-foreground" />
          <span className="font-semibold">{stats?.shortlistCount ?? 0}</span>
          <span className="text-xs text-muted-foreground">შერჩ. მოთამაშე</span>
        </li>
      </ul>
    </>
  );
}

function AdminSidebar({
  currentPath,
  user,
  adminBadges,
}: {
  currentPath: string;
  user: AppSidebarUser;
  adminBadges?: AppSidebarAdminBadges;
}) {
  const navItems: NavItem[] = [
    { href: '/admin', label: 'Admin Panel', icon: GridViewIcon },
    {
      href: '/admin/verification',
      label: 'ვერიფიკაციის რიგი',
      icon: ShieldIcon,
      badgeCount: adminBadges?.pendingVerifications,
    },
    {
      href: '/admin/service-requests',
      label: 'სერვ. მოთხოვნები',
      icon: FileTextIcon,
      badgeCount: adminBadges?.pendingServiceRequests,
    },
    { href: '/admin/users', label: 'მომხ. მართვა', icon: UsersIcon },
    { href: '/admin/moderation', label: 'მოდ. ინსტ.', icon: FlagIcon },
    { href: '/admin/ref-data', label: 'სცნობ. მონ.', icon: SettingsIcon },
  ];

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-3 py-2 text-center">
        <ProfileAvatar src={user.image} fallback={user.initials} size="md" />
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold leading-snug">{user.name}</h2>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </div>

      <hr className="my-4 border-border" />

      <GroupHeading>ნავიგაცია</GroupHeading>
      <nav className="flex flex-col gap-1 px-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? currentPath === '/admin'
              : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
          return <NavRow key={item.href} item={item} isActive={isActive} />;
        })}
      </nav>

      {(adminBadges?.pendingVerifications ?? 0) + (adminBadges?.pendingServiceRequests ?? 0) >
        0 && (
        <>
          <hr className="my-4 border-border" />
          <GroupHeading>მოლოდინი</GroupHeading>
          <ul className="flex flex-col gap-2 px-3">
            {(adminBadges?.pendingVerifications ?? 0) > 0 && (
              <li className="flex items-center gap-2 text-sm">
                <ShieldIcon className="size-4 text-amber-500" />
                <span className="font-semibold">{adminBadges?.pendingVerifications}</span>
                <span className="text-xs text-muted-foreground">ვერიფ.</span>
              </li>
            )}
            {(adminBadges?.pendingServiceRequests ?? 0) > 0 && (
              <li className="flex items-center gap-2 text-sm">
                <AlertCircleIcon className="size-4 text-amber-500" />
                <span className="font-semibold">{adminBadges?.pendingServiceRequests}</span>
                <span className="text-xs text-muted-foreground">სერვ. მოთხ.</span>
              </li>
            )}
          </ul>
        </>
      )}
    </>
  );
}

function AppSidebar({ role, currentPath, user, stats, adminBadges, className }: AppSidebarProps) {
  return (
    <aside
      data-slot="app-sidebar"
      className={cn(
        'sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-border bg-card px-4 py-6 lg:block',
        className,
      )}
    >
      {role === 'admin' ? (
        <AdminSidebar currentPath={currentPath} user={user} adminBadges={adminBadges} />
      ) : role === 'footballer' ? (
        <FootballerSidebar currentPath={currentPath} user={user} stats={stats} />
      ) : (
        <ClubSidebar currentPath={currentPath} user={user} stats={stats} />
      )}
    </aside>
  );
}

export { AppSidebar };
export type { AppSidebarRole, AppSidebarUser, AppSidebarStats, AppSidebarAdminBadges };
