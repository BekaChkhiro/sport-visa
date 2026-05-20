import * as React from 'react';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn('size-10 rounded-full', className)} />;
}

export function SkeletonText({ className, lines = 2 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 rounded-xl border p-6', className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1">
          <SkeletonText lines={2} />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <SkeletonAvatar className="size-8" />
      <div className="flex-1">
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonStatStrip({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-6', className)}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
