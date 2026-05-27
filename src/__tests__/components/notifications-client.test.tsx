// @vitest-environment happy-dom
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn().mockResolvedValue(undefined) }));

vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock('@/components/icons', () => ({
  BellIcon: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className} />
  ),
  CheckCircleIcon: () => <svg data-testid="check-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
  }) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/lib/format-relative-time', () => ({
  formatRelativeTime: () => '1 საათის წინ',
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

const mockUseNotifications = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    notifications: [],
    unreadCount: 0,
    loading: false,
    markRead: vi.fn().mockResolvedValue(undefined),
    markAllRead: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn(),
  }),
);

vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: mockUseNotifications,
}));

import { NotificationsClient } from '@/app/notifications/notifications-client';
import type { NotificationItem } from '@/hooks/use-notifications';

const BASE_USER = { name: 'Ana K', initials: 'AK' };

const UNREAD_NOTIF: NotificationItem = {
  id: 'n1',
  type: 'GENERAL',
  title: 'ახალი სიახლე',
  body: 'FC Dili-მ გამოაქვეყნა.',
  read: false,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

const READ_NOTIF: NotificationItem = {
  id: 'n2',
  type: 'GENERAL',
  title: 'ძველი შეტყობინება',
  body: 'ეს წაკითხულია.',
  read: true,
  createdAt: new Date(Date.now() - 86400000).toISOString(),
};

function renderClient(
  overrides: Partial<{
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
  }> = {},
) {
  const mockValues = {
    notifications: overrides.notifications ?? [],
    unreadCount: overrides.unreadCount ?? 0,
    loading: overrides.loading ?? false,
    markRead: vi.fn().mockResolvedValue(undefined),
    markAllRead: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn(),
  };
  mockUseNotifications.mockReturnValue(mockValues);

  return {
    ...render(
      <NotificationsClient
        shellRole="footballer"
        shellUser={BASE_USER}
        userId="u1"
        unreadNotifications={0}
        initialNotifications={[]}
      />,
    ),
    mockValues,
  };
}

describe('NotificationsClient — page heading', () => {
  it('renders the page heading', () => {
    renderClient();
    expect(screen.getByText('შეტყობინებები')).toBeTruthy();
  });

  it('shows unread count subtitle when unreadCount > 0', () => {
    renderClient({ unreadCount: 3 });
    expect(screen.getByText('3 წაუკითხავი')).toBeTruthy();
  });

  it('hides unread count subtitle when unreadCount is 0', () => {
    renderClient({ unreadCount: 0 });
    expect(screen.queryByText('0 წაუკითხავი')).toBeNull();
  });
});

describe('NotificationsClient — loading state', () => {
  it('shows loading indicator when loading is true', () => {
    renderClient({ loading: true });
    expect(screen.getByText('იტვირთება…')).toBeTruthy();
  });

  it('hides loading indicator when loading is false', () => {
    renderClient({ loading: false });
    expect(screen.queryByText('იტვირთება…')).toBeNull();
  });
});

describe('NotificationsClient — empty state', () => {
  it('shows empty state when notifications list is empty and not loading', () => {
    renderClient({ notifications: [], loading: false });
    expect(screen.getByText('შეტყობინება არ არის')).toBeTruthy();
  });

  it('does not show empty state when there are notifications', () => {
    renderClient({ notifications: [UNREAD_NOTIF] });
    expect(screen.queryByText('შეტყობინება არ არის')).toBeNull();
  });
});

describe('NotificationsClient — notification list', () => {
  it('renders notification title and body', () => {
    renderClient({ notifications: [UNREAD_NOTIF] });
    expect(screen.getByText('ახალი სიახლე')).toBeTruthy();
    expect(screen.getByText('FC Dili-მ გამოაქვეყნა.')).toBeTruthy();
  });

  it('renders both unread and read notifications', () => {
    renderClient({ notifications: [UNREAD_NOTIF, READ_NOTIF] });
    expect(screen.getByText('ახალი სიახლე')).toBeTruthy();
    expect(screen.getByText('ძველი შეტყობინება')).toBeTruthy();
  });

  it('shows mark-as-read button only for unread notifications', () => {
    renderClient({ notifications: [UNREAD_NOTIF, READ_NOTIF], unreadCount: 1 });
    // Only one mark-as-read button (for the unread notification)
    const btns = screen.getAllByRole('button', { name: 'წაკითხულად მონიშვნა' });
    expect(btns).toHaveLength(1);
  });
});

describe('NotificationsClient — mark all read', () => {
  it('shows "mark all read" button when unreadCount > 0', () => {
    renderClient({ notifications: [UNREAD_NOTIF], unreadCount: 1 });
    expect(screen.getByText('ყველა წაკითხულად')).toBeTruthy();
  });

  it('hides "mark all read" button when unreadCount is 0', () => {
    renderClient({ notifications: [READ_NOTIF], unreadCount: 0 });
    expect(screen.queryByText('ყველა წაკითხულად')).toBeNull();
  });

  it('calls markAllRead when button is clicked', () => {
    const { mockValues } = renderClient({ notifications: [UNREAD_NOTIF], unreadCount: 1 });
    fireEvent.click(screen.getByText('ყველა წაკითხულად'));
    expect(mockValues.markAllRead).toHaveBeenCalledOnce();
  });
});

describe('NotificationsClient — mark single read', () => {
  it('calls markRead with the notification id', () => {
    const { mockValues } = renderClient({ notifications: [UNREAD_NOTIF], unreadCount: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'წაკითხულად მონიშვნა' }));
    expect(mockValues.markRead).toHaveBeenCalledWith('n1');
  });
});

describe('NotificationsClient — initialNotifications forwarded to hook', () => {
  it('passes initialNotifications to useNotifications', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [UNREAD_NOTIF],
      unreadCount: 1,
      loading: false,
      markRead: vi.fn().mockResolvedValue(undefined),
      markAllRead: vi.fn().mockResolvedValue(undefined),
      refresh: vi.fn(),
    });

    render(
      <NotificationsClient
        shellRole="footballer"
        shellUser={BASE_USER}
        userId="u1"
        unreadNotifications={1}
        initialNotifications={[UNREAD_NOTIF]}
      />,
    );

    expect(mockUseNotifications).toHaveBeenCalledWith('u1', [UNREAD_NOTIF]);
  });
});
