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
  return new Intl.DateTimeFormat('ka', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
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
      <div className="max-w-2xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
              Dashboard-ზე დაბრუნება
            </Link>
          </Button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ჩემი სერვ. მოთხოვნები</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {requests.length === 0
                  ? 'სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია.'
                  : `სულ ${requests.length} მოთხოვნა`}
              </p>
            </div>
            <Button variant="default" size="sm" asChild>
              <Link href="/services/request">
                <PlusIcon className="size-4" />
                ახ. მოთხ.
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        {requests.length > 0 && (
          <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist">
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
                    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted-foreground/20 text-muted-foreground',
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

        {/* Request list */}
        {requests.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="მოთხოვნები არ არის"
              description="სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState title="ამ კატეგორიაში მოთხოვნა არ არის" description="სხვა ფილტრი სცადეთ." />
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {filtered.map((req) => {
              const Icon = categoryIcon(req.category.slug, req.category.icon);
              const pillStatus = toStatusPill(req.status);
              return (
                <div key={req.id} className="flex items-start justify-between gap-4 px-4 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{req.category.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{req.requestCode}</p>
                      {req.notes && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {req.notes}
                        </p>
                      )}
                      {req.adminNote && (
                        <p className="mt-1 line-clamp-2 text-xs text-foreground/80">
                          💬 {req.adminNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusPill status={pillStatus} />
                    <time dateTime={req.createdAt} className="text-xs text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
