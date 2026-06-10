import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-field border border-ink-700 bg-ink-950 px-3 py-2 text-[13.5px] text-ink-100 transition-[color,box-shadow] outline-none placeholder:text-ink-500 focus-visible:border-brand-400/60 focus-visible:ring-4 focus-visible:ring-brand-400/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-500 aria-invalid:ring-danger-500/20',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
