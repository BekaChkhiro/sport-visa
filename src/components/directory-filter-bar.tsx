'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ComboboxField, type ComboboxOption } from '@/components/ui/combobox-field';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { PositionChip, VALID_POSITIONS, type Position } from '@/components/position-chip';
import { cn } from '@/lib/utils';
import {
  AGE_BOUNDS,
  HEIGHT_BOUNDS,
  WEIGHT_BOUNDS,
  hasActiveFilters,
  type DirectoryFilters,
  type DominantFoot,
  type Experience,
} from '@/lib/directory/filters';

type DirectoryFilterBarProps = {
  filters: DirectoryFilters;
  onFiltersChange: (filters: DirectoryFilters) => void;
  onApply: () => void;
  onReset: () => void;
  nationalityOptions?: ComboboxOption[];
  cityOptions?: ComboboxOption[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const EXPERIENCE_LABELS: Record<Experience, string> = {
  professional: 'პროფ.',
  semi: 'ნახ.',
  amateur: 'სამოყვ.',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">{children}</p>
  );
}

function FilterPanelBody({
  filters,
  onFiltersChange,
  nationalityOptions,
  cityOptions,
}: {
  filters: DirectoryFilters;
  onFiltersChange: (filters: DirectoryFilters) => void;
  nationalityOptions?: ComboboxOption[];
  cityOptions?: ComboboxOption[];
}) {
  const togglePosition = (position: Position) => {
    const next = filters.positions.includes(position)
      ? filters.positions.filter((value) => value !== position)
      : [...filters.positions, position];
    onFiltersChange({ ...filters, positions: next });
  };

  const setRange = (
    minKey: keyof DirectoryFilters,
    maxKey: keyof DirectoryFilters,
    bounds: { min: number; max: number },
    [low, high]: [number, number],
  ) => {
    onFiltersChange({
      ...filters,
      [minKey]: low === bounds.min ? undefined : low,
      [maxKey]: high === bounds.max ? undefined : high,
    });
  };

  const toggleExperience = (value: Experience) => {
    const current = filters.experience ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFiltersChange({ ...filters, experience: next });
  };

  const ageValue: [number, number] = [
    filters.ageMin ?? AGE_BOUNDS.min,
    filters.ageMax ?? AGE_BOUNDS.max,
  ];
  const heightValue: [number, number] = [
    filters.heightMin ?? HEIGHT_BOUNDS.min,
    filters.heightMax ?? HEIGHT_BOUNDS.max,
  ];
  const weightValue: [number, number] = [
    filters.weightMin ?? WEIGHT_BOUNDS.min,
    filters.weightMax ?? WEIGHT_BOUNDS.max,
  ];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionLabel>POSITION</SectionLabel>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {VALID_POSITIONS.map((position) => (
            <PositionChip
              key={position}
              position={position}
              selected={filters.positions.includes(position)}
              onClick={() => togglePosition(position)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>AGE</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            min={AGE_BOUNDS.min}
            max={AGE_BOUNDS.max}
            value={filters.ageMin ?? null}
            onChange={(value) => onFiltersChange({ ...filters, ageMin: value ?? undefined })}
            placeholder={String(AGE_BOUNDS.min)}
          />
          <NumberInput
            min={AGE_BOUNDS.min}
            max={AGE_BOUNDS.max}
            value={filters.ageMax ?? null}
            onChange={(value) => onFiltersChange({ ...filters, ageMax: value ?? undefined })}
            placeholder={String(AGE_BOUNDS.max)}
          />
        </div>
        <Slider
          min={AGE_BOUNDS.min}
          max={AGE_BOUNDS.max}
          step={1}
          value={ageValue}
          onValueChange={(next) => setRange('ageMin', 'ageMax', AGE_BOUNDS, [next[0]!, next[1]!])}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>HEIGHT (სმ)</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            min={HEIGHT_BOUNDS.min}
            max={HEIGHT_BOUNDS.max}
            value={filters.heightMin ?? null}
            onChange={(value) => onFiltersChange({ ...filters, heightMin: value ?? undefined })}
            placeholder={String(HEIGHT_BOUNDS.min)}
          />
          <NumberInput
            min={HEIGHT_BOUNDS.min}
            max={HEIGHT_BOUNDS.max}
            value={filters.heightMax ?? null}
            onChange={(value) => onFiltersChange({ ...filters, heightMax: value ?? undefined })}
            placeholder={String(HEIGHT_BOUNDS.max)}
          />
        </div>
        <Slider
          min={HEIGHT_BOUNDS.min}
          max={HEIGHT_BOUNDS.max}
          step={1}
          value={heightValue}
          onValueChange={(next) =>
            setRange('heightMin', 'heightMax', HEIGHT_BOUNDS, [next[0]!, next[1]!])
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>WEIGHT (კგ)</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            min={WEIGHT_BOUNDS.min}
            max={WEIGHT_BOUNDS.max}
            value={filters.weightMin ?? null}
            onChange={(value) => onFiltersChange({ ...filters, weightMin: value ?? undefined })}
            placeholder={String(WEIGHT_BOUNDS.min)}
          />
          <NumberInput
            min={WEIGHT_BOUNDS.min}
            max={WEIGHT_BOUNDS.max}
            value={filters.weightMax ?? null}
            onChange={(value) => onFiltersChange({ ...filters, weightMax: value ?? undefined })}
            placeholder={String(WEIGHT_BOUNDS.max)}
          />
        </div>
        <Slider
          min={WEIGHT_BOUNDS.min}
          max={WEIGHT_BOUNDS.max}
          step={1}
          value={weightValue}
          onValueChange={(next) =>
            setRange('weightMin', 'weightMax', WEIGHT_BOUNDS, [next[0]!, next[1]!])
          }
        />
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>DOMINANT FOOT</SectionLabel>
        <RadioGroup
          value={filters.foot ?? 'all'}
          onValueChange={(value: string) =>
            onFiltersChange({ ...filters, foot: value as DominantFoot })
          }
          className="flex flex-col gap-2 text-sm"
        >
          {(
            [
              ['all', 'ყველა'],
              ['right', 'მარჯ.'],
              ['left', 'მარც.'],
              ['both', 'ორივე'],
            ] as const
          ).map(([value, label]) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem id={`foot-${value}`} value={value} />
              <Label htmlFor={`foot-${value}`} className="font-normal text-ink-300">
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {nationalityOptions ? (
        <section className="flex flex-col gap-2">
          <SectionLabel>NATIONALITY</SectionLabel>
          <ComboboxField
            options={nationalityOptions}
            value={filters.nationality ?? null}
            onSelect={(value) => onFiltersChange({ ...filters, nationality: value ?? undefined })}
            placeholder="ქვეყანა"
          />
        </section>
      ) : null}

      {cityOptions ? (
        <section className="flex flex-col gap-2">
          <SectionLabel>CITY</SectionLabel>
          <ComboboxField
            options={cityOptions}
            value={filters.city ?? null}
            onSelect={(value) => onFiltersChange({ ...filters, city: value ?? undefined })}
            placeholder="ქალაქი"
          />
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <SectionLabel>EXPERIENCE</SectionLabel>
        <div className="flex flex-col gap-2 text-sm">
          {(Object.keys(EXPERIENCE_LABELS) as Experience[]).map((value) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`exp-${value}`}
                checked={filters.experience?.includes(value) ?? false}
                onCheckedChange={() => toggleExperience(value)}
              />
              <Label htmlFor={`exp-${value}`} className="font-normal text-ink-300">
                {EXPERIENCE_LABELS[value]}
              </Label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DirectoryFilterBar({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  nationalityOptions,
  cityOptions,
  isOpen,
  onOpenChange,
  className,
}: DirectoryFilterBarProps) {
  const dirty = hasActiveFilters(filters);

  const body = (
    <FilterPanelBody
      filters={filters}
      onFiltersChange={onFiltersChange}
      nationalityOptions={nationalityOptions}
      cityOptions={cityOptions}
    />
  );

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" onClick={onReset} disabled={!dirty}>
        ფილტ. გასუფ.
      </Button>
      <Button type="button" variant="default" onClick={onApply}>
        გამოყ.
      </Button>
    </div>
  );

  return (
    <>
      <aside
        data-slot="directory-filter-bar"
        className={cn('hidden w-[320px] shrink-0 lg:flex lg:flex-col lg:gap-4', className)}
      >
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2">{body}</div>
        <div className="sticky bottom-0 border-t border-ink-800 bg-ink-950 pt-3">{footer}</div>
      </aside>

      <Sheet open={isOpen ?? false} onOpenChange={(open) => onOpenChange?.(open)}>
        <SheetContent
          side="bottom"
          className="border-ink-800 bg-ink-900 lg:hidden max-h-[90vh] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-ink-50">ფილტრები</SheetTitle>
            <SheetDescription className="text-ink-400">
              დახვეწეთ შედეგები პოზიციით, ასაკით და სხვა.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">{body}</div>
          <SheetFooter className="border-t border-ink-800">{footer}</SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { DirectoryFilterBar };
export type { DirectoryFilters, DominantFoot, Experience };
