import { describe, expect, it, vi } from 'vitest';

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

const mockCreatePresignedPutUrl = vi.hoisted(() => vi.fn());

vi.mock('@/lib/r2', () => ({
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
  PRESIGN_TTL_SECONDS: 60,
  isAllowedImageType: vi.fn((ct: string) =>
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(ct),
  ),
  createPresignedPutUrl: mockCreatePresignedPutUrl,
}));

import { POST } from '@/app/api/uploads/presign/route';

function makeReq(body: unknown) {
  return new Request('http://localhost/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const PRESIGN_RESULT = {
  key: 'avatar/abc123.jpg',
  uploadUrl: 'https://presigned.example.com/upload',
  expiresInSeconds: 60,
  requiredHeaders: { 'Content-Type': 'image/jpeg', 'Content-Length': '1024' },
};

describe('POST /api/uploads/presign', () => {
  it('returns 200 with presigned URL for a valid request', async () => {
    mockCreatePresignedPutUrl.mockResolvedValueOnce(PRESIGN_RESULT);
    const res = await POST(
      makeReq({ kind: 'AVATAR', contentType: 'image/jpeg', contentLength: 1024 }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      key: 'avatar/abc123.jpg',
      uploadUrl: expect.any(String),
    });
  });

  it('returns 422 for an unsupported content type', async () => {
    const res = await POST(
      makeReq({ kind: 'AVATAR', contentType: 'image/svg+xml', contentLength: 512 }),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe('VALIDATION');
  });

  it('returns 422 when the file size exceeds MAX_UPLOAD_BYTES', async () => {
    const res = await POST(
      makeReq({ kind: 'GALLERY', contentType: 'image/jpeg', contentLength: 11 * 1024 * 1024 }),
    );
    expect(res.status).toBe(422);
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await POST(makeReq({ kind: 'AVATAR' }));
    expect(res.status).toBe(422);
  });

  it('returns 422 for an invalid MediaKind value', async () => {
    const res = await POST(
      makeReq({ kind: 'SELFIE', contentType: 'image/jpeg', contentLength: 100 }),
    );
    expect(res.status).toBe(422);
  });

  it('returns 400 for a non-JSON body', async () => {
    const req = new Request('http://localhost/api/uploads/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
