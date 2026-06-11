import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubProfileEditClient: page header + section stacks.

function SectionSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <section>
      <Skeleton className="mb-3 h-2.5 w-20" />
      <div className="space-y-5 overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-6">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-field" />
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-ink-800 pt-4">
          <Skeleton className="h-9 w-24 rounded-btn" />
        </div>
      </div>
    </section>
  );
}

export default function ClubProfileEditLoading() {
  return (
    <AppShellSkeleton variant="club">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Page header */}
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-3.5 w-80" />
        </div>

        {/* Identity */}
        <SectionSkeleton fields={6} />

        {/* Media */}
        <section>
          <Skeleton className="mb-3 h-2.5 w-16" />
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-6 space-y-6">
            {/* Logo row */}
            <div className="flex items-center gap-5 rounded-card border border-ink-800 bg-ink-950/40 p-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-[14px]" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-9 w-28 rounded-btn" />
            </div>
            {/* Cover */}
            <Skeleton className="aspect-[3/1] w-full rounded-card" />
          </div>
        </section>

        {/* Roster */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-2.5 w-40" />
            <Skeleton className="h-9 w-28 rounded-btn" />
          </div>
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-card border border-ink-800 bg-ink-950/40 px-4 py-3"
              >
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                </div>
                <Skeleton className="h-5 w-8 rounded-pill" />
              </div>
            ))}
          </div>
        </section>

        <SectionSkeleton fields={1} />
        <SectionSkeleton fields={2} />
      </div>
    </AppShellSkeleton>
  );
}
