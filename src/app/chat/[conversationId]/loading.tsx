import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ChatThreadClient: rounded card with header (back + avatar + name),
// scrollable message area with alternating bubbles, sticky composer.

function MessageBubbleSkeleton({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={side === 'left' ? 'flex justify-start' : 'flex justify-end'}>
      <Skeleton className={side === 'left' ? 'h-12 w-2/3 rounded-2xl' : 'h-10 w-1/2 rounded-2xl'} />
    </div>
  );
}

export default function ChatThreadLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col rounded-xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="right" />
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="right" />
          <MessageBubbleSkeleton side="left" />
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="size-10 rounded-md" />
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
