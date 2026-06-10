import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-brand-300 active:bg-brand-500 font-semibold',
        destructive:
          'bg-danger-500 text-white hover:bg-danger-400 font-semibold focus-visible:ring-danger-500/25',
        outline:
          'bg-ink-900 text-ink-100 border border-ink-700 hover:bg-ink-800 hover:border-ink-600 font-medium',
        secondary: 'bg-ink-800 text-ink-100 hover:bg-ink-700 font-medium',
        ghost: 'text-ink-300 hover:bg-ink-800 hover:text-ink-100 font-medium',
        link: 'text-brand-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 text-sm gap-2 has-[>svg]:px-4',
        sm: 'h-9 rounded-btn px-3.5 text-[13px] gap-1.5 has-[>svg]:px-3',
        lg: 'h-12 rounded-btn px-6 text-[15px] gap-2 has-[>svg]:px-5',
        icon: 'size-10 rounded-btn',
        'icon-lg': 'size-11 rounded-btn',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
