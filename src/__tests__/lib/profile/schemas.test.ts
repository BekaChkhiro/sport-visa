import { describe, expect, it } from 'vitest';

import {
  updatePersonalInfoSchema,
  updateSportInfoSchema,
  careerEntrySchema,
  updateAgentInfoSchema,
  updateVideoLinksSchema,
} from '@/lib/profile/schemas';

// ── updatePersonalInfoSchema ──────────────────────────────────────────────────

const validPersonal = {
  firstName: 'გიორგი',
  lastName: 'მაგალითი',
  dateOfBirth: '2000-06-15',
  nationality: 'GE',
  city: 'Tbilisi',
  country: 'GE',
};

describe('updatePersonalInfoSchema', () => {
  it('accepts a minimum-valid payload', () => {
    expect(updatePersonalInfoSchema.safeParse(validPersonal).success).toBe(true);
  });

  it('rejects empty firstName', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, firstName: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.firstName).toBeTruthy();
  });

  it('rejects empty lastName', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, lastName: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.lastName).toBeTruthy();
  });

  it('rejects a non-date string for dateOfBirth', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, dateOfBirth: 'not-a-date' });
    expect(r.success).toBe(false);
  });

  it('rejects a dateOfBirth that makes the player under 12', () => {
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 5);
    const r = updatePersonalInfoSchema.safeParse({
      ...validPersonal,
      dateOfBirth: recent.toISOString().slice(0, 10),
    });
    expect(r.success).toBe(false);
  });

  it('rejects a dateOfBirth that makes the player over 75', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 80);
    const r = updatePersonalInfoSchema.safeParse({
      ...validPersonal,
      dateOfBirth: old.toISOString().slice(0, 10),
    });
    expect(r.success).toBe(false);
  });

  it('rejects a nationality that is not a 2-letter ISO code', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, nationality: 'GEO' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.nationality).toBeTruthy();
  });

  it('upcases nationality', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, nationality: 'ge' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nationality).toBe('GE');
  });

  it('rejects a country that is not a 2-letter ISO code', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, country: 'GEO' });
    expect(r.success).toBe(false);
  });

  it('upcases country', () => {
    const r = updatePersonalInfoSchema.safeParse({ ...validPersonal, country: 'ge' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.country).toBe('GE');
  });

  it('coerces empty phone and bio to undefined', () => {
    const r = updatePersonalInfoSchema.parse({ ...validPersonal, phone: '', bio: '' });
    expect(r.phone).toBeUndefined();
    expect(r.bio).toBeUndefined();
  });

  it('rejects a bio over 500 characters', () => {
    const r = updatePersonalInfoSchema.safeParse({
      ...validPersonal,
      bio: 'a'.repeat(501),
    });
    expect(r.success).toBe(false);
  });
});

// ── updateSportInfoSchema ─────────────────────────────────────────────────────

const validSport = {
  positions: ['CM'],
  dominantFoot: 'RIGHT',
  height: 180,
  weight: 75,
};

describe('updateSportInfoSchema', () => {
  it('accepts a minimum-valid payload', () => {
    expect(updateSportInfoSchema.safeParse(validSport).success).toBe(true);
  });

  it('coerces numeric strings for height and weight', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, height: '180', weight: '75' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.height).toBe(180);
      expect(r.data.weight).toBe(75);
    }
  });

  it('rejects zero positions', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, positions: [] });
    expect(r.success).toBe(false);
  });

  it('rejects more than 2 positions', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, positions: ['CM', 'AM', 'CF'] });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid position enum', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, positions: ['SWEEPER'] });
    expect(r.success).toBe(false);
  });

  it('rejects height below 100', () => {
    expect(updateSportInfoSchema.safeParse({ ...validSport, height: 99 }).success).toBe(false);
  });

  it('rejects height above 250', () => {
    expect(updateSportInfoSchema.safeParse({ ...validSport, height: 251 }).success).toBe(false);
  });

  it('rejects weight below 30', () => {
    expect(updateSportInfoSchema.safeParse({ ...validSport, weight: 29 }).success).toBe(false);
  });

  it('rejects weight above 200', () => {
    expect(updateSportInfoSchema.safeParse({ ...validSport, weight: 201 }).success).toBe(false);
  });

  it('rejects jerseyNumber 0', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, jerseyNumber: 0 });
    expect(r.success).toBe(false);
  });

  it('rejects jerseyNumber 100', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, jerseyNumber: 100 });
    expect(r.success).toBe(false);
  });

  it('coerces empty optional strings to undefined', () => {
    const r = updateSportInfoSchema.parse({
      ...validSport,
      currentClub: '',
      desiredLeague: '',
    });
    expect(r.currentClub).toBeUndefined();
    expect(r.desiredLeague).toBeUndefined();
  });

  it('accepts 2 positions (max)', () => {
    const r = updateSportInfoSchema.safeParse({ ...validSport, positions: ['CM', 'AM'] });
    expect(r.success).toBe(true);
  });
});

