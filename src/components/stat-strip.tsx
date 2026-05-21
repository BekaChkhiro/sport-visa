import * as React from 'react';

import { cn } from '@/lib/utils';

type Stat = {
  label: string;
  value: string;
};

type StatStripProps = {
  stats: Stat[];
  className?: string;
};

function StatStrip({ stats, className }: StatStripProps) {
  return (
    <div
      data-slot="stat-strip"
      className={cn('grid grid-cols-3 divide-x divide-border text-center', className)}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 px-3">
          <span className="text-xl font-semibold leading-snug">{stat.value}</span>
          <span className="text-xs leading-normal text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export { StatStrip };
export type { Stat };
