import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubPostDetailClient: breadcrumb, back link, main article card
// (club row + title + body + like/share bar), and sidebar club summary card.

export default function ClubPostLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-[1180px]">
        {/* Breadcrumb */}
        <Skeleton className="mb-5 h-4 w-56" />

        <div className="grid gap-7 lg:grid-cols-[1fr_336px]">
          {/* Main */}
          <div className="min-w-0 space-y-4">
            <Skeleton className="h-4 w-44" />

            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900">
              {/* Club row */}
              <div className="flex items-center gap-3 border-b border-ink-800 px-5 py-4 sm:px-6">
                <Skeleton className="h-11 w-11 shrink-0 rounded-[12px]" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              {/* Content */}
              <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              {/* Like bar */}
              <div className="flex items-center gap-2 border-t border-ink-800 px-5 py-4">
                <Skeleton className="h-10 w-24 rounded-pill" />
                <Skeleton className="h-10 w-10 rounded-pill" />
                <div className="ml-auto">
                  <Skeleton className="h-10 w-28 rounded-pill" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900">
              <Skeleton className="h-20 rounded-none" />
              <div className="px-5 pb-5 space-y-3 pt-2">
                <Skeleton className="-mt-6 h-16 w-16 rounded-[16px]" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-9 w-full rounded-btn" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded-btn" />
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
