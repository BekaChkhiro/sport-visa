import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      status: init?.status ?? 200,
      headers: new Headers(),
      json: async () => body,
    })),
  },
}));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock('@/lib/request-context', () => ({
  generateRequestId: vi.fn(() => 'rid'),
  getRequestId: vi.fn(() => null),
  REQUEST_ID_HEADER: 'x-request-id',
  runWithRequestContext: vi.fn((_c: unknown, fn: () => unknown) => fn()),
}));

const mockHeadObject = vi.hoisted(() => vi.fn());
const mockDeleteObject = vi.hoisted(() => vi.fn());
const mockRequireUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/r2', () => ({
  MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
  isAllowedImageType: vi.fn((ct: string) =>
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(ct),
  ),
  headObject: mockHeadObject,
  deleteObject: mockDeleteObject,
  publicUrlForKey: vi.fn((key: string) => `https://cdn.example.com/${key}`),
}));

vi.mock('@/lib/db', () => ({
  db: { media: { create: vi.fn() } },
}));

vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

import { POST } from '@/app/api/uploads/confirm/route';
import { db } from '@/lib/db';

const SESSION_USER = { id: 'user-1', email: 'a@b.com', role: 'FOOTBALLER', emailVerified: null };

function makeReq(body: unknown) {
  return new Request('http://localhost/api/uploads/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const HEAD_OK = { contentLength: 2048, contentType: 'image/jpeg' };
const MEDIA_ROW = {
  id: 'cuid-1',
  key: 'avatar/test.jpg',
  kind: 'AVATAR',
  contentType: 'image/jpeg',
  size: 2048,
  createdAt: new Date('2026-01-01'),
};

describe('POST /api/uploads/confirm', () => {
  beforeEach(() => {
    mockHeadObject.mockReset();
    mockDeleteObject.mockReset();
    mockRequireUser.mockReset();
    vi.mocked(db.media.create).mockReset();
  });

  it('returns 201 with the media record for an authenticated request', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockHeadObject.mockResolvedValueOnce(HEAD_OK);
    vi.mocked(db.media.create).mockResolvedValueOnce(MEDIA_ROW as never);

    const res = await POST(makeReq({ key: 'avatar/test.jpg', kind: 'AVATAR' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ id: 'cuid-1', url: 'https://cdn.example.com/avatar/test.jpg' });
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const res = await POST(makeReq({ key: 'avatar/test.jpg', kind: 'AVATAR' }));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('UNAUTHORIZED');
    expect(mockHeadObject).not.toHaveBeenCalled();
  });

  it('returns 404 when the object is not in R2', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockHeadObject.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ key: 'avatar/missing.jpg', kind: 'AVATAR' }));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('NOT_FOUND');
  });

  it('returns 422 and deletes the object when content type is disallowed', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockHeadObject.mockResolvedValueOnce({ contentLength: 100, contentType: 'application/pdf' });
    mockDeleteObject.mockResolvedValueOnce(undefined);

    const res = await POST(makeReq({ key: 'avatar/bad.pdf', kind: 'AVATAR' }));
    expect(res.status).toBe(422);
    expect(mockDeleteObject).toHaveBeenCalledWith('avatar/bad.pdf');
  });

  it('returns 422 and deletes the object when content length exceeds max', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockHeadObject.mockResolvedValueOnce({
      contentLength: 20 * 1024 * 1024,
      contentType: 'image/jpeg',
    });
    mockDeleteObject.mockResolvedValueOnce(undefined);

    const res = await POST(makeReq({ key: 'avatar/huge.jpg', kind: 'AVATAR' }));
    expect(res.status).toBe(422);
    expect(mockDeleteObject).toHaveBeenCalledWith('avatar/huge.jpg');
  });

  it('returns 422 for missing required fields', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const res = await POST(makeReq({ key: 'avatar/test.jpg' }));
    expect(res.status).toBe(422);
  });

  it('returns 400 for a non-JSON body', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/uploads/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
