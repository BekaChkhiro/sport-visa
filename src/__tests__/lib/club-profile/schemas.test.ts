import { describe, expect, it } from 'vitest';

import {
  clubHistoryEventSchema,
  clubPostSchema,
  clubRosterEntrySchema,
  updateClubBioSchema,
  updateClubIdentitySchema,
} from '@/lib/club-profile/schemas';

const currentYear = new Date().getFullYear();

const validIdentity = {
  name: 'FC Dinamo',
};

describe('updateClubIdentitySchema', () => {
  it('accepts a minimum-valid payload (name only)', () => {
    expect(updateClubIdentitySchema.safeParse(validIdentity).success).toBe(true);
  });

  it('rejects an empty name', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, name: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.name).toBeTruthy();
  });

  it('rejects a name over 200 characters', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, name: 'a'.repeat(201) });
    expect(r.success).toBe(false);
  });

  it('accepts a full valid payload', () => {
    const r = updateClubIdentitySchema.safeParse({
      ...validIdentity,
      foundedYear: 1925,
      country: 'GE',
      city: 'Tbilisi',
      league: 'Erovnuli Liga',
      stadiumName: 'Boris Paichadze Arena',
      stadiumCapacity: 55000,
      officialWebsite: 'https://dinamo.ge',
    });
    expect(r.success).toBe(true);
  });

  it('coerces empty optional strings to undefined', () => {
    const r = updateClubIdentitySchema.parse({
      ...validIdentity,
      city: '',
      league: '',
      stadiumName: '',
    });
    expect(r.city).toBeUndefined();
    expect(r.league).toBeUndefined();
    expect(r.stadiumName).toBeUndefined();
  });

  it('coerces empty foundedYear string to undefined', () => {
    const r = updateClubIdentitySchema.parse({ ...validIdentity, foundedYear: '' });
    expect(r.foundedYear).toBeUndefined();
  });

  it('coerces string foundedYear to number', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, foundedYear: '1925' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.foundedYear).toBe(1925);
  });

  it('rejects foundedYear below 1800', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, foundedYear: 1799 });
    expect(r.success).toBe(false);
  });

  it('rejects foundedYear in the future', () => {
    const r = updateClubIdentitySchema.safeParse({
      ...validIdentity,
      foundedYear: currentYear + 1,
    });
    expect(r.success).toBe(false);
  });

  it('upcases country code', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, country: 'ge' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.country).toBe('GE');
  });

  it('rejects a country code that is not 2 letters', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, country: 'GEO' });
    expect(r.success).toBe(false);
  });

  it('coerces empty country to undefined', () => {
    const r = updateClubIdentitySchema.parse({ ...validIdentity, country: '' });
    expect(r.country).toBeUndefined();
  });

  it('rejects an invalid URL for officialWebsite', () => {
    const r = updateClubIdentitySchema.safeParse({
      ...validIdentity,
      officialWebsite: 'not-a-url',
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.officialWebsite).toBeTruthy();
  });

  it('accepts a valid URL for officialWebsite', () => {
    const r = updateClubIdentitySchema.safeParse({
      ...validIdentity,
      officialWebsite: 'https://dinamo.ge',
    });
    expect(r.success).toBe(true);
  });

  it('coerces empty officialWebsite to undefined', () => {
    const r = updateClubIdentitySchema.parse({ ...validIdentity, officialWebsite: '' });
    expect(r.officialWebsite).toBeUndefined();
  });

  it('coerces stadiumCapacity string to number', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, stadiumCapacity: '55000' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.stadiumCapacity).toBe(55000);
  });

  it('rejects a negative stadiumCapacity', () => {
    const r = updateClubIdentitySchema.safeParse({ ...validIdentity, stadiumCapacity: -1 });
    expect(r.success).toBe(false);
  });
});

