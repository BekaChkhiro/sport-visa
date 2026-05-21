// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

afterEach(cleanup);

// Stub out icons and button so we can test in node environment
vi.mock('@/components/icons', () => ({ BellIcon: () => <svg data-testid="bell-icon" /> }));
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
    className?: string;
  }) => (
    <button aria-label={ariaLabel} onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));
vi.mock('@/lib/utils', () => ({ cn: (...c: string[]) => c.filter(Boolean).join(' ') }));

import { NotificationsBell } from '@/components/notifications-bell';

describe('NotificationsBell', () => {
  it('renders with aria-label when there are no unread notifications', () => {
    render(<NotificationsBell unreadCount={0} />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('შეტყობინებები');
  });

  it('renders unread count badge when unreadCount > 0', () => {
    render(<NotificationsBell unreadCount={5} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('caps badge display at 99+', () => {
    render(<NotificationsBell unreadCount={150} />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('hides badge when unreadCount is 0', () => {
    render(<NotificationsBell unreadCount={0} />);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('calls onClick handler when clicked', () => {
    const handler = vi.fn();
    render(<NotificationsBell unreadCount={0} onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
