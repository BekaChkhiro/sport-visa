'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type NumberInputProps = Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
};

function clamp(value: number, min?: number, max?: number) {
  let next = value;
  if (typeof min === 'number') next = Math.max(next, min);
  if (typeof max === 'number') next = Math.min(next, max);
  return next;
}

function NumberInput({
  className,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  placeholder,
  id,
  name,
  'aria-invalid': ariaInvalid,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = React.useState<string>(
    value === null || value === undefined ? '' : String(value),
  );

  React.useEffect(() => {
    setDraft(value === null || value === undefined ? '' : String(value));
  }, [value]);

  const commit = (raw: string) => {
    if (raw.trim() === '') {
      onChange?.(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      setDraft(value === null || value === undefined ? '' : String(value));
      return;
    }
    const next = clamp(parsed, min, max);
    setDraft(String(next));
    onChange?.(next);
  };

  const adjust = (direction: 1 | -1) => {
    const base = typeof value === 'number' ? value : Number(draft) || 0;
    const next = clamp(base + direction * step, min, max);
    setDraft(String(next));
    onChange?.(next);
  };

  return (
    <div
      data-slot="number-input"
      className={cn(
        'border-ink-700 flex h-11 w-full items-stretch rounded-field border bg-ink-950 transition-[color,box-shadow] outline-none',
        'focus-within:border-brand-400/60 focus-within:ring-4 focus-within:ring-brand-400/15',
        ariaInvalid ? 'border-danger-500 ring-danger-500/20' : '',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        value={draft}
        aria-invalid={ariaInvalid}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        className={cn(
          'placeholder:text-ink-500 text-ink-100 flex-1 min-w-0 bg-transparent px-3 py-1 text-[13.5px] outline-none',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
        {...props}
      />
      <div className="flex flex-col border-l border-ink-700">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="გაზრდა"
          tabIndex={-1}
          disabled={
            disabled || (typeof max === 'number' && typeof value === 'number' && value >= max)
          }
          onClick={() => adjust(1)}
          className="h-1/2 rounded-none rounded-tr-field px-2 py-0 [&_svg:not([class*='size-'])]:size-3"
        >
          <ChevronUpIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="შემცირება"
          tabIndex={-1}
          disabled={
            disabled || (typeof min === 'number' && typeof value === 'number' && value <= min)
          }
          onClick={() => adjust(-1)}
          className="h-1/2 rounded-none rounded-br-field border-t border-ink-700 px-2 py-0 [&_svg:not([class*='size-'])]:size-3"
        >
          <ChevronDownIcon />
        </Button>
      </div>
    </div>
  );
}

export { NumberInput };
