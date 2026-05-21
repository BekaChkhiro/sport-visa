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
            'border-input flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-left text-base shadow-xs transition-[color,box-shadow] outline-none md:h-10 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
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
                className="size-4 cursor-pointer hover:text-foreground"
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
          <SearchIcon className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul role="listbox" className="max-h-[200px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
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
                      'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent text-accent-foreground',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <CheckCircleIcon className="size-4 text-primary" /> : null}
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
