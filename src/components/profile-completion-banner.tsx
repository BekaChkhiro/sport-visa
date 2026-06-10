'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CloseIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ProfileCompletionBannerProps = {
  percent: number;
  missingFields?: string[];
  onComplete: () => void;
  onDismiss: () => void;
  className?: string;
};

function ProfileCompletionBanner({
  percent,
  missingFields,
  onComplete,
  onDismiss,
  className,
}: ProfileCompletionBannerProps) {
  if (percent >= 100) return null;

  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <section
      data-slot="profile-completion-banner"
      role="status"
      className={cn(
        'relative flex flex-col gap-3 rounded-card border border-warning-400/25 bg-warning-400/10 p-4',
        className,
      )}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="დახურვა"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-btn text-warning-300 hover:bg-warning-400/15 outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <CloseIcon className="size-4" />
      </button>

      <div className="pr-8">
        <h3 className="text-sm font-semibold leading-snug text-warning-300">
          პროფილი {safePercent}% შესრულდა
        </h3>
        <p className="text-xs leading-relaxed text-ink-300">
          {missingFields && missingFields.length > 0
            ? `დარჩა: ${missingFields.join(', ')}`
            : 'შეავსეთ პროფილი, რომ კლუბები აღმოგაჩინონ.'}
        </p>
      </div>

      {/* Progress bar: warning-400 fill on ink-800 track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-warning-400 transition-all"
          style={{ width: `${safePercent}%` }}
          aria-hidden="true"
        />
      </div>

      <div>
        <Button type="button" variant="default" size="sm" onClick={onComplete} className="gap-1.5">
          პროფ. დასრულება
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </section>
  );
}

export { ProfileCompletionBanner };
