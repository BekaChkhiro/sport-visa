import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockCpUpdate = vi.hoisted(() => vi.fn());
const mockCpFindUnique = vi.hoisted(() => vi.fn());
const mockDeleteObject = vi.hoisted(() => vi.fn());
const mockRosterCreate = vi.hoisted(() => vi.fn());
const mockRosterUpdate = vi.hoisted(() => vi.fn());
const mockRosterDelete = vi.hoisted(() => vi.fn());
const mockRosterFindFirst = vi.hoisted(() => vi.fn());
const mockHistoryCreate = vi.hoisted(() => vi.fn());
const mockHistoryFindFirst = vi.hoisted(() => vi.fn());
const mockHistoryUpdate = vi.hoisted(() => vi.fn());
const mockHistoryDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    clubProfile: {
      update: mockCpUpdate,
      findUnique: mockCpFindUnique,
    },
    clubRosterEntry: {
      create: mockRosterCreate,
      update: mockRosterUpdate,
      delete: mockRosterDelete,
      findFirst: mockRosterFindFirst,
    },
    clubHistoryEvent: {
      create: mockHistoryCreate,
      findFirst: mockHistoryFindFirst,
      update: mockHistoryUpdate,
      delete: mockHistoryDelete,
    },
  },
}));

vi.mock('@/lib/r2', () => ({ deleteObject: mockDeleteObject }));

import {
  updateClubIdentity,
  updateClubLogo,
  updateClubCover,
  updateClubVisibility,
  updateClubBio,
  addClubHistoryEvent,
  updateClubHistoryEvent,
  deleteClubHistoryEvent,
  addClubRosterEntry,
  updateClubRosterEntry,
  deleteClubRosterEntry,
} from '@/lib/club-profile/actions';

const clubSession = { user: { id: 'u1', role: 'CLUB' } };
const footballerSession = { user: { id: 'u2', role: 'FOOTBALLER' } };

const validIdentity = { name: 'FC Dinamo' };

beforeEach(() => {
  mockAuth.mockReset();
  mockCpUpdate.mockReset();
  mockCpFindUnique.mockReset();
  mockDeleteObject.mockReset();
  mockRosterCreate.mockReset();
  mockRosterUpdate.mockReset();
  mockRosterDelete.mockReset();
  mockRosterFindFirst.mockReset();
  mockHistoryCreate.mockReset();
  mockHistoryFindFirst.mockReset();
  mockHistoryUpdate.mockReset();
  mockHistoryDelete.mockReset();
});

// ── updateClubIdentity ────────────────────────────────────────────────────────

describe('updateClubIdentity — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubIdentity(validIdentity);
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubIdentity(validIdentity);
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });
});

describe('updateClubIdentity — validation', () => {
  it('returns fieldErrors on invalid payload', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateClubIdentity({ name: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.name).toBeTruthy();
  });
});

describe('updateClubIdentity — happy path', () => {
  it('saves and returns success', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubIdentity(validIdentity);

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
        data: expect.objectContaining({ name: 'FC Dinamo' }),
      }),
    );
  });

  it('sets null for omitted optional fields', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    await updateClubIdentity({ name: 'FC Test' });

    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          city: null,
          league: null,
          stadiumName: null,
        }),
      }),
    );
  });
});

// ── updateClubLogo ────────────────────────────────────────────────────────────

describe('updateClubLogo — auth guard', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubLogo('logo/key.png');
    expect(r.status).toBe('error');
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubLogo('logo/key.png');
    expect(r.status).toBe('error');
  });
});

