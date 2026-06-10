import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-4 focus-visible:ring-brand-400/25 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-brand-400/10 text-brand-300 border-brand-400/25',
        secondary: 'bg-ink-800 text-ink-200 border-ink-700',
        destructive:
          'bg-danger-400/10 text-danger-300 border-danger-400/25 focus-visible:ring-danger-500/25',
        outline: 'bg-ink-800 text-ink-200 border-ink-700',
        ghost: 'bg-ink-800 text-ink-200 border-transparent',
        link: 'text-brand-400 border-transparent underline-offset-4 [a&]:hover:underline',
        success: 'bg-success-400/10 text-success-300 border-success-400/25',
        warning: 'bg-warning-400/10 text-warning-300 border-warning-400/25',
        info: 'bg-info-400/10 text-info-300 border-info-400/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
