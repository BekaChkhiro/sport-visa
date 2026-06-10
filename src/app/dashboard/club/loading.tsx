import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubDashboardClient redesign:
// greeting header + verification banner + 3-col KPI strip +
// two-column: shortlist rows + posts management | active chats.
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

function ShortlistRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
      <Skeleton className="size-10 shrink-0 rounded-full bg-ink-800" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32 bg-ink-800" />
          <Skeleton className="h-4 w-8 rounded-pill bg-ink-800" />
        </div>
        <Skeleton className="h-3 w-40 bg-ink-800" />
        <Skeleton className="h-3 w-28 bg-ink-800" />
      </div>
      <div className="flex shrink-0 gap-2">
        <Skeleton className="h-9 w-20 rounded-btn bg-ink-800" />
        <Skeleton className="h-9 w-16 rounded-btn bg-ink-800" />
      </div>
    </div>
  );
}

function PostRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-[10px] bg-ink-800" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4 bg-ink-800" />
        <Skeleton className="h-3 w-32 bg-ink-800" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8 rounded-btn bg-ink-800" />
        <Skeleton className="h-8 w-8 rounded-btn bg-ink-800" />
      </div>
    </div>
  );
}

function ChatRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Skeleton className="size-8 shrink-0 rounded-full bg-ink-800" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28 bg-ink-800" />
          <Skeleton className="h-3 w-12 bg-ink-800" />
        </div>
        <Skeleton className="h-3 w-full bg-ink-800" />
      </div>
    </div>
  );
}

export default function ClubDashboardLoading() {
  return (
    <AppShellSkeleton variant="club">
      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32 bg-ink-800" />
          <Skeleton className="h-7 w-44 bg-ink-800" />
        </div>
        <Skeleton className="h-11 w-44 rounded-btn bg-ink-800" />
      </div>

      {/* Verification banner */}
      <div className="mb-6 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-[12px] bg-ink-800" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40 bg-ink-800" />
            <Skeleton className="h-3 w-3/4 bg-ink-800" />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* Two-column */}
      <div className="grid gap-7 xl:grid-cols-[1fr_336px]">
        {/* Left: shortlist + posts */}
        <div className="space-y-8">
          {/* Shortlist */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <Skeleton className="h-3 w-48 bg-ink-800" />
              <Skeleton className="h-4 w-24 bg-ink-800" />
            </div>
            <div className="space-y-3">
              <ShortlistRowSkeleton />
              <ShortlistRowSkeleton />
              <ShortlistRowSkeleton />
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-card bg-ink-800" />
          </section>

          {/* Posts */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <Skeleton className="h-3 w-36 bg-ink-800" />
              <Skeleton className="h-4 w-14 bg-ink-800" />
            </div>
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              <div className="divide-y divide-ink-800">
                <PostRowSkeleton />
                <PostRowSkeleton />
                <PostRowSkeleton />
              </div>
              <div className="border-t border-ink-800 py-3 flex justify-center">
                <Skeleton className="h-4 w-40 bg-ink-800" />
              </div>
            </div>
          </section>
        </div>

        {/* Right: chats */}
        <div className="space-y-7">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <Skeleton className="h-3 w-28 bg-ink-800" />
              <Skeleton className="h-4 w-12 bg-ink-800" />
            </div>
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              <div className="divide-y divide-ink-800">
                <ChatRowSkeleton />
                <ChatRowSkeleton />
                <ChatRowSkeleton />
              </div>
              <div className="border-t border-ink-800 py-3 flex justify-center">
                <Skeleton className="h-4 w-24 bg-ink-800" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