describe('updateClubLogo — happy path', () => {
  it('saves the new logo key', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ logoKey: null });
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubLogo('logo/new.png');

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { logoKey: 'logo/new.png' } }),
    );
  });

  it('deletes the old logo key when replacing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ logoKey: 'logo/old.png' });
    mockCpUpdate.mockResolvedValueOnce({});
    mockDeleteObject.mockResolvedValueOnce(undefined);

    await updateClubLogo('logo/new.png');

    expect(mockDeleteObject).toHaveBeenCalledWith('logo/old.png');
  });

  it('does not delete when key is unchanged', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ logoKey: 'logo/same.png' });
    mockCpUpdate.mockResolvedValueOnce({});

    await updateClubLogo('logo/same.png');

    expect(mockDeleteObject).not.toHaveBeenCalled();
  });

  it('returns error when profile not found', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce(null);

    const r = await updateClubLogo('logo/key.png');
    expect(r.status).toBe('error');
  });
});

// ── updateClubCover ───────────────────────────────────────────────────────────

describe('updateClubCover — happy path', () => {
  it('saves the new cover key', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ coverKey: null });
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubCover('cover/new.jpg');

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { coverKey: 'cover/new.jpg' } }),
    );
  });

  it('deletes the old cover when replacing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ coverKey: 'cover/old.jpg' });
    mockCpUpdate.mockResolvedValueOnce({});
    mockDeleteObject.mockResolvedValueOnce(undefined);

    await updateClubCover('cover/new.jpg');

    expect(mockDeleteObject).toHaveBeenCalledWith('cover/old.jpg');
  });
});

// ── updateClubVisibility ──────────────────────────────────────────────────────

describe('updateClubVisibility', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubVisibility(false);
    expect(r.status).toBe('error');
  });

  it('saves visibility=false', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubVisibility(false);

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isVisible: false } }),
    );
  });

  it('saves visibility=true', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubVisibility(true);

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isVisible: true } }),
    );
  });
});

// ── addClubRosterEntry ────────────────────────────────────────────────────────

const validRosterPayload = { playerName: 'ი. ბაბუნაშვილი', position: 'CM', jerseyNumber: 8 };

describe('addClubRosterEntry — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await addClubRosterEntry(validRosterPayload);
    expect(r.status).toBe('error');
    expect(mockRosterCreate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await addClubRosterEntry(validRosterPayload);
    expect(r.status).toBe('error');
    expect(mockRosterCreate).not.toHaveBeenCalled();
  });
});

describe('addClubRosterEntry — validation', () => {
  it('returns fieldErrors on empty playerName', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await addClubRosterEntry({ playerName: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.playerName).toBeTruthy();
    expect(mockRosterCreate).not.toHaveBeenCalled();
  });

  it('rejects an invalid position code', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await addClubRosterEntry({ playerName: 'X', position: 'XX' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.position).toBeTruthy();
  });
});

describe('addClubRosterEntry — happy path', () => {
  it('creates an entry with orderIndex 0 when none exist', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce(null);
    mockRosterCreate.mockResolvedValueOnce({ id: 'roster1' });

    const r = await addClubRosterEntry(validRosterPayload);

    expect(r.status).toBe('success');
    if (r.status === 'success') expect(r.entryId).toBe('roster1');
    expect(mockRosterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clubId: 'club1',
          playerName: 'ი. ბაბუნაშვილი',
          position: 'CM',
          jerseyNumber: 8,
          orderIndex: 0,
        }),
      }),
    );
  });

  it('appends to the end via incremented orderIndex', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce({ orderIndex: 4 });
    mockRosterCreate.mockResolvedValueOnce({ id: 'roster2' });

    await addClubRosterEntry(validRosterPayload);

    expect(mockRosterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orderIndex: 5 }) }),
    );
  });

  it('stores null for omitted position and jerseyNumber', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce(null);
    mockRosterCreate.mockResolvedValueOnce({ id: 'roster3' });

    await addClubRosterEntry({ playerName: 'ნ. კ.' });

    expect(mockRosterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: null, jerseyNumber: null }),
      }),
    );
  });

  it('returns error when club profile missing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce(null);

    const r = await addClubRosterEntry(validRosterPayload);

    expect(r.status).toBe('error');
    expect(mockRosterCreate).not.toHaveBeenCalled();
  });
});

// ── updateClubRosterEntry ─────────────────────────────────────────────────────

