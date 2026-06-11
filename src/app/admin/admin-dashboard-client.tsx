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

type KpiCardVariant = 'default' | 'warning' | 'success' | 'flame';

function KpiCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  sub,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: KpiCardVariant;
  sub?: string;
}) {
  return (
    <div
      data-slot="kpi-card"
      className={cn(
        'rounded-card border bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700',
        variant === 'default' && 'border-ink-800',
        variant === 'warning' && 'border-warning-400/30',
        variant === 'success' && 'border-ink-800',
        variant === 'flame' && 'border-ink-800',
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[10px]',
            variant === 'default' && 'bg-ink-800 text-ink-300',
            variant === 'warning' && 'bg-warning-400/15 text-warning-300',
            variant === 'success' && 'bg-success-400/15 text-success-300',
            variant === 'flame' && 'bg-flame-400/15 text-flame-300',
          )}
        >
          <Icon className="size-[17px]" />
        </span>
      </div>
      <p className="mt-3 font-mono text-[26px] font-bold leading-none tracking-tight text-ink-50 tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[12px] text-ink-400">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-warning-300">{sub}</p>}
    </div>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
  icon: Icon,
  badge,
}: {
  title: string;
  href: string;
  linkLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-warning-400/15 text-warning-300">
          <Icon className="size-4" />
        </span>
        <h2 className="font-display text-[15px] font-bold text-ink-50">{title}</h2>
        {badge !== undefined && badge > 0 && (
          <span className="rounded-pill bg-flame-400/15 px-2 py-0.5 text-[11px] font-bold text-flame-300">
            {badge}
          </span>
        )}
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-[12.5px] font-medium text-accent-300 transition-colors hover:text-accent-200"
      >
        {linkLabel}
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-5 py-6 text-center text-[13px] text-ink-500">{label}</div>;
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
      adminBadges={{
        pendingVerifications: kpi.pendingFootballers + kpi.pendingClubs,
        pendingServiceRequests: kpi.pendingServiceRequests,
      }}
      onSignOut={handleSignOut}
    >
      <div className="space-y-7">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
            ადმინ პანელი
          </h1>
          <p className="text-[13.5px] text-ink-400">პლატფორმის სტატისტიკა და მართვის ცენტრი</p>
        </div>

        {/* KPI grid */}
        <section aria-label="KPI სტატისტიკა">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="სულ მომხმარებელი" value={kpi.totalUsers} icon={UsersIcon} />
            <KpiCard
              label="მოლოდინი — ფეხბ."
              value={kpi.pendingFootballers}
              icon={ClockIcon}
              variant={kpi.pendingFootballers > 0 ? 'warning' : 'default'}
              sub={kpi.pendingFootballers > 0 ? 'ვერიფიკაცია' : undefined}
            />
            <KpiCard
              label="მოლოდინი — კლუბი"
              value={kpi.pendingClubs}
              icon={ClockIcon}
              variant={kpi.pendingClubs > 0 ? 'warning' : 'default'}
              sub={kpi.pendingClubs > 0 ? 'ვერიფიკაცია' : undefined}
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
              variant={kpi.pendingServiceRequests > 0 ? 'flame' : 'default'}
            />
          </div>
        </section>

        {/* Queues grid */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Verification queue summary */}
          <section
            aria-label="ვერიფიკაციის რიგი"
            className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card"
          >
            <SectionHeading
              title={`ვერიფიკაციის რიგი${totalPending > 0 ? ` (${totalPending})` : ''}`}
              href="/admin/verification"
              linkLabel="ყველა ნახვა"
              icon={ShieldIcon}
              badge={totalPending > 0 ? totalPending : undefined}
            />

            {/* Pending footballers */}
            <div>
              <p className="px-5 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600">
                ფეხბურთელები · {kpi.pendingFootballers}
              </p>
              <div className="divide-y divide-ink-800">
                {recentPendingFootballers.length === 0 ? (
                  <EmptyRow label="მოლოდინში არ არის" />
                ) : (
                  recentPendingFootballers.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-800/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink-100">
                          {f.firstName} {f.lastName}
                        </p>
                        <p className="truncate text-[11.5px] text-ink-500">{f.email}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-ink-600">
                        <ClockIcon className="size-3" />
                        {formatRelativeTime(f.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending clubs */}
            <div className="border-t border-ink-800">
              <p className="px-5 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600">
                კლუბები · {kpi.pendingClubs}
              </p>
              <div className="divide-y divide-ink-800">
                {recentPendingClubs.length === 0 ? (
                  <EmptyRow label="მოლოდინში არ არის" />
                ) : (
                  recentPendingClubs.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-800/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink-100">{c.name}</p>
                        <p className="truncate text-[11.5px] text-ink-500">{c.email}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-ink-600">
                        <ClockIcon className="size-3" />
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Service requests summary */}
          <section
            aria-label="სერვისის მოთხოვნები"
            className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card"
          >
            <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-flame-400/15 text-flame-300">
                  <AlertCircleIcon className="size-4" />
                </span>
                <h2 className="font-display text-[15px] font-bold text-ink-50">
                  {`სერვისის მოთხოვნები${kpi.pendingServiceRequests > 0 ? ` (${kpi.pendingServiceRequests})` : ''}`}
                </h2>
                {kpi.pendingServiceRequests > 0 && (
                  <span className="rounded-pill bg-flame-400/15 px-2 py-0.5 text-[11px] font-bold text-flame-300">
                    {kpi.pendingServiceRequests}
                  </span>
                )}
              </div>
              <Link
                href="/admin/service-requests"
                className="flex items-center gap-1 text-[12.5px] font-medium text-accent-300 transition-colors hover:text-accent-200"
              >
                ყველა ნახვა
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-ink-800">
              {recentServiceRequests.length === 0 ? (
                <EmptyRow label="მოლოდინში არ არის" />
              ) : (
                recentServiceRequests.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ink-800/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink-100">
                        {r.categoryName}
                      </p>
                      <p className="truncate font-mono text-[11px] tabular-nums text-ink-500">
                        <span>{r.requestCode}</span>
                        <span className="text-ink-600"> · </span>
                        <span>{r.email}</span>
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-ink-600">
                      <ClockIcon className="size-3" />
                      {formatRelativeTime(r.createdAt)}
                    </span>
                    <span className="rounded-pill border border-warning-400/30 bg-warning-400/10 px-2 py-1 text-[10.5px] font-semibold text-warning-300">
                      მოლოდინში
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Quick links */}
        <section aria-label="სწრაფი გადასვლები">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
            სექციები
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <QuickLink
              href="/admin/moderation"
              title="მოდ. ინსტრ."
              description="პოსტებისა და ჩატების კონტ."
            />
            <QuickLink
              href="/admin/ref-data"
              title="სცნობ. მონ."
              description="ლიგები, კატეგ., სხვ."
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
      className="group flex items-center justify-between rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700 hover:bg-ink-800/40"
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium text-ink-100">{title}</span>
          {badge !== undefined && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-[12px] text-ink-500">{description}</p>
      </div>
      <ArrowRightIcon className="size-4 text-ink-600 transition-colors group-hover:text-ink-300 shrink-0" />
    </Link>
  );
}

export type { AdminKpi, PendingFootballer, PendingClub, PendingServiceRequest, AdminDashboardUser };