describe('clubRosterEntrySchema', () => {
  const validEntry = { playerName: 'ი. ბაბუნაშვილი' };

  it('accepts a minimum-valid payload (name only)', () => {
    expect(clubRosterEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it('rejects an empty playerName', () => {
    const r = clubRosterEntrySchema.safeParse({ playerName: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.playerName).toBeTruthy();
  });

  it('rejects a playerName over 120 characters', () => {
    const r = clubRosterEntrySchema.safeParse({ playerName: 'a'.repeat(121) });
    expect(r.success).toBe(false);
  });

  it('accepts a full valid payload', () => {
    const r = clubRosterEntrySchema.safeParse({
      playerName: 'გ. მამარდაშვილი',
      position: 'GK',
      jerseyNumber: 1,
    });
    expect(r.success).toBe(true);
  });

  it('accepts every valid position code', () => {
    for (const pos of ['GK', 'CB', 'LB', 'RB', 'CM', 'DM', 'AM', 'LW', 'RW', 'CF', 'ST']) {
      const r = clubRosterEntrySchema.safeParse({ ...validEntry, position: pos });
      expect(r.success).toBe(true);
    }
  });

  it('rejects an invalid position code', () => {
    const r = clubRosterEntrySchema.safeParse({ ...validEntry, position: 'XX' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.position).toBeTruthy();
  });

  it('coerces empty position string to undefined', () => {
    const r = clubRosterEntrySchema.parse({ ...validEntry, position: '' });
    expect(r.position).toBeUndefined();
  });

  it('coerces empty jerseyNumber string to undefined', () => {
    const r = clubRosterEntrySchema.parse({ ...validEntry, jerseyNumber: '' });
    expect(r.jerseyNumber).toBeUndefined();
  });

  it('coerces string jerseyNumber to number', () => {
    const r = clubRosterEntrySchema.safeParse({ ...validEntry, jerseyNumber: '9' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.jerseyNumber).toBe(9);
  });

  it('rejects jerseyNumber below 1', () => {
    const r = clubRosterEntrySchema.safeParse({ ...validEntry, jerseyNumber: 0 });
    expect(r.success).toBe(false);
  });

  it('rejects jerseyNumber above 99', () => {
    const r = clubRosterEntrySchema.safeParse({ ...validEntry, jerseyNumber: 100 });
    expect(r.success).toBe(false);
  });

  it('trims whitespace from playerName', () => {
    const r = clubRosterEntrySchema.parse({ playerName: '  გ. მ.  ' });
    expect(r.playerName).toBe('გ. მ.');
  });
});

describe('updateClubBioSchema', () => {
  it('accepts a non-empty bio', () => {
    const r = updateClubBioSchema.safeParse({ bio: 'FC Dinamo ისტ.' });
    expect(r.success).toBe(true);
  });

  it('accepts a bio exactly 2000 characters long', () => {
    const r = updateClubBioSchema.safeParse({ bio: 'a'.repeat(2000) });
    expect(r.success).toBe(true);
  });

  it('rejects a bio exceeding 2000 characters', () => {
    const r = updateClubBioSchema.safeParse({ bio: 'a'.repeat(2001) });
    expect(r.success).toBe(false);
  });

  it('coerces an empty string bio to undefined', () => {
    const r = updateClubBioSchema.parse({ bio: '' });
    expect(r.bio).toBeUndefined();
  });

  it('accepts a missing bio field', () => {
    const r = updateClubBioSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it('coerces null bio to undefined', () => {
    const r = updateClubBioSchema.parse({ bio: null });
    expect(r.bio).toBeUndefined();
  });
});

describe('clubHistoryEventSchema', () => {
  const currentYear = new Date().getFullYear();
  const validEvent = { year: 1925, title: 'კლუბის დაარსება' };

  it('accepts a minimum-valid payload', () => {
    expect(clubHistoryEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it('accepts a full valid payload with description', () => {
    const r = clubHistoryEventSchema.safeParse({
      ...validEvent,
      description: 'გაიხსნა ახალი სტადიონი',
    });
    expect(r.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, title: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.title).toBeTruthy();
  });

  it('rejects a title over 200 characters', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, title: 'a'.repeat(201) });
    expect(r.success).toBe(false);
  });

  it('trims whitespace from title', () => {
    const r = clubHistoryEventSchema.parse({ ...validEvent, title: '  საჩემპიონო  ' });
    expect(r.title).toBe('საჩემპიონო');
  });

  it('rejects year below 1800', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, year: 1799 });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.year).toBeTruthy();
  });

  it('accepts year equal to 1800', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, year: 1800 });
    expect(r.success).toBe(true);
  });

  it('accepts the current year', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, year: currentYear });
    expect(r.success).toBe(true);
  });

  it('rejects a year in the future', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, year: currentYear + 1 });
    expect(r.success).toBe(false);
  });

  it('coerces a string year to number', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, year: '1990' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.year).toBe(1990);
  });

  it('rejects a missing year', () => {
    const r = clubHistoryEventSchema.safeParse({ title: 'No year' });
    expect(r.success).toBe(false);
  });

  it('coerces empty string description to undefined', () => {
    const r = clubHistoryEventSchema.parse({ ...validEvent, description: '' });
    expect(r.description).toBeUndefined();
  });

  it('rejects a description over 500 characters', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, description: 'a'.repeat(501) });
    expect(r.success).toBe(false);
  });

  it('accepts a description exactly 500 characters long', () => {
    const r = clubHistoryEventSchema.safeParse({ ...validEvent, description: 'a'.repeat(500) });
    expect(r.success).toBe(true);
  });
});

describe('clubPostSchema', () => {
  const validPost = { title: 'ახალი სეზონი დაიწყო', body: 'ჩვენი გუნდი მზადაა.' };

  it('accepts a valid post', () => {
    expect(clubPostSchema.safeParse(validPost).success).toBe(true);
  });

  it('rejects an empty title', () => {
    const r = clubPostSchema.safeParse({ ...validPost, title: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.title).toBeTruthy();
  });

  it('rejects a title over 200 characters', () => {
    const r = clubPostSchema.safeParse({ ...validPost, title: 'a'.repeat(201) });
    expect(r.success).toBe(false);
  });

  it('rejects an empty body', () => {
    const r = clubPostSchema.safeParse({ ...validPost, body: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.body).toBeTruthy();
  });

  it('rejects a body over 5000 characters', () => {
    const r = clubPostSchema.safeParse({ ...validPost, body: 'a'.repeat(5001) });
    expect(r.success).toBe(false);
  });

  it('accepts body exactly 5000 characters long', () => {
    const r = clubPostSchema.safeParse({ ...validPost, body: 'a'.repeat(5000) });
    expect(r.success).toBe(true);
  });

  it('trims whitespace from title', () => {
    const r = clubPostSchema.parse({ ...validPost, title: '  სათაური  ' });
    expect(r.title).toBe('სათაური');
  });

  it('trims whitespace from body', () => {
    const r = clubPostSchema.parse({ ...validPost, body: '  ტექსტი  ' });
    expect(r.body).toBe('ტექსტი');
  });
});
