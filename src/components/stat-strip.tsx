import * as React from 'react';

import { cn } from '@/lib/utils';

type Stat = {
  label: string;
  value: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional delta string, e.g. "+12%" */
  delta?: string;
  /** Whether this is a primary stat (lime icon bg) or secondary (ink bg) */
  primary?: boolean;
};

type StatStripProps = {
  stats: Stat[];
  className?: string;
};

function StatStrip({ stats, className }: StatStripProps) {
  return (
    <div
      data-slot="stat-strip"
      className={cn('grid grid-cols-3 divide-x divide-ink-800', className)}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex flex-col gap-2 px-4 py-3">
            {Icon ? (
              <span
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-[10px]',
                  stat.primary ? 'bg-brand-400/15 text-brand-300' : 'bg-ink-800 text-ink-400',
                )}
                aria-hidden="true"
              >
                <Icon className="size-4 shrink-0" />
              </span>
            ) : null}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[28px] font-bold tabular-nums leading-none text-ink-50">
                {stat.value}
              </span>
              {stat.delta ? (
                <span className="rounded-pill bg-success-400/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-success-300">
                  {stat.delta}
                </span>
              ) : null}
            </div>
            <span className="text-[12.5px] text-ink-400">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export { StatStrip };
export type { Stat };
