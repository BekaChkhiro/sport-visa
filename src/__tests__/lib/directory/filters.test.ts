import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FILTERS,
  filtersToParams,
  countActiveFilters,
  hasActiveFilters,
} from '@/lib/directory/filters';

describe('DEFAULT_FILTERS', () => {
  it('has empty positions', () => {
    expect(DEFAULT_FILTERS.positions).toEqual([]);
  });

  it('has foot set to "all"', () => {
    expect(DEFAULT_FILTERS.foot).toBe('all');
  });

  it('has empty experience array', () => {
    expect(DEFAULT_FILTERS.experience).toEqual([]);
  });
});

describe('filtersToParams', () => {
  it('returns empty object for default filters', () => {
    expect(filtersToParams(DEFAULT_FILTERS)).toEqual({});
  });

  it('omits empty positions array', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, positions: [] });
    expect(result['positions']).toBeUndefined();
  });

  it('serializes a single position', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, positions: ['GK'] });
    expect(result['positions']).toEqual(['GK']);
  });

  it('serializes multiple positions', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, positions: ['CM', 'ST', 'LW'] });
    expect(result['positions']).toEqual(['CM', 'ST', 'LW']);
  });

  it('serializes ageMin as string', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, ageMin: 18 });
    expect(result['ageMin']).toBe('18');
  });

  it('serializes ageMax as string', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, ageMax: 35 });
    expect(result['ageMax']).toBe('35');
  });

  it('serializes both ageMin and ageMax', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, ageMin: 20, ageMax: 30 });
    expect(result['ageMin']).toBe('20');
    expect(result['ageMax']).toBe('30');
  });

  it('omits ageMin and ageMax when undefined', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS });
    expect(result['ageMin']).toBeUndefined();
    expect(result['ageMax']).toBeUndefined();
  });

  it('serializes foot "right"', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, foot: 'right' });
    expect(result['foot']).toBe('right');
  });

  it('serializes foot "left"', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, foot: 'left' });
    expect(result['foot']).toBe('left');
  });

  it('serializes foot "both"', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, foot: 'both' });
    expect(result['foot']).toBe('both');
  });

  it('omits foot when "all"', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, foot: 'all' });
    expect(result['foot']).toBeUndefined();
  });

  it('omits foot when undefined', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, foot: undefined });
    expect(result['foot']).toBeUndefined();
  });

  it('serializes nationality', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, nationality: 'GEO' });
    expect(result['nationality']).toBe('GEO');
  });

  it('omits nationality when undefined', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS });
    expect(result['nationality']).toBeUndefined();
  });

  it('serializes experience array', () => {
    const result = filtersToParams({
      ...DEFAULT_FILTERS,
      experience: ['professional', 'semi'],
    });
    expect(result['experience']).toEqual(['professional', 'semi']);
  });

  it('omits empty experience array', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, experience: [] });
    expect(result['experience']).toBeUndefined();
  });

  it('serializes all filter fields together', () => {
    const result = filtersToParams({
      positions: ['CM'],
      ageMin: 18,
      ageMax: 30,
      heightMin: 170,
      heightMax: 195,
      weightMin: 65,
      weightMax: 90,
      foot: 'right',
      nationality: 'GEO',
      city: 'Tbilisi',
      experience: ['professional'],
    });
    expect(result['positions']).toEqual(['CM']);
    expect(result['ageMin']).toBe('18');
    expect(result['ageMax']).toBe('30');
    expect(result['heightMin']).toBe('170');
    expect(result['heightMax']).toBe('195');
    expect(result['weightMin']).toBe('65');
    expect(result['weightMax']).toBe('90');
    expect(result['foot']).toBe('right');
    expect(result['nationality']).toBe('GEO');
    expect(result['city']).toBe('Tbilisi');
    expect(result['experience']).toEqual(['professional']);
  });
});

describe('countActiveFilters', () => {
  it('returns 0 for default filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
  });

  it('counts non-empty positions as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, positions: ['CM', 'ST'] })).toBe(1);
  });

  it('counts ageMin alone as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, ageMin: 18 })).toBe(1);
  });

  it('counts ageMax alone as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, ageMax: 35 })).toBe(1);
  });

  it('counts ageMin + ageMax together as 1 (same filter group)', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, ageMin: 18, ageMax: 35 })).toBe(1);
  });

  it('counts foot "right" as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, foot: 'right' })).toBe(1);
  });

  it('counts foot "left" as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, foot: 'left' })).toBe(1);
  });

  it('counts foot "both" as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, foot: 'both' })).toBe(1);
  });

  it('does not count foot "all"', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, foot: 'all' })).toBe(0);
  });

  it('counts position + age + foot as 3', () => {
    expect(
      countActiveFilters({
        positions: ['GK'],
        ageMin: 22,
        ageMax: 32,
        foot: 'left',
        experience: [],
      }),
    ).toBe(3);
  });

  it('counts every independent filter group', () => {
    expect(
      countActiveFilters({
        positions: ['CB'],
        ageMin: 18,
        heightMin: 175,
        weightMax: 85,
        foot: 'right',
        nationality: 'GEO',
        city: 'Tbilisi',
        experience: ['professional'],
      }),
    ).toBe(8);
  });
});

describe('hasActiveFilters', () => {
  it('returns false for default filters', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it('returns true when positions are set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, positions: ['GK'] })).toBe(true);
  });

  it('returns true when ageMin is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, ageMin: 20 })).toBe(true);
  });

  it('returns true when ageMax is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, ageMax: 30 })).toBe(true);
  });

  it('returns true when foot is not "all"', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, foot: 'right' })).toBe(true);
  });

  it('returns false when foot is "all"', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, foot: 'all' })).toBe(false);
  });

  it('returns true when nationality is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, nationality: 'GEO' })).toBe(true);
  });

  it('returns true when experience is non-empty', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, experience: ['amateur'] })).toBe(true);
  });

  it('returns false with all default-like values', () => {
    expect(
      hasActiveFilters({
        positions: [],
        foot: 'all',
        experience: [],
        ageMin: undefined,
        ageMax: undefined,
        heightMin: undefined,
        heightMax: undefined,
        weightMin: undefined,
        weightMax: undefined,
        nationality: undefined,
        city: undefined,
      }),
    ).toBe(false);
  });
});
