import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ChatsClient: heading row + conversation list card with
// search field, filter tabs, and a list of conversation rows.

function ConversationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-card px-3 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-[14px] w-32" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export default function ChatsLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="space-y-5">
        {/* Heading */}
        <div className="flex items-end justify-between gap-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          <div className="border-b border-ink-800 px-4 pb-3 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-full rounded-field" />
            <div className="flex gap-1">
              <Skeleton className="h-8 flex-1 rounded-btn" />
              <Skeleton className="h-8 flex-1 rounded-btn" />
            </div>
          </div>
          <div className="p-2 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
