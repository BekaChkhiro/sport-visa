// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

afterEach(cleanup);

// Stub out icons so we can test in node environment
vi.mock('@/components/icons', () => ({ BellIcon: () => <svg data-testid="bell-icon" /> }));
vi.mock('@/lib/utils', () => ({ cn: (...c: string[]) => c.filter(Boolean).join(' ') }));

import { NotificationsBell } from '@/components/notifications-bell';

describe('NotificationsBell', () => {
  it('renders with aria-label when there are no unread notifications', () => {
    render(<NotificationsBell unreadCount={0} />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('შეტყობინებები');
  });

  it('renders unread dot indicator when unreadCount > 0', () => {
    const { container } = render(<NotificationsBell unreadCount={5} />);
    // new design: a dot span (aria-hidden) instead of a numeric badge
    const dot = container.querySelector('span[aria-hidden="true"]');
    expect(dot).not.toBeNull();
  });

  it('aria-label encodes unread count when unreadCount > 0', () => {
    render(<NotificationsBell unreadCount={5} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('5');
  });

  it('aria-label encodes large unread count', () => {
    render(<NotificationsBell unreadCount={150} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('150');
  });

  it('hides dot indicator when unreadCount is 0', () => {
    const { container } = render(<NotificationsBell unreadCount={0} />);
    const dot = container.querySelector('span[aria-hidden="true"]');
    expect(dot).toBeNull();
  });

  it('calls onClick handler when clicked', () => {
    const handler = vi.fn();
    render(<NotificationsBell unreadCount={0} onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders bell icon', () => {
    render(<NotificationsBell unreadCount={0} />);
    expect(screen.getByTestId('bell-icon')).toBeDefined();
  });

  it('is a raw button element', () => {
    render(<NotificationsBell unreadCount={0} />);
    const btn = screen.getByRole('button');
    expect(btn.tagName.toLowerCase()).toBe('button');
  });
});
