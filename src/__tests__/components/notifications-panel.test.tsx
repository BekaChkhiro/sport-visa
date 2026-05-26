// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

afterEach(cleanup);

vi.mock('@/components/icons', () => ({
  BellIcon: () => <svg data-testid="bell-icon" />,
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

vi.mock('@/components/notifications-bell', () => ({
  NotificationsBell: ({ unreadCount }: { unreadCount: number }) => (
    <button data-testid="notifications-bell" data-unread={unreadCount}>
      Bell
    </button>
  ),
}));

// Inline Popover — render trigger + content together for simplicity.
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/format-relative-time', () => ({
  formatRelativeTime: () => '2 საათის წინ',
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

import { NotificationsPanel } from '@/components/notifications-panel';
import type { NotificationItem } from '@/hooks/use-notifications';

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'GENERAL',
    title: 'კლუბმა გამოაქვეყნა სიახლე',
    body: 'FC Dili-მ გამოაქვეყნა ახალი პოსტი.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'n2',
    type: 'GENERAL',
    title: 'წაკითხული შეტყობინება',
    body: 'ეს უკვე წაკითხულია.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const noop = () => undefined;

describe('NotificationsPanel', () => {
  it('renders the bell trigger', () => {
    render(
      <NotificationsPanel
        notifications={[]}
        unreadCount={0}
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    expect(screen.getByTestId('notifications-bell')).toBeTruthy();
  });

  it('shows empty state when there are no notifications', () => {
    render(
      <NotificationsPanel
        notifications={[]}
        unreadCount={0}
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    expect(screen.getByText('შეტყობინება არ არის')).toBeTruthy();
  });

  it('shows loading state', () => {
    render(
      <NotificationsPanel
        notifications={[]}
        unreadCount={0}
        loading
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    expect(screen.getByText('იტვირთება…')).toBeTruthy();
  });

  it('renders notification items', () => {
    render(
      <NotificationsPanel
        notifications={SAMPLE_NOTIFICATIONS}
        unreadCount={1}
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    expect(screen.getByText('კლუბმა გამოაქვეყნა სიახლე')).toBeTruthy();
    expect(screen.getByText('FC Dili-მ გამოაქვეყნა ახალი პოსტი.')).toBeTruthy();
    expect(screen.getByText('წაკითხული შეტყობინება')).toBeTruthy();
  });

  it('shows "mark all read" button only when unreadCount > 0', () => {
    const { rerender } = render(
      <NotificationsPanel
        notifications={SAMPLE_NOTIFICATIONS}
        unreadCount={0}
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    expect(screen.queryByText('ყველა წაკითხულად')).toBeNull();

    rerender(
      <NotificationsPanel
        notifications={SAMPLE_NOTIFICATIONS}
        unreadCount={1}
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    expect(screen.getByText('ყველა წაკითხულად')).toBeTruthy();
  });

  it('calls onMarkAllRead when "mark all read" button is clicked', () => {
    const handler = vi.fn();
    render(
      <NotificationsPanel
        notifications={SAMPLE_NOTIFICATIONS}
        unreadCount={1}
        onMarkRead={noop}
        onMarkAllRead={handler}
      />,
    );
    fireEvent.click(screen.getByText('ყველა წაკითხულად'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('calls onMarkRead with the notification id', () => {
    const handler = vi.fn();
    render(
      <NotificationsPanel
        notifications={SAMPLE_NOTIFICATIONS}
        unreadCount={1}
        onMarkRead={handler}
        onMarkAllRead={noop}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(handler).toHaveBeenCalledWith('n1');
  });

  it('renders a "view all" link to /notifications', () => {
    render(
      <NotificationsPanel
        notifications={[]}
        unreadCount={0}
        onMarkRead={noop}
        onMarkAllRead={noop}
      />,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/notifications');
  });
});
