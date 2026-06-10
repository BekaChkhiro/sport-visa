import * as React from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}
    >
      {icon ? <div className="text-ink-500">{icon}</div> : null}
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold text-ink-50">{title}</p>
        {description ? <p className="text-ink-400 max-w-sm text-sm">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
