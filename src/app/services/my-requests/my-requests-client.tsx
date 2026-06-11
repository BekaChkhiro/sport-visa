'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/ui/status-pill';
import {
  ArrowLeftIcon,
  PlusIcon,
  MealPlanIcon,
  PersonalTrainerIcon,
  TeamDoctorIcon,
  OtherServicesIcon,
} from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatKaDate } from '@/lib/format-ka-date';

type ServiceRequestStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

type ServiceRequest = {
  id: string;
  requestCode: string;
  status: ServiceRequestStatus;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  adminNote: string | null;
  contactPref: string;
  category: { id: string; name: string; slug: string; icon: string | null };
};

type MyRequestsUser = {
  name: string;
  initials: string;
  image?: string;
  position?: string;
  nationality?: string;
  verificationStatus?: VerificationStatus;
  profileCompletion: number;
};

type MyRequestsClientProps = {
  currentPath: string;
  userId: string;
  user: MyRequestsUser;
  stats: AppSidebarStats;
  unreadNotifications: number;
  requests: ServiceRequest[];
};

type FilterTab = 'all' | 'pending' | 'resolved' | 'rejected';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  'meal-plan': MealPlanIcon,
  'personal-trainer': PersonalTrainerIcon,
  'team-doctor': TeamDoctorIcon,
  other: OtherServicesIcon,
};

function categoryIcon(slug: string, icon: string | null) {
  const key = icon ?? slug;
  return ICON_MAP[key] ?? OtherServicesIcon;
}

function toStatusPill(status: ServiceRequestStatus): 'pending' | 'approved' | 'rejected' {
  if (status === 'RESOLVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

function formatDate(iso: string) {
  return formatKaDate(iso, { month: 'short', year: true });
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'ყველა' },
  { id: 'pending', label: 'მოლოდინში' },
  { id: 'resolved', label: 'დადასტურდა' },
  { id: 'rejected', label: 'უარყოფილია' },
];

export function MyRequestsClient({
  currentPath,
  userId,
  user,
  stats,
  unreadNotifications,
  requests,
}: MyRequestsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const filtered = requests.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return r.status === 'PENDING';
    if (activeTab === 'resolved') return r.status === 'RESOLVED';
    if (activeTab === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  return (
    <AppShell
      role="footballer"
      currentPath={currentPath}
      userId={userId}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
              მთავარზე დაბრუნება
            </Link>
          </Button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
                ჩემი სერვ. მოთხოვნები
              </h1>
              <p className="mt-1 text-[13.5px] text-ink-400">
                {requests.length === 0
                  ? 'სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია.'
                  : `სულ ${requests.length} მოთხოვნა`}
              </p>
            </div>
            <Button variant="default" size="sm" asChild className="shrink-0">
              <Link href="/services/request">
                <PlusIcon className="size-4" />
                ახ. მოთხ.
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        {requests.length > 0 && (
          <div
            className="flex gap-1 rounded-field border border-ink-800 bg-ink-900 p-1"
            role="tablist"
          >
            {TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? requests.length
                  : requests.filter((r) => r.status === tab.id.toUpperCase()).length;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-brand-400 text-ink-950'
                      : 'text-ink-400 hover:text-ink-100',
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                        activeTab === tab.id
                          ? 'bg-ink-950/30 text-ink-950'
                          : 'bg-ink-800 text-ink-400',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Section label + count */}
        {requests.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
              ჩემი მოთხოვნები
            </p>
            <span className="font-mono text-[12px] tabular-nums text-ink-600">
              {filtered.length} ჩანაწერი
            </span>
          </div>
        )}

        {/* Request list */}
        {requests.length === 0 ? (
          <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <EmptyState
              title="მოთხოვნები არ არის"
              description="სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <EmptyState title="ამ კატეგორიაში მოთხოვნა არ არის" description="სხვა ფილტრი სცადეთ." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <div className="divide-y divide-ink-800">
              {filtered.map((req) => {
                const Icon = categoryIcon(req.category.slug, req.category.icon);
                const pillStatus = toStatusPill(req.status);
                return (
                  <div key={req.id} className="px-5 py-4 transition-colors hover:bg-ink-800/30">
                    <div className="flex items-center gap-3.5">
                      {/* Category icon chip */}
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-ink-800 text-ink-300">
                        <Icon className="size-4.5" aria-hidden="true" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink-100">
                          {req.category.name}
                        </p>
                        <p className="truncate font-mono text-[11.5px] tabular-nums text-ink-500">
                          <span>{req.requestCode}</span>
                          {' · '}
                          <time dateTime={req.createdAt}>{formatDate(req.createdAt)}</time>
                        </p>
                      </div>

                      <StatusPill status={pillStatus} className="shrink-0" />
                    </div>

                    {/* Admin note */}
                    {req.adminNote && (
                      <div className="mt-3 flex gap-2.5 rounded-card border border-ink-800 bg-ink-950/50 px-3.5 py-2.5">
                        <svg
                          width={15}
                          height={15}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0 text-accent-400"
                          aria-hidden="true"
                        >
                          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                        </svg>
                        <p className="text-[12.5px] leading-relaxed text-ink-300">
                          <span className="font-semibold text-ink-200">ადმინის პასუხი:</span>{' '}
                          {req.adminNote}
                        </p>
                      </div>
                    )}

                    {/* User notes (shown when no admin note) */}
                    {req.notes && !req.adminNote && (
                      <p className="mt-1.5 line-clamp-2 pl-[54px] text-[12px] text-ink-500">
                        {req.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
