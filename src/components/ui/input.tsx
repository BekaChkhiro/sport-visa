import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-ink-100 placeholder:text-ink-500 selection:bg-primary selection:text-primary-foreground border-ink-700 flex h-11 w-full min-w-0 rounded-field border bg-ink-950 px-3 py-1 text-[13.5px] text-ink-100 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-brand-400/60 focus-visible:ring-4 focus-visible:ring-brand-400/15',
        'aria-invalid:ring-danger-500/20 aria-invalid:border-danger-500',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
