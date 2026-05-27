import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ChatsClient: heading row (title + count) + list of conversation
// rows (avatar + name + last message + relative time + unread badge).
function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export default function ChatsLoading() {
  return (
    <div className="space-y-6 px-4 py-6 md:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ConversationRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
