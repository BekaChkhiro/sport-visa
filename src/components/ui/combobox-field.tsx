'use client';

import * as React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircleIcon, ChevronDownIcon, CloseIcon, SearchIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxFieldProps = {
  options: ComboboxOption[];
  value?: string | null;
  onSelect: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-invalid'?: boolean;
};

function ComboboxField({
  options,
  value,
  onSelect,
  placeholder = 'არჩევა…',
  searchPlaceholder = 'ძიება…',
  emptyText = 'არაფერი მოიძებნა',
  disabled,
  className,
  id,
  name,
  'aria-invalid': ariaInvalid,
}: ComboboxFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const selected = React.useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          data-slot="combobox-trigger"
          className={cn(
            'border-ink-700 flex h-11 w-full items-center justify-between gap-2 rounded-field border bg-ink-950 px-3 py-1 text-left text-[13.5px] text-ink-100 transition-[color,box-shadow] outline-none',
            'focus-visible:border-brand-400/60 focus-visible:ring-4 focus-visible:ring-brand-400/15',
            'aria-invalid:border-danger-500 aria-invalid:ring-danger-500/20',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-ink-500',
            className,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <span className="flex items-center gap-1 text-ink-500">
            {selected && !disabled ? (
              <CloseIcon
                role="button"
                aria-label="გასუფთავება"
                tabIndex={-1}
                onClick={(event: React.MouseEvent<SVGSVGElement>) => {
                  event.stopPropagation();
                  onSelect(null);
                  setQuery('');
                }}
                className="size-4 cursor-pointer hover:text-ink-100"
              />
            ) : null}
            <ChevronDownIcon className="size-4" />
          </span>
          {name ? <input type="hidden" name={name} value={selected?.value ?? ''} /> : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] max-h-[260px] overflow-hidden p-0"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm">
          <SearchIcon className="size-4 text-ink-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none placeholder:text-ink-500 text-ink-100 text-[13.5px]"
          />
        </div>
        <ul role="listbox" className="max-h-[200px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-400">{emptyText}</li>
          ) : (
            filtered.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(option.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-ink-100 transition-colors hover:bg-ink-800 hover:text-ink-100',
                      isSelected && 'bg-ink-800 text-ink-100',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <CheckCircleIcon className="size-4 text-brand-400" /> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export { ComboboxField };
export type { ComboboxOption };
