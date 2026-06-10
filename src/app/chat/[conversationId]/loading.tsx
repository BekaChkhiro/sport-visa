import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ChatThreadClient: rounded card with thread header (back + avatar +
// name + profile button), scrollable message area with alternating bubbles,
// and a sticky composer (paperclip + textarea + send).

function MessageBubbleSkeleton({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={side === 'left' ? 'flex justify-start gap-2' : 'flex justify-end'}>
      {side === 'left' && <Skeleton className="size-6 shrink-0 rounded-full" />}
      <Skeleton
        className={cn(
          'rounded-card',
          side === 'left' ? 'h-12 w-2/3 rounded-bl-sm' : 'h-10 w-1/2 rounded-br-sm',
        )}
      />
    </div>
  );
}

// cn is not available in server components at loading layer — inline helper
function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export default function ChatThreadLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-ink-800 px-4 py-3">
          <Skeleton className="size-9 shrink-0 rounded-btn" />
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-[15px] w-36" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0 rounded-btn" />
        </header>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="right" />
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="right" />
          <MessageBubbleSkeleton side="left" />
        </div>

        {/* Composer */}
        <div className="border-t border-ink-800 px-3 py-3 sm:px-4">
          <div className="flex items-end gap-2 rounded-card border border-ink-700 bg-ink-950 px-2 py-1.5">
            <Skeleton className="size-9 shrink-0 rounded-btn" />
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="size-10 shrink-0 rounded-btn" />
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
