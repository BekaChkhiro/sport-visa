'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-[4px] border border-ink-600 bg-ink-950 transition-shadow outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-500 aria-invalid:ring-danger-500/20 data-[state=checked]:border-brand-400 data-[state=checked]:bg-brand-400 data-[state=checked]:text-ink-950',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
