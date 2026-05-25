type DominantFoot = 'left' | 'right' | 'both' | 'all';
type Experience = 'professional' | 'semi' | 'amateur';

type DirectoryFilters = {
  positions: string[];
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  foot?: DominantFoot;
  nationality?: string;
  city?: string;
  experience?: Experience[];
};

const AGE_BOUNDS = { min: 14, max: 60 };
const HEIGHT_BOUNDS = { min: 140, max: 220 };
const WEIGHT_BOUNDS = { min: 40, max: 130 };

const DEFAULT_FILTERS: DirectoryFilters = {
  positions: [],
  foot: 'all',
  experience: [],
};

function filtersToParams(filters: DirectoryFilters): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  if (filters.positions.length > 0) out['positions'] = filters.positions;
  if (filters.ageMin !== undefined) out['ageMin'] = String(filters.ageMin);
  if (filters.ageMax !== undefined) out['ageMax'] = String(filters.ageMax);
  if (filters.heightMin !== undefined) out['heightMin'] = String(filters.heightMin);
  if (filters.heightMax !== undefined) out['heightMax'] = String(filters.heightMax);
  if (filters.weightMin !== undefined) out['weightMin'] = String(filters.weightMin);
  if (filters.weightMax !== undefined) out['weightMax'] = String(filters.weightMax);
  if (filters.foot && filters.foot !== 'all') out['foot'] = filters.foot;
  if (filters.nationality) out['nationality'] = filters.nationality;
  if (filters.city) out['city'] = filters.city;
  if (filters.experience && filters.experience.length > 0) out['experience'] = filters.experience;
  return out;
}

function countActiveFilters(filters: DirectoryFilters): number {
  let n = 0;
  if (filters.positions.length > 0) n++;
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) n++;
  if (filters.heightMin !== undefined || filters.heightMax !== undefined) n++;
  if (filters.weightMin !== undefined || filters.weightMax !== undefined) n++;
  if (filters.foot && filters.foot !== 'all') n++;
  if (filters.nationality) n++;
  if (filters.city) n++;
  if (filters.experience && filters.experience.length > 0) n++;
  return n;
}

function hasActiveFilters(filters: DirectoryFilters): boolean {
  return countActiveFilters(filters) > 0;
}

export type { DirectoryFilters, DominantFoot, Experience };
export { AGE_BOUNDS, HEIGHT_BOUNDS, WEIGHT_BOUNDS, DEFAULT_FILTERS };
export { filtersToParams, countActiveFilters, hasActiveFilters };
