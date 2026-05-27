import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubDashboardClient: optional verification banner, three sections
// (recent shortlist rows, active chats placeholder, recent posts) — each
// with a heading row + content area.
function FootballerRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-1 h-3 w-full" />
      <Skeleton className="mb-3 h-3 w-5/6" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function SectionHeading() {
  return (
    <div className="mb-3 flex items-center justify-between">
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

export default function ClubDashboardLoading() {
  return (
    <div className="space-y-8 px-4 py-6 md:p-6 lg:p-8">
      {/* Verification banner */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="mb-2 h-4 w-48" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* Recent shortlist */}
      <section>
        <SectionHeading />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <FootballerRowSkeleton key={i} />
          ))}
          <Skeleton className="h-8 w-44 self-start rounded-md" />
        </div>
      </section>

      {/* Active chats */}
      <section>
        <SectionHeading />
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-2 py-6">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </section>

      {/* Recent posts */}
      <section>
        <SectionHeading />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
