import { describe, expect, it, vi } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn() },
}));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));
vi.mock('@/lib/request-context', () => ({
  generateRequestId: vi.fn(() => 'req-test-id'),
  getRequestId: vi.fn(() => null),
  REQUEST_ID_HEADER: 'x-request-id',
  runWithRequestContext: vi.fn((_ctx: unknown, fn: () => unknown) => fn()),
}));

import { ApiError, type ApiErrorCode } from '@/lib/api-error';

describe('ApiError', () => {
  it.each<[ApiErrorCode, number]>([
    ['BAD_REQUEST', 400],
    ['UNAUTHORIZED', 401],
    ['FORBIDDEN', 403],
    ['NOT_FOUND', 404],
    ['CONFLICT', 409],
    ['VALIDATION', 422],
    ['RATE_LIMITED', 429],
    ['INTERNAL', 500],
  ])('maps %s to HTTP status %d', (code, status) => {
    expect(new ApiError(code, '').status).toBe(status);
  });

  it('stores code, message, and name', () => {
    const err = new ApiError('FORBIDDEN', 'Access denied');
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('Access denied');
    expect(err.name).toBe('ApiError');
  });

  it('stores optional details', () => {
    const err = new ApiError('VALIDATION', 'Invalid input', {
      details: { field: 'email' },
    });
    expect(err.details).toEqual({ field: 'email' });
  });

  it('details is undefined when not provided', () => {
    expect(new ApiError('INTERNAL', 'oops').details).toBeUndefined();
  });

  it('is an instance of Error', () => {
    expect(new ApiError('INTERNAL', 'oops')).toBeInstanceOf(Error);
  });
});
