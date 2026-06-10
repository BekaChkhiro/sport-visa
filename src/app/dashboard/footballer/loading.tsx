import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors FootballerDashboardClient redesign:
// greeting header + profile-completion banner + 3-col KPI strip +
// two-column feed/aside (feed cards + service-request rows + subscribed-clubs list).
// Wrapped in AppShellSkeleton so the sidebar and header stay visible while loading.

function KpiCardSkeleton() {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
      <div className="flex items-start justify-between">
        <Skeleton className="h-9 w-9 rounded-[10px] bg-ink-800" />
        <Skeleton className="h-5 w-14 rounded-pill bg-ink-800" />
      </div>
      <Skeleton className="mt-3 h-8 w-16 bg-ink-800" />
      <Skeleton className="mt-1.5 h-3 w-28 bg-ink-800" />
    </div>
  );
}

function FeedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-[42px] w-[42px] shrink-0 rounded-[11px] bg-ink-800" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32 bg-ink-800" />
          <Skeleton className="h-3 w-20 bg-ink-800" />
        </div>
        <Skeleton className="h-5 w-20 rounded-pill bg-ink-800" />
      </div>
      <Skeleton className="mb-2 h-5 w-3/4 bg-ink-800" />
      <Skeleton className="mb-1 h-3 w-full bg-ink-800" />
      <Skeleton className="mb-1 h-3 w-5/6 bg-ink-800" />
      <Skeleton className="mb-1 h-3 w-4/5 bg-ink-800" />
      <div className="mt-4 flex items-center gap-2 border-t border-ink-800 pt-2.5">
        <Skeleton className="h-3 w-20 bg-ink-800" />
      </div>
    </div>
  );
}

function ServiceRequestRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-[10px] bg-ink-800" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-1/3 bg-ink-800" />
        <Skeleton className="h-3 w-28 bg-ink-800" />
      </div>
      <Skeleton className="h-6 w-24 rounded-pill bg-ink-800" />
    </div>
  );
}

export default function FootballerDashboardLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32 bg-ink-800" />
          <Skeleton className="h-7 w-56 bg-ink-800" />
        </div>
        <Skeleton className="h-11 w-40 rounded-btn bg-ink-800" />
      </div>

      {/* Profile completion banner */}
      <div className="mb-6 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48 bg-ink-800" />
            <Skeleton className="h-3 w-3/4 bg-ink-800" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0 rounded-btn bg-ink-800" />
        </div>
        <Skeleton className="h-2 w-full rounded-full bg-ink-800" />
      </div>

      {/* KPI strip */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
        {/* Feed */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <Skeleton className="h-3 w-28 bg-ink-800" />
            <Skeleton className="h-4 w-20 bg-ink-800" />
          </div>
          <div className="space-y-4">
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </div>
        </section>

        {/* Aside */}
        <div className="space-y-7">
          {/* Service requests */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <Skeleton className="h-3 w-36 bg-ink-800" />
              <Skeleton className="h-4 w-12 bg-ink-800" />
            </div>
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              <div className="divide-y divide-ink-800">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ServiceRequestRowSkeleton key={i} />
                ))}
              </div>
              <div className="border-t border-ink-800 py-3 flex justify-center">
                <Skeleton className="h-4 w-32 bg-ink-800" />
              </div>
            </div>
          </section>

          {/* Subscribed clubs */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <Skeleton className="h-3 w-36 bg-ink-800" />
              <Skeleton className="h-4 w-20 bg-ink-800" />
            </div>
            <div className="rounded-card border border-ink-800 bg-ink-900 p-3 shadow-card">
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-btn px-2 py-2">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-[10px] bg-ink-800" />
                    <Skeleton className="h-4 flex-1 bg-ink-800" />
                    <Skeleton className="h-6 w-20 rounded-pill bg-ink-800" />
                  </div>
                ))}
              </div>
              <Skeleton className="mt-2 h-9 w-full rounded-btn bg-ink-800" />
            </div>
          </section>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