// ── careerEntrySchema ─────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();

const validCareer = {
  clubName: 'FC Dinamo',
  startYear: 2015,
  orderIndex: 0,
};

describe('careerEntrySchema', () => {
  it('accepts a minimum-valid career entry', () => {
    expect(careerEntrySchema.safeParse(validCareer).success).toBe(true);
  });

  it('rejects empty clubName', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, clubName: '' });
    expect(r.success).toBe(false);
  });

  it('rejects startYear below 1950', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, startYear: 1949 });
    expect(r.success).toBe(false);
  });

  it('rejects startYear in the future', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, startYear: currentYear + 1 });
    expect(r.success).toBe(false);
  });

  it('accepts startYear equal to current year', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, startYear: currentYear });
    expect(r.success).toBe(true);
  });

  it('coerces string startYear to number', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, startYear: '2010' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.startYear).toBe(2010);
  });

  it('coerces empty endYear to undefined', () => {
    const r = careerEntrySchema.parse({ ...validCareer, endYear: '' });
    expect(r.endYear).toBeUndefined();
  });

  it('rejects endYear below 1950', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, endYear: 1949 });
    expect(r.success).toBe(false);
  });

  it('defaults orderIndex to 0 when omitted', () => {
    const r = careerEntrySchema.parse({ clubName: 'FC Test', startYear: 2010 });
    expect(r.orderIndex).toBe(0);
  });

  it('accepts an optional position enum value', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, position: 'GK' });
    expect(r.success).toBe(true);
  });

  it('rejects an invalid position enum value', () => {
    const r = careerEntrySchema.safeParse({ ...validCareer, position: 'SWEEPER' });
    expect(r.success).toBe(false);
  });
});

// ── updateAgentInfoSchema ─────────────────────────────────────────────────────

describe('updateAgentInfoSchema', () => {
  it('accepts an empty payload (all optional)', () => {
    expect(updateAgentInfoSchema.safeParse({}).success).toBe(true);
  });

  it('coerces empty strings to undefined', () => {
    const r = updateAgentInfoSchema.parse({ agentName: '', agentPhone: '', agentEmail: '' });
    expect(r.agentName).toBeUndefined();
    expect(r.agentPhone).toBeUndefined();
    expect(r.agentEmail).toBeUndefined();
  });

  it('rejects an invalid agentEmail', () => {
    const r = updateAgentInfoSchema.safeParse({ agentEmail: 'not-an-email' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.agentEmail).toBeTruthy();
  });

  it('accepts a valid agentEmail', () => {
    const r = updateAgentInfoSchema.safeParse({ agentEmail: 'agent@example.com' });
    expect(r.success).toBe(true);
  });

  it('rejects an agentName over 200 characters', () => {
    const r = updateAgentInfoSchema.safeParse({ agentName: 'a'.repeat(201) });
    expect(r.success).toBe(false);
  });
});

// ── updateVideoLinksSchema ────────────────────────────────────────────────────

describe('updateVideoLinksSchema', () => {
  it('accepts an empty videoLinks array', () => {
    expect(updateVideoLinksSchema.safeParse({ videoLinks: [] }).success).toBe(true);
  });

  it('accepts valid YouTube URLs', () => {
    const r = updateVideoLinksSchema.safeParse({
      videoLinks: ['https://www.youtube.com/watch?v=abc123'],
    });
    expect(r.success).toBe(true);
  });

  it('accepts valid Vimeo URLs', () => {
    const r = updateVideoLinksSchema.safeParse({
      videoLinks: ['https://vimeo.com/123456789'],
    });
    expect(r.success).toBe(true);
  });

  it('accepts a youtu.be short URL', () => {
    const r = updateVideoLinksSchema.safeParse({
      videoLinks: ['https://youtu.be/abc123'],
    });
    expect(r.success).toBe(true);
  });

  it('rejects non-video URLs', () => {
    const r = updateVideoLinksSchema.safeParse({
      videoLinks: ['https://example.com/video'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects more than 3 video links', () => {
    const r = updateVideoLinksSchema.safeParse({
      videoLinks: [
        'https://www.youtube.com/watch?v=a',
        'https://www.youtube.com/watch?v=b',
        'https://www.youtube.com/watch?v=c',
        'https://www.youtube.com/watch?v=d',
      ],
    });
    expect(r.success).toBe(false);
  });

  it('accepts exactly 3 video links', () => {
    const r = updateVideoLinksSchema.safeParse({
      videoLinks: [
        'https://www.youtube.com/watch?v=a',
        'https://www.youtube.com/watch?v=b',
        'https://vimeo.com/123',
      ],
    });
    expect(r.success).toBe(true);
  });
});
