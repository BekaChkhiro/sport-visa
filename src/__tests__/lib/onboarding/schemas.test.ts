import { describe, expect, it } from 'vitest';

import {
  clubOnboardingSchema,
  footballerOnboardingSchema,
  footballerStep1Schema,
  footballerStep2Schema,
} from '@/lib/onboarding/schemas';

const validStep1 = {
  dateOfBirth: '2000-01-15',
  nationality: 'GE',
  city: 'Tbilisi',
  country: 'GE',
};

const validStep2 = {
  positions: ['CM'],
  dominantFoot: 'RIGHT',
  height: 180,
  weight: 75,
};

describe('footballerStep1Schema', () => {
  it('accepts a minimum-valid step 1 payload', () => {
    expect(footballerStep1Schema.safeParse(validStep1).success).toBe(true);
  });

  it('rejects missing city', () => {
    expect(footballerStep1Schema.safeParse({ ...validStep1, city: '' }).success).toBe(false);
  });

  it('coerces empty optional fields to undefined', () => {
    const parsed = footballerStep1Schema.parse({ ...validStep1, phone: '', bio: '' });
    expect(parsed.phone).toBeUndefined();
    expect(parsed.bio).toBeUndefined();
  });

  it('rejects a bio over 500 characters', () => {
    const long = 'a'.repeat(501);
    expect(footballerStep1Schema.safeParse({ ...validStep1, bio: long }).success).toBe(false);
  });
});

describe('footballerStep2Schema', () => {
  it('coerces numeric string inputs (height, weight, jersey)', () => {
    const parsed = footballerStep2Schema.parse({
      ...validStep2,
      height: '180',
      weight: '75',
      jerseyNumber: '10',
    } as unknown as Record<string, unknown>);
    expect(parsed.height).toBe(180);
    expect(parsed.weight).toBe(75);
    expect(parsed.jerseyNumber).toBe(10);
  });

  it('rejects an invalid position enum value', () => {
    expect(footballerStep2Schema.safeParse({ ...validStep2, positions: ['SWEEPER'] }).success).toBe(
      false,
    );
  });

  it('rejects more than 2 positions', () => {
    expect(
      footballerStep2Schema.safeParse({ ...validStep2, positions: ['CM', 'AM', 'CF'] }).success,
    ).toBe(false);
  });

  it('rejects zero positions', () => {
    expect(footballerStep2Schema.safeParse({ ...validStep2, positions: [] }).success).toBe(false);
  });

  it('enforces the height bound', () => {
    expect(footballerStep2Schema.safeParse({ ...validStep2, height: 99 }).success).toBe(false);
    expect(footballerStep2Schema.safeParse({ ...validStep2, height: 251 }).success).toBe(false);
  });

  it('enforces the weight bound', () => {
    expect(footballerStep2Schema.safeParse({ ...validStep2, weight: 29 }).success).toBe(false);
    expect(footballerStep2Schema.safeParse({ ...validStep2, weight: 201 }).success).toBe(false);
  });

  it('enforces the jersey number bound (1..99)', () => {
    expect(footballerStep2Schema.safeParse({ ...validStep2, jerseyNumber: 0 }).success).toBe(false);
    expect(footballerStep2Schema.safeParse({ ...validStep2, jerseyNumber: 100 }).success).toBe(
      false,
    );
  });
});

describe('footballerOnboardingSchema (combined)', () => {
  it('accepts both steps merged', () => {
    expect(footballerOnboardingSchema.safeParse({ ...validStep1, ...validStep2 }).success).toBe(
      true,
    );
  });
});

describe('clubOnboardingSchema', () => {
  const validClub = { name: 'FC Test' };

  it('accepts a minimum-valid club payload (only name is required)', () => {
    expect(clubOnboardingSchema.safeParse(validClub).success).toBe(true);
  });

  it('rejects an empty club name', () => {
    expect(clubOnboardingSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('coerces empty optional strings to undefined', () => {
    const parsed = clubOnboardingSchema.parse({
      ...validClub,
      city: '',
      league: '',
      stadiumName: '',
      officialWebsite: '',
      bio: '',
    });
    expect(parsed.city).toBeUndefined();
    expect(parsed.league).toBeUndefined();
    expect(parsed.stadiumName).toBeUndefined();
    expect(parsed.officialWebsite).toBeUndefined();
    expect(parsed.bio).toBeUndefined();
  });

  it('enforces the foundedYear range', () => {
    expect(clubOnboardingSchema.safeParse({ ...validClub, foundedYear: 1700 }).success).toBe(false);
    expect(clubOnboardingSchema.safeParse({ ...validClub, foundedYear: 2100 }).success).toBe(false);
    expect(clubOnboardingSchema.safeParse({ ...validClub, foundedYear: 2000 }).success).toBe(true);
  });

  it('rejects a negative stadium capacity', () => {
    expect(clubOnboardingSchema.safeParse({ ...validClub, stadiumCapacity: -1 }).success).toBe(
      false,
    );
  });
});
