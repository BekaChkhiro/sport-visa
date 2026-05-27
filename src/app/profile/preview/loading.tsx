import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ProfilePreviewClient: preview banner, hero card (cover + overlapping
// avatar + name + meta + position chips + stats strip), then a few content
// sections (bio, career history, agent info, gallery).
export default function ProfilePreviewLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:p-6 lg:p-8">
      {/* Preview banner */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32 shrink-0 rounded-md" />
      </div>

      {/* Hero card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Skeleton className="h-40 w-full rounded-none sm:h-56" />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-4 flex items-end justify-between gap-4">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-card" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="mb-2 h-7 w-1/2" />
          <Skeleton className="mb-3 h-3 w-1/3" />
          <div className="mb-4 flex gap-1.5">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <div className="flex gap-5 border-t border-border pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Content sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="mb-1.5 h-3 w-full" />
          <Skeleton className="mb-1.5 h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
