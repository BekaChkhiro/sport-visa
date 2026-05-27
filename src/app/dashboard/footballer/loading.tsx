import { Skeleton } from '@/components/ui/skeleton';

// Mirrors the layout of FootballerDashboardClient so the transition feels
// stable: profile-completion banner, newsfeed cards with club + title +
// excerpt + like, service-request rows with status pill + date, and the
// subscribed-clubs chip row.

function SectionHeading({ width = 'w-32' }: { width?: string }) {
  return <Skeleton className={`mb-3 h-3 ${width}`} />;
}

function NewsfeedCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-1 h-3 w-full" />
      <Skeleton className="mb-3 h-3 w-5/6" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

function ServiceRequestRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <Skeleton className="h-4 w-1/3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="hidden h-3 w-12 sm:block" />
      </div>
    </div>
  );
}

function ClubChipSkeleton({ width }: { width: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 ${width}`}
    >
      <Skeleton className="size-6 rounded" />
      <Skeleton className="h-4 flex-1" />
    </div>
  );
}

export default function FootballerDashboardLoading() {
  return (
    <div className="space-y-8 px-4 py-6 md:p-6 lg:p-8">
      {/* Profile completion banner */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0 rounded-md" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Newsfeed */}
      <section>
        <SectionHeading width="w-28" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <NewsfeedCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Service requests */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {Array.from({ length: 3 }).map((_, i) => (
            <ServiceRequestRowSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Subscribed clubs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-3">
          <ClubChipSkeleton width="w-36" />
          <ClubChipSkeleton width="w-40" />
          <ClubChipSkeleton width="w-32" />
          <ClubChipSkeleton width="w-44" />
        </div>
      </section>
    </div>
  );
}