describe('updateClubRosterEntry', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubRosterEntry('r1', validRosterPayload);
    expect(r.status).toBe('error');
    expect(mockRosterUpdate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubRosterEntry('r1', validRosterPayload);
    expect(r.status).toBe('error');
  });

  it('returns fieldErrors on invalid payload', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateClubRosterEntry('r1', { playerName: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.playerName).toBeTruthy();
  });

  it('returns error when entry does not belong to the club', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce(null);

    const r = await updateClubRosterEntry('r-other', validRosterPayload);

    expect(r.status).toBe('error');
    expect(mockRosterUpdate).not.toHaveBeenCalled();
  });

  it('updates the entry on happy path', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce({ id: 'r1' });
    mockRosterUpdate.mockResolvedValueOnce({});

    const r = await updateClubRosterEntry('r1', validRosterPayload);

    expect(r.status).toBe('success');
    expect(mockRosterUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'r1' },
        data: expect.objectContaining({
          playerName: 'ი. ბაბუნაშვილი',
          position: 'CM',
          jerseyNumber: 8,
        }),
      }),
    );
  });
});

// ── deleteClubRosterEntry ─────────────────────────────────────────────────────

describe('deleteClubRosterEntry', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await deleteClubRosterEntry('r1');
    expect(r.status).toBe('error');
    expect(mockRosterDelete).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await deleteClubRosterEntry('r1');
    expect(r.status).toBe('error');
  });

  it('returns error when entry does not belong to the club', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce(null);

    const r = await deleteClubRosterEntry('r-other');

    expect(r.status).toBe('error');
    expect(mockRosterDelete).not.toHaveBeenCalled();
  });

  it('deletes the entry on happy path', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockRosterFindFirst.mockResolvedValueOnce({ id: 'r1' });
    mockRosterDelete.mockResolvedValueOnce({});

    const r = await deleteClubRosterEntry('r1');

    expect(r.status).toBe('success');
    expect(mockRosterDelete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });
});

// ── updateClubBio ─────────────────────────────────────────────────────────────

describe('updateClubBio — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubBio({ bio: 'Some bio text' });
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubBio({ bio: 'Some bio text' });
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });
});

describe('updateClubBio — validation', () => {
  it('rejects bio longer than 2000 characters', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateClubBio({ bio: 'a'.repeat(2001) });
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });
});

describe('updateClubBio — happy path', () => {
  it('saves a non-empty bio', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubBio({ bio: 'FC Dinamo ისტ.' });

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { bio: 'FC Dinamo ისტ.' } }),
    );
  });

  it('saves null when bio is omitted', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubBio({});

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { bio: null } }));
  });

  it('saves null when bio is an empty string', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubBio({ bio: '' });

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { bio: null } }));
  });
});

// ── addClubHistoryEvent ───────────────────────────────────────────────────────

const validHistoryPayload = { year: 1925, title: 'კლუბის დაარსება' };

describe('addClubHistoryEvent — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await addClubHistoryEvent(validHistoryPayload);
    expect(r.status).toBe('error');
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await addClubHistoryEvent(validHistoryPayload);
    expect(r.status).toBe('error');
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });
});

describe('addClubHistoryEvent — validation', () => {
  it('returns fieldErrors on empty title', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await addClubHistoryEvent({ year: 1990, title: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.title).toBeTruthy();
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });

  it('returns fieldErrors when year is missing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await addClubHistoryEvent({ title: 'Something' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.year).toBeTruthy();
  });

  it('returns error when year is in the future', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await addClubHistoryEvent({ year: 9999, title: 'Future' });
    expect(r.status).toBe('error');
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });
});

