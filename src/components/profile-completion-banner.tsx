'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
        'relative flex flex-col gap-3 rounded-lg bg-secondary p-4 text-secondary-foreground',
        className,
      )}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="დახურვა"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md hover:bg-secondary-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CloseIcon className="size-4" />
      </button>

      <div className="pr-8">
        <h3 className="text-sm font-semibold leading-snug">პროფილი {safePercent}% შესრულდა</h3>
        <p className="text-xs leading-relaxed opacity-80">
          {missingFields && missingFields.length > 0
            ? `დარჩა: ${missingFields.join(', ')}`
            : 'შეავსეთ პროფილი, რომ კლუბები აღმოგაჩინონ.'}
        </p>
      </div>

      <Progress value={safePercent} className="h-2" />

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
