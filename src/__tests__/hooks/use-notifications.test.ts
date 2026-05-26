// @vitest-environment happy-dom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock pusher hooks so we don't need a real Pusher connection.
const mockUsePusherChannel = vi.hoisted(() => vi.fn(() => null));
const mockUsePusherEvent = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/use-pusher-channel', () => ({
  usePusherChannel: mockUsePusherChannel,
  usePusherEvent: mockUsePusherEvent,
}));

vi.mock('@/lib/pusher-client', () => ({
  channels: {
    userNotifications: (id: string) => `private-user.${id}.notifications`,
  },
  events: {
    NOTIFICATION: 'notification',
  },
}));

import { useNotifications } from '@/hooks/use-notifications';
import type { NotificationItem } from '@/hooks/use-notifications';

const NOTIF_A: NotificationItem = {
  id: 'n1',
  type: 'GENERAL',
  title: 'New post',
  body: 'Body text',
  read: false,
  createdAt: new Date('2026-01-01T10:00:00Z').toISOString(),
};

const NOTIF_B: NotificationItem = {
  id: 'n2',
  type: 'GENERAL',
  title: 'Another',
  body: 'More text',
  read: true,
  createdAt: new Date('2026-01-01T09:00:00Z').toISOString(),
};

function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(status = 500): Response {
  return new Response(null, { status });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  mockUsePusherChannel.mockReset();
  mockUsePusherEvent.mockReset();
  mockUsePusherChannel.mockReturnValue(null);
  mockUsePusherEvent.mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useNotifications — initial data', () => {
  it('uses initialData without fetching', async () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A]));
    expect(result.current.notifications).toEqual([NOTIF_A]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('computes unreadCount from initialData', () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A, NOTIF_B]));
    expect(result.current.unreadCount).toBe(1);
  });

  it('starts with loading=false when initialData is provided', () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A]));
    expect(result.current.loading).toBe(false);
  });
});

describe('useNotifications — fetch on mount', () => {
  it('fetches /api/notifications when no initialData is given', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({ notifications: [NOTIF_A] }));
    const { result } = renderHook(() => useNotifications('u1'));
    await waitFor(() => expect(result.current.notifications).toEqual([NOTIF_A]));
    expect(fetch).toHaveBeenCalledWith('/api/notifications');
  });

  it('does not fetch when userId is null', () => {
    const { result } = renderHook(() => useNotifications(null));
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
  });

  it('leaves notifications empty when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(errorResponse(500));
    const { result } = renderHook(() => useNotifications('u1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toEqual([]);
  });

  it('sets loading to false after fetch completes', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({ notifications: [] }));
    const { result } = renderHook(() => useNotifications('u1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe('useNotifications — markRead', () => {
  it('calls PATCH /api/notifications/:id and sets notification to read', async () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A]));

    vi.mocked(fetch).mockResolvedValueOnce(okJson({ id: 'n1', read: true }));
    await act(async () => {
      await result.current.markRead('n1');
    });

    expect(fetch).toHaveBeenCalledWith('/api/notifications/n1', { method: 'PATCH' });
    expect(result.current.notifications[0]?.read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('does not update state when the PATCH fails', async () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A]));

    vi.mocked(fetch).mockResolvedValueOnce(errorResponse(404));
    await act(async () => {
      await result.current.markRead('n1');
    });

    expect(result.current.notifications[0]?.read).toBe(false);
  });

  it('does nothing when userId is null', async () => {
    const { result } = renderHook(() => useNotifications(null, [NOTIF_A]));
    await act(async () => {
      await result.current.markRead('n1');
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('useNotifications — markAllRead', () => {
  it('calls PATCH /api/notifications and marks all notifications read', async () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A, NOTIF_B]));

    vi.mocked(fetch).mockResolvedValueOnce(okJson({ updated: 1 }));
    await act(async () => {
      await result.current.markAllRead();
    });

    expect(fetch).toHaveBeenCalledWith('/api/notifications', { method: 'PATCH' });
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it('does not update state when the PATCH fails', async () => {
    const { result } = renderHook(() => useNotifications('u1', [NOTIF_A]));

    vi.mocked(fetch).mockResolvedValueOnce(errorResponse(500));
    await act(async () => {
      await result.current.markAllRead();
    });

    expect(result.current.unreadCount).toBe(1);
  });

  it('does nothing when userId is null', async () => {
    const { result } = renderHook(() => useNotifications(null, [NOTIF_A]));
    await act(async () => {
      await result.current.markAllRead();
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('useNotifications — Pusher subscription', () => {
  it('subscribes to the user notifications channel', () => {
    renderHook(() => useNotifications('user-xyz', [NOTIF_A]));
    expect(mockUsePusherChannel).toHaveBeenCalledWith('private-user.user-xyz.notifications');
  });

  it('passes null channel when userId is null', () => {
    renderHook(() => useNotifications(null));
    expect(mockUsePusherChannel).toHaveBeenCalledWith(null);
  });

  it('prepends an incoming Pusher notification to the list', async () => {
    let capturedHandler: ((p: unknown) => void) | null = null;
    mockUsePusherEvent.mockImplementation(
      (_ch: unknown, _event: string, handler: (p: unknown) => void) => {
        capturedHandler = handler;
      },
    );

    const { result } = renderHook(() => useNotifications('u1', [NOTIF_B]));

    const incoming = {
      id: 'n-live',
      type: 'GENERAL',
      title: 'Live notification',
      body: 'From Pusher',
      createdAt: new Date().toISOString(),
    };

    act(() => {
      capturedHandler?.(incoming);
    });

    expect(result.current.notifications[0]?.id).toBe('n-live');
    expect(result.current.notifications[0]?.read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });
});