describe('addClubHistoryEvent — happy path', () => {
  it('creates an event and returns eventId', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryCreate.mockResolvedValueOnce({ id: 'ev1' });

    const r = await addClubHistoryEvent(validHistoryPayload);

    expect(r.status).toBe('success');
    if (r.status === 'success') expect(r.eventId).toBe('ev1');
    expect(mockHistoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clubId: 'club1',
          year: 1925,
          title: 'კლუბის დაარსება',
        }),
      }),
    );
  });

  it('stores null for omitted description', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryCreate.mockResolvedValueOnce({ id: 'ev2' });

    await addClubHistoryEvent({ year: 2000, title: 'No desc' });

    expect(mockHistoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ description: null }),
      }),
    );
  });

  it('stores description when provided', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryCreate.mockResolvedValueOnce({ id: 'ev3' });

    await addClubHistoryEvent({ year: 2010, title: 'Championship', description: 'Won the cup' });

    expect(mockHistoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ description: 'Won the cup' }),
      }),
    );
  });

  it('returns error when club profile is missing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce(null);

    const r = await addClubHistoryEvent(validHistoryPayload);

    expect(r.status).toBe('error');
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });
});

// ── updateClubHistoryEvent ────────────────────────────────────────────────────

describe('updateClubHistoryEvent — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubHistoryEvent('ev1', validHistoryPayload);
    expect(r.status).toBe('error');
    expect(mockHistoryUpdate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubHistoryEvent('ev1', validHistoryPayload);
    expect(r.status).toBe('error');
  });
});

describe('updateClubHistoryEvent — validation', () => {
  it('returns fieldErrors on invalid payload', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateClubHistoryEvent('ev1', { year: 1990, title: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.title).toBeTruthy();
  });
});

describe('updateClubHistoryEvent — ownership & happy path', () => {
  it('returns error when event does not belong to the club', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryFindFirst.mockResolvedValueOnce(null);

    const r = await updateClubHistoryEvent('ev-other', validHistoryPayload);

    expect(r.status).toBe('error');
    expect(mockHistoryUpdate).not.toHaveBeenCalled();
  });

  it('updates the event on happy path', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryFindFirst.mockResolvedValueOnce({ id: 'ev1' });
    mockHistoryUpdate.mockResolvedValueOnce({});

    const r = await updateClubHistoryEvent('ev1', {
      year: 1926,
      title: 'Updated title',
      description: 'desc',
    });

    expect(r.status).toBe('success');
    expect(mockHistoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ev1' },
        data: expect.objectContaining({ year: 1926, title: 'Updated title', description: 'desc' }),
      }),
    );
  });

  it('sets null for omitted description on update', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryFindFirst.mockResolvedValueOnce({ id: 'ev1' });
    mockHistoryUpdate.mockResolvedValueOnce({});

    await updateClubHistoryEvent('ev1', validHistoryPayload);

    expect(mockHistoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ description: null }),
      }),
    );
  });

  it('returns error when club profile is missing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce(null);

    const r = await updateClubHistoryEvent('ev1', validHistoryPayload);

    expect(r.status).toBe('error');
    expect(mockHistoryUpdate).not.toHaveBeenCalled();
  });
});

// ── deleteClubHistoryEvent ────────────────────────────────────────────────────

describe('deleteClubHistoryEvent', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await deleteClubHistoryEvent('ev1');
    expect(r.status).toBe('error');
    expect(mockHistoryDelete).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await deleteClubHistoryEvent('ev1');
    expect(r.status).toBe('error');
  });

  it('returns error when event does not belong to the club', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryFindFirst.mockResolvedValueOnce(null);

    const r = await deleteClubHistoryEvent('ev-other');

    expect(r.status).toBe('error');
    expect(mockHistoryDelete).not.toHaveBeenCalled();
  });

  it('deletes the event on happy path', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ id: 'club1' });
    mockHistoryFindFirst.mockResolvedValueOnce({ id: 'ev1' });
    mockHistoryDelete.mockResolvedValueOnce({});

    const r = await deleteClubHistoryEvent('ev1');

    expect(r.status).toBe('success');
    expect(mockHistoryDelete).toHaveBeenCalledWith({ where: { id: 'ev1' } });
  });

  it('returns error when club profile is missing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce(null);

    const r = await deleteClubHistoryEvent('ev1');

    expect(r.status).toBe('error');
    expect(mockHistoryDelete).not.toHaveBeenCalled();
  });
});
