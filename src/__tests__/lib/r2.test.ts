import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    R2_ACCOUNT_ID: 'acct-id',
    R2_ACCESS_KEY_ID: 'key-id',
    R2_SECRET_ACCESS_KEY: 'secret',
    R2_BUCKET: 'sport-bucket',
    R2_PUBLIC_BASE_URL: 'https://cdn.example.com',
  },
}));

vi.mock('next/server', () => ({ NextResponse: { json: vi.fn() } }));
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

const mockSend = vi.hoisted(() => vi.fn());

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function () {
    return { send: mockSend };
  }),
  PutObjectCommand: vi.fn(function (p) {
    return { input: p };
  }),
  HeadObjectCommand: vi.fn(function (p) {
    return { input: p };
  }),
  DeleteObjectCommand: vi.fn(function (p) {
    return { input: p };
  }),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async () => 'https://r2.example.com/up?sig=xyz'),
}));

import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  PRESIGN_TTL_SECONDS,
  buildObjectKey,
  createPresignedPutUrl,
  deleteObject,
  headObject,
  isAllowedImageType,
  publicUrlForKey,
} from '@/lib/r2';

describe('constants', () => {
  it('MAX_UPLOAD_BYTES is 10 MiB', () => {
    expect(MAX_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
  });

  it('PRESIGN_TTL_SECONDS is 60', () => {
    expect(PRESIGN_TTL_SECONDS).toBe(60);
  });
});

describe('isAllowedImageType', () => {
  it.each([...ALLOWED_IMAGE_TYPES])('accepts %s', (mime) => {
    expect(isAllowedImageType(mime)).toBe(true);
  });

  it('rejects image/svg+xml', () => {
    expect(isAllowedImageType('image/svg+xml')).toBe(false);
  });

  it('rejects application/pdf', () => {
    expect(isAllowedImageType('application/pdf')).toBe(false);
  });
});

describe('buildObjectKey', () => {
  it.each([
    ['AVATAR' as const, 'image/jpeg', 'avatar', 'jpg'],
    ['GALLERY' as const, 'image/png', 'gallery', 'png'],
    ['CLUB_LOGO' as const, 'image/webp', 'club-logo', 'webp'],
    ['CLUB_BANNER' as const, 'image/gif', 'club-banner', 'gif'],
    ['POST_IMAGE' as const, 'image/jpeg', 'post', 'jpg'],
    ['CHAT_ATTACHMENT' as const, 'image/png', 'chat', 'png'],
    ['OTHER' as const, 'image/webp', 'misc', 'webp'],
  ])('%s + %s → prefix=%s ext=.%s', (kind, contentType, prefix, ext) => {
    expect(buildObjectKey(kind, contentType)).toMatch(
      new RegExp(`^${prefix}\\/[a-f0-9]+\\.${ext}$`),
    );
  });

  it('generates unique keys on each call', () => {
    const k1 = buildObjectKey('AVATAR', 'image/jpeg');
    const k2 = buildObjectKey('AVATAR', 'image/jpeg');
    expect(k1).not.toBe(k2);
  });

  it('falls back to .bin for unknown content type', () => {
    expect(buildObjectKey('OTHER', 'application/octet-stream')).toMatch(/\.bin$/);
  });
});

describe('publicUrlForKey', () => {
  it('prepends R2_PUBLIC_BASE_URL', () => {
    expect(publicUrlForKey('avatar/abc.jpg')).toBe('https://cdn.example.com/avatar/abc.jpg');
  });
});

describe('createPresignedPutUrl', () => {
  it('returns the expected response shape', async () => {
    const res = await createPresignedPutUrl({
      kind: 'GALLERY',
      contentType: 'image/png',
      contentLength: 8192,
    });
    expect(res).toMatchObject({
      key: expect.stringMatching(/^gallery\/.+\.png$/),
      uploadUrl: 'https://r2.example.com/up?sig=xyz',
      expiresInSeconds: PRESIGN_TTL_SECONDS,
      requiredHeaders: { 'Content-Type': 'image/png', 'Content-Length': '8192' },
    });
  });
});

describe('headObject', () => {
  it('returns size and content-type when object exists', async () => {
    mockSend.mockResolvedValueOnce({ ContentLength: 4096, ContentType: 'image/jpeg' });
    expect(await headObject('avatar/x.jpg')).toEqual({
      contentLength: 4096,
      contentType: 'image/jpeg',
    });
  });

  it('returns null when R2 reports NotFound', async () => {
    mockSend.mockRejectedValueOnce({ name: 'NotFound' });
    expect(await headObject('avatar/missing.jpg')).toBeNull();
  });

  it('re-throws unexpected errors', async () => {
    mockSend.mockRejectedValueOnce(new Error('network error'));
    await expect(headObject('avatar/err.jpg')).rejects.toThrow('network error');
  });
});

describe('deleteObject', () => {
  it('resolves without error on success', async () => {
    mockSend.mockResolvedValueOnce({});
    await expect(deleteObject('avatar/old.jpg')).resolves.toBeUndefined();
  });
});
