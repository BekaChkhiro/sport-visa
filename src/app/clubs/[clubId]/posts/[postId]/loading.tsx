import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubPostDetailClient: back link, then a card with the club row
// (logo + name + date), large title, body paragraphs, and the like row.

export default function ClubPostLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-7 w-44" />
        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mb-4 h-8 w-3/4" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="mb-2 h-3 w-5/6" />
          <Skeleton className="mb-6 h-3 w-2/3" />
          <div className="border-t border-border pt-4">
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        </article>
      </div>
    </AppShellSkeleton>
  );
}
