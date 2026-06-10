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

/**
 * Position colour families:
 * GK → flame  |  CB/LB/RB → accent (sky)  |  DM/CM/AM → iris  |  LW/RW/CF/ST → brand
 */
function positionFamily(position: string): 'flame' | 'accent' | 'iris' | 'brand' {
  if (position === 'GK') return 'flame';
  if (['CB', 'LB', 'RB'].includes(position)) return 'accent';
  if (['DM', 'CM', 'AM'].includes(position)) return 'iris';
  return 'brand';
}

const FAMILY_CLASSES: Record<
  'flame' | 'accent' | 'iris' | 'brand',
  { base: string; selected: string }
> = {
  flame: {
    base: 'bg-flame-400/15 text-flame-300',
    selected: 'bg-flame-400/30 text-flame-200 ring-1 ring-flame-400/50',
  },
  accent: {
    base: 'bg-accent-400/15 text-accent-300',
    selected: 'bg-accent-400/30 text-accent-200 ring-1 ring-accent-400/50',
  },
  iris: {
    base: 'bg-iris-400/15 text-iris-300',
    selected: 'bg-iris-400/30 text-iris-200 ring-1 ring-iris-400/50',
  },
  brand: {
    base: 'bg-brand-400/15 text-brand-300',
    selected: 'bg-brand-400/30 text-brand-200 ring-1 ring-brand-400/50',
  },
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
  const family = positionFamily(position);
  const { base, selected: selectedCls } = FAMILY_CLASSES[family];

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
        'inline-flex items-center rounded-pill px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide transition-colors',
        selected ? selectedCls : base,
        interactive &&
          'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
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
