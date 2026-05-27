import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubDetailClient: back link, hero card (cover + logo + name + meta
// + subscribe CTA + stats strip), tab bar (4 tabs), then tab content area.
export default function ClubDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:p-6 lg:p-8">
      <Skeleton className="h-7 w-40" />

      {/* Hero */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Skeleton className="aspect-[4/1] w-full rounded-none" />
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
          <Skeleton className="size-20 shrink-0 rounded-xl sm:size-24" />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
