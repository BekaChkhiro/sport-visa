import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
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

const mockRequireUser = vi.hoisted(() => vi.fn());
const mockSendServiceRequestEmail = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

vi.mock('@/lib/resend', () => ({
  sendServiceRequestEmail: mockSendServiceRequestEmail,
}));

const mockFindUniqueCategory = vi.hoisted(() => vi.fn());
const mockCountRequests = vi.hoisted(() => vi.fn());
const mockCreateRequest = vi.hoisted(() => vi.fn());
const mockTransaction = vi.hoisted(() => vi.fn());
const mockFindUniqueProfile = vi.hoisted(() => vi.fn());
const mockFindManyAdmins = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    serviceCategory: {
      findUnique: mockFindUniqueCategory,
    },
    serviceRequest: {
      count: mockCountRequests,
      create: mockCreateRequest,
    },
    footballerProfile: {
      findUnique: mockFindUniqueProfile,
    },
    user: {
      findMany: mockFindManyAdmins,
    },
    $transaction: mockTransaction,
  },
}));

import { POST } from '@/app/api/services/requests/route';

const FOOTBALLER_USER = {
  id: 'user-1',
  email: 'player@test.com',
  role: 'FOOTBALLER' as const,
  emailVerified: null,
};

const CLUB_USER = {
  id: 'user-2',
  email: 'club@test.com',
  role: 'CLUB' as const,
  emailVerified: null,
};

const CATEGORY = {
  id: 'cat-1',
  name: 'კვება',
  isActive: true,
};

const CREATED_REQUEST = {
  id: 'req-1',
  requestCode: 'SR-2026-0001',
  status: 'PENDING',
};

function makeReq(body: unknown) {
  return new Request('http://localhost/api/services/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
    const tx = {
      serviceRequest: {
        count: mockCountRequests,
        create: mockCreateRequest,
      },
    };
    return fn(tx);
  });
  mockSendServiceRequestEmail.mockResolvedValue({ id: 'email-1' });
  mockFindUniqueProfile.mockResolvedValue({ firstName: 'ი', lastName: 'ბ' });
  mockFindManyAdmins.mockResolvedValue([]);
});

describe('POST /api/services/requests', () => {
  it('creates a service request and returns 201 with requestCode', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    mockFindUniqueCategory.mockResolvedValueOnce(CATEGORY);
    mockCountRequests.mockResolvedValueOnce(0);
    mockCreateRequest.mockResolvedValueOnce(CREATED_REQUEST);

    const res = await POST(
      makeReq({ categoryId: 'cat-1', startDate: '2026-06-01', endDate: '2026-06-30' }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.requestCode).toBe('SR-2026-0001');
    expect(body.status).toBe('PENDING');
    expect(body.categoryName).toBe('კვება');
  });

  it('pads the request code to 4 digits based on existing count', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    mockFindUniqueCategory.mockResolvedValueOnce(CATEGORY);
    mockCountRequests.mockResolvedValueOnce(41);
    mockCreateRequest.mockResolvedValueOnce({ ...CREATED_REQUEST, requestCode: 'SR-2026-0042' });

    const res = await POST(makeReq({ categoryId: 'cat-1' }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ requestCode: expect.stringMatching(/SR-\d{4}-0042/) }),
      }),
    );
    expect(body.requestCode).toBe('SR-2026-0042');
  });

  it('returns 401 for unauthenticated callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));

    const res = await POST(makeReq({ categoryId: 'cat-1' }));

    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('UNAUTHORIZED');
    expect(mockFindUniqueCategory).not.toHaveBeenCalled();
  });

  it('returns 403 for non-footballer users', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);

    const res = await POST(makeReq({ categoryId: 'cat-1' }));

    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('FORBIDDEN');
    expect(mockFindUniqueCategory).not.toHaveBeenCalled();
  });

  it('returns 422 for missing categoryId', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);

    const res = await POST(makeReq({}));

    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe('VALIDATION');
    expect(mockFindUniqueCategory).not.toHaveBeenCalled();
  });

  it('returns 422 for notes exceeding 500 characters', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);

    const res = await POST(makeReq({ categoryId: 'cat-1', notes: 'x'.repeat(501) }));

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid contactPref value', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);

    const res = await POST(makeReq({ categoryId: 'cat-1', contactPref: 'CARRIER_PIGEON' }));

    expect(res.status).toBe(422);
  });

  it('returns 404 when category does not exist', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    mockFindUniqueCategory.mockResolvedValueOnce(null);

    const res = await POST(makeReq({ categoryId: 'nonexistent' }));

    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when category is inactive', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    mockFindUniqueCategory.mockResolvedValueOnce({ ...CATEGORY, isActive: false });

    const res = await POST(makeReq({ categoryId: 'cat-1' }));

    expect(res.status).toBe(404);
  });

  it('stores metadata for meal-plan category', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    mockFindUniqueCategory.mockResolvedValueOnce(CATEGORY);
    mockCountRequests.mockResolvedValueOnce(0);
    mockCreateRequest.mockResolvedValueOnce(CREATED_REQUEST);

    await POST(
      makeReq({
        categoryId: 'cat-1',
        metadata: { planType: '3', dietary: ['vegan'] },
      }),
    );

    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: { planType: '3', dietary: ['vegan'] },
        }),
      }),
    );
  });

  it('accepts PHONE and CHAT as valid contactPref values', async () => {
    for (const pref of ['PHONE', 'CHAT'] as const) {
      mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
      mockFindUniqueCategory.mockResolvedValueOnce(CATEGORY);
      mockCountRequests.mockResolvedValueOnce(0);
      mockCreateRequest.mockResolvedValueOnce(CREATED_REQUEST);

      const res = await POST(makeReq({ categoryId: 'cat-1', contactPref: pref }));
      expect(res.status).toBe(201);
    }
  });
});
