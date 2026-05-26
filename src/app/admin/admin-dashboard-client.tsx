'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ShieldIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

type AdminKpi = {
  totalUsers: number;
  pendingFootballers: number;
  pendingClubs: number;
  pendingServiceRequests: number;
  verifiedFootballers: number;
  verifiedClubs: number;
};

type PendingFootballer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

type PendingClub = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type PendingServiceRequest = {
  id: string;
  requestCode: string;
  categoryName: string;
  email: string;
  createdAt: string;
};

type AdminDashboardUser = {
  name: string;
  initials: string;
  email?: string;
};

type AdminDashboardClientProps = {
  currentPath: string;
  userId: string;
  user: AdminDashboardUser;
  kpi: AdminKpi;
  recentPendingFootballers: PendingFootballer[];
  recentPendingClubs: PendingClub[];
  recentServiceRequests: PendingServiceRequest[];
};

type KpiCardVariant = 'default' | 'warning' | 'success';

function KpiCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: KpiCardVariant;
}) {
  return (
    <div
      data-slot="kpi-card"
      className={cn(
        'rounded-lg border bg-card p-5 flex items-start gap-4',
        variant === 'warning' &&
          'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20',
        variant === 'success' &&
          'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20',
      )}
    >
      <div
        className={cn(
          'rounded-md p-2 shrink-0',
          variant === 'default' && 'bg-muted',
          variant === 'warning' && 'bg-amber-100 dark:bg-amber-900/40',
          variant === 'success' && 'bg-emerald-100 dark:bg-emerald-900/40',
        )}
      >
        <Icon
          className={cn(
            'size-5',
            variant === 'default' && 'text-muted-foreground',
            variant === 'warning' && 'text-amber-600 dark:text-amber-400',
            variant === 'success' && 'text-emerald-600 dark:text-emerald-400',
          )}
        />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-2xl font-semibold leading-tight tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4"
      >
        {linkLabel}
        <ArrowRightIcon className="size-3" />
      </Link>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
        {label}
      </td>
    </tr>
  );
}

export function AdminDashboardClient({
  currentPath,
  userId,
  user,
  kpi,
  recentPendingFootballers,
  recentPendingClubs,
  recentServiceRequests,
}: AdminDashboardClientProps) {
  const router = useRouter();

  const handleSignOut = React.useCallback(() => {
    signOut({ callbackUrl: '/auth/signin' }).then(() => router.push('/auth/signin'));
  }, [router]);

  const totalPending = kpi.pendingFootballers + kpi.pendingClubs;

  return (
    <AppShell
      role="admin"
      currentPath={currentPath}
      user={user}
      userId={userId}
      onSignOut={handleSignOut}
    >
      <div className="space-y-8">
        {/* Page header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldIcon className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">პლატფორმის სტატისტიკა და მართვის ცენტრი</p>
        </div>

        {/* KPI grid */}
        <section aria-label="KPI სტატისტიკა">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="სულ მომხმარებელი" value={kpi.totalUsers} icon={UsersIcon} />
            <KpiCard
              label="მოლოდინი — ფეხბ."
              value={kpi.pendingFootballers}
              icon={ClockIcon}
              variant={kpi.pendingFootballers > 0 ? 'warning' : 'default'}
            />
            <KpiCard
              label="მოლოდინი — კლუბი"
              value={kpi.pendingClubs}
              icon={ClockIcon}
              variant={kpi.pendingClubs > 0 ? 'warning' : 'default'}
            />
            <KpiCard
              label="დადასტ. ფეხბ."
              value={kpi.verifiedFootballers}
              icon={CheckCircleIcon}
              variant="success"
            />
            <KpiCard
              label="დადასტ. კლუბი"
              value={kpi.verifiedClubs}
              icon={CheckCircleIcon}
              variant="success"
            />
            <KpiCard
              label="სერვ. მოლოდინი"
              value={kpi.pendingServiceRequests}
              icon={AlertCircleIcon}
              variant={kpi.pendingServiceRequests > 0 ? 'warning' : 'default'}
            />
          </div>
        </section>

        {/* Verification queue summary */}
        <section aria-label="ვერიფიკაციის რიგი">
          <SectionHeading
            title={`ვერიფიკაციის რიგი${totalPending > 0 ? ` (${totalPending})` : ''}`}
            href="/admin/verification"
            linkLabel="ყველა ნახვა"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Pending footballers */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                <span className="text-xs font-medium text-muted-foreground">ფეხბურთელები</span>
                {kpi.pendingFootballers > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {kpi.pendingFootballers}
                  </Badge>
                )}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {recentPendingFootballers.length === 0 ? (
                    <EmptyRow label="მოლოდინში არ არის" />
                  ) : (
                    recentPendingFootballers.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium">
                          {f.firstName} {f.lastName}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[120px] hidden sm:table-cell">
                          {f.email}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-right whitespace-nowrap text-xs">
                          {formatRelativeTime(f.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pending clubs */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                <span className="text-xs font-medium text-muted-foreground">კლუბები</span>
                {kpi.pendingClubs > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {kpi.pendingClubs}
                  </Badge>
                )}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {recentPendingClubs.length === 0 ? (
                    <EmptyRow label="მოლოდინში არ არის" />
                  ) : (
                    recentPendingClubs.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium">{c.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[120px] hidden sm:table-cell">
                          {c.email}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-right whitespace-nowrap text-xs">
                          {formatRelativeTime(c.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Service requests summary */}
        <section aria-label="სერვისის მოთხოვნები">
          <SectionHeading
            title={`სერვისის მოთხოვნები${kpi.pendingServiceRequests > 0 ? ` (${kpi.pendingServiceRequests})` : ''}`}
            href="/admin/service-requests"
            linkLabel="ყველა ნახვა"
          />

          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    კოდი
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    კატეგორია
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">
                    ელ-ფოსტა
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    თარიღი
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentServiceRequests.length === 0 ? (
                  <EmptyRow label="მოლოდინში არ არის" />
                ) : (
                  recentServiceRequests.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {r.requestCode}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{r.categoryName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[140px] hidden sm:table-cell">
                        {r.email}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-right whitespace-nowrap text-xs">
                        {formatRelativeTime(r.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick actions */}
        <section aria-label="სწრაფი გადასვლები">
          <h2 className="text-sm font-semibold mb-3">სექციები</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickLink
              href="/admin/verification"
              title="ვერიფიკაციის რიგი"
              description="ფეხბ. და კლუბების განხილვა"
              badge={totalPending > 0 ? totalPending : undefined}
            />
            <QuickLink
              href="/admin/service-requests"
              title="სერვ. მოთხოვნები"
              description="მოლოდინში მყოფი მოთხოვნები"
              badge={kpi.pendingServiceRequests > 0 ? kpi.pendingServiceRequests : undefined}
            />
            <QuickLink
              href="/admin/users"
              title="მომხ. მართვა"
              description="ყველა მომხმარებელი, სტატუსი"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function QuickLink({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border bg-card p-4 flex items-center justify-between hover:border-primary/50 hover:bg-muted/30 transition-colors"
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge !== undefined && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRightIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}

export type { AdminKpi, PendingFootballer, PendingClub, PendingServiceRequest, AdminDashboardUser };
