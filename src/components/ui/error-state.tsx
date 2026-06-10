import * as React from 'react';

import { AlertCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'page' | 'inline';
}

export function ErrorState({
  title = 'შეცდომა მოხდა',
  description = 'მონაცემების ჩატვირთვა ვერ მოხდა. ცადეთ თავიდან.',
  action,
  className,
  variant = 'inline',
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center',
        variant === 'page' ? 'min-h-[40vh] py-16' : 'py-8',
        className,
      )}
    >
      <AlertCircleIcon className="text-danger-400" size={48} />
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold text-ink-50">{title}</p>
        {description ? <p className="text-ink-400 max-w-sm text-sm">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
