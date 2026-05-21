'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const VALID_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CM', 'DM', 'AM', 'LW', 'RW', 'CF', 'ST'] as const;

type Position = (typeof VALID_POSITIONS)[number];

type PositionChipProps = {
  position: Position | string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

function PositionChip({
  position,
  selected = false,
  disabled = false,
  onClick,
  className,
}: PositionChipProps) {
  const interactive = typeof onClick === 'function';
  const Component = interactive ? 'button' : 'span';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      role={interactive ? 'checkbox' : undefined}
      aria-checked={interactive ? selected : undefined}
      aria-pressed={interactive ? selected : undefined}
      onClick={interactive ? onClick : undefined}
      disabled={interactive ? disabled : undefined}
      data-slot="position-chip"
      data-selected={selected ? 'true' : 'false'}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-transparent bg-secondary text-secondary-foreground',
        interactive && !selected && 'hover:bg-accent hover:text-accent-foreground',
        interactive &&
          'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {position}
    </Component>
  );
}

export { PositionChip, VALID_POSITIONS };
export type { Position };
