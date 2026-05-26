// @vitest-environment happy-dom
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

afterEach(cleanup);

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar">{children}</span>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

vi.mock('@/lib/format-relative-time', () => ({
  formatRelativeTime: () => '2 საათის წინ',
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

import { ChatListItem } from '@/components/chat-list-item';

const BASE = {
  conversationId: 'conv-1',
  name: 'FC Dila Gori',
  unreadCount: 0,
};

describe('ChatListItem — basic display', () => {
  it('renders the conversation partner name', () => {
    render(<ChatListItem {...BASE} />);
    expect(screen.getByText('FC Dila Gori')).toBeTruthy();
  });

  it('renders initials in the fallback', () => {
    render(<ChatListItem {...BASE} />);
    expect(screen.getByTestId('avatar-fallback').textContent).toBe('FC');
  });

  it('renders an avatar image when avatarUrl is provided', () => {
    render(<ChatListItem {...BASE} avatarUrl="https://cdn/logo.png" />);
    expect(screen.getByTestId('avatar-image').getAttribute('src')).toBe('https://cdn/logo.png');
  });
});

describe('ChatListItem — last message preview', () => {
  it('renders the last message body when provided', () => {
    render(<ChatListItem {...BASE} lastMessage="გამარჯობა" />);
    expect(screen.getByText('გამარჯობა')).toBeTruthy();
  });

  it('shows the empty placeholder when no last message exists', () => {
    render(<ChatListItem {...BASE} />);
    expect(screen.getByText('ჯერ შეტყობინებების გარეშე')).toBeTruthy();
  });

  it('renders the formatted relative time when lastMessageAt is provided', () => {
    render(<ChatListItem {...BASE} lastMessageAt={new Date('2026-05-26T08:00:00Z')} />);
    expect(screen.getByText('2 საათის წინ')).toBeTruthy();
  });
});

describe('ChatListItem — unread counter badge', () => {
  it('does not render a badge when unreadCount is 0', () => {
    const { container } = render(<ChatListItem {...BASE} />);
    expect(container.querySelector('.rounded-full')).toBeNull();
  });

  it('renders the exact count for 1..9 unread messages', () => {
    render(<ChatListItem {...BASE} unreadCount={3} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('caps the badge at 9+ for very high unread counts', () => {
    render(<ChatListItem {...BASE} unreadCount={42} />);
    expect(screen.getByText('9+')).toBeTruthy();
  });
});

describe('ChatListItem — interaction and a11y', () => {
  it('invokes onClick with the conversation id', () => {
    const onClick = vi.fn();
    render(<ChatListItem {...BASE} onClick={onClick} />);
    fireEvent.click(screen.getByRole('option'));
    expect(onClick).toHaveBeenCalledWith('conv-1');
  });

  it('reflects active state via aria-selected', () => {
    render(<ChatListItem {...BASE} isActive />);
    expect(screen.getByRole('option').getAttribute('aria-selected')).toBe('true');
  });

  it('is rendered as a button with role=option', () => {
    render(<ChatListItem {...BASE} />);
    const btn = screen.getByRole('option');
    expect(btn.tagName).toBe('BUTTON');
  });
});
