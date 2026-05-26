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

vi.mock('@/components/profile-avatar', () => ({
  ProfileAvatar: ({ fallback }: { fallback: string }) => (
    <span data-testid="avatar">{fallback}</span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => {
    if (asChild && React.isValidElement(children)) return children;
    return <button>{children}</button>;
  },
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({
    title,
    description,
    action,
  }: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
      {action ?? null}
    </div>
  ),
}));

vi.mock('@/components/icons', () => ({
  MessageCircleIcon: () => <svg data-testid="msg-icon" />,
  SearchIcon: ({ className }: { className?: string }) => (
    <svg data-testid="search-icon" data-class={className} />
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

import { ChatsClient } from '@/app/chats/chats-client';

const BASE_USER = { name: 'FC Dila', initials: 'FD' };

const CONV_A = {
  id: 'conv-a',
  otherName: 'Giorgi Mikheladze',
  otherInitials: 'GM',
  lastMessageBody: 'მესიჯი ერთი',
  lastMessageAt: new Date('2026-05-26T10:00:00Z').toISOString(),
  unreadCount: 2,
};

const CONV_B = {
  id: 'conv-b',
  otherName: 'Lasha Tsereteli',
  otherInitials: 'LT',
  lastMessageBody: null,
  lastMessageAt: new Date('2026-05-26T09:00:00Z').toISOString(),
  unreadCount: 0,
};

function renderClient(props: Partial<React.ComponentProps<typeof ChatsClient>> = {}) {
  const defaultProps = {
    currentPath: '/chats',
    userId: 'club-user',
    role: 'club' as const,
    user: BASE_USER,
    unreadNotifications: 0,
    conversations: [CONV_A, CONV_B],
  };
  return render(<ChatsClient {...defaultProps} {...props} />);
}

describe('ChatsClient — list rendering', () => {
  it('renders the page heading', () => {
    renderClient();
    expect(screen.getByRole('heading', { name: 'ჩატები' })).toBeTruthy();
  });

  it('shows the conversation count', () => {
    renderClient();
    expect(screen.getByText('2 საუბარი')).toBeTruthy();
  });

  it('renders one row per conversation', () => {
    renderClient();
    expect(screen.getByText('Giorgi Mikheladze')).toBeTruthy();
    expect(screen.getByText('Lasha Tsereteli')).toBeTruthy();
  });

  it('links each row to /chat/<id>', () => {
    renderClient();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/chat/conv-a');
    expect(hrefs).toContain('/chat/conv-b');
  });

  it('renders the last-message preview when present', () => {
    renderClient();
    expect(screen.getByText('მესიჯი ერთი')).toBeTruthy();
  });

  it('truncates a long preview to ~60 chars + ellipsis', () => {
    const long = 'x'.repeat(120);
    renderClient({
      conversations: [{ ...CONV_A, lastMessageBody: long }],
    });
    expect(screen.getByText(/x{60}…/)).toBeTruthy();
  });

  it('renders the unread badge when there are unread messages', () => {
    renderClient();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('caps the unread badge at 99+', () => {
    renderClient({ conversations: [{ ...CONV_A, unreadCount: 150 }] });
    expect(screen.getByText('99+')).toBeTruthy();
  });
});

describe('ChatsClient — search filter', () => {
  it('filters the list by name (case-insensitive)', () => {
    renderClient();
    const input = screen.getByPlaceholderText('საუბრის ძიება…');
    fireEvent.change(input, { target: { value: 'lasha' } });
    expect(screen.queryByText('Giorgi Mikheladze')).toBeNull();
    expect(screen.getByText('Lasha Tsereteli')).toBeTruthy();
  });

  it('shows "no results" message when the filter matches nothing', () => {
    renderClient();
    const input = screen.getByPlaceholderText('საუბრის ძიება…');
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByText('ამ სახელით საუბარი ვერ მოიძებნა.')).toBeTruthy();
  });
});

describe('ChatsClient — empty state', () => {
  it('renders the club-flavoured empty state with a directory CTA', () => {
    renderClient({ conversations: [], role: 'club' });
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText('ჯერ ჩატი არ გაქვს')).toBeTruthy();
    const directoryLink = screen
      .getAllByRole('link')
      .find((l) => l.getAttribute('href') === '/directory');
    expect(directoryLink).toBeTruthy();
  });

  it('renders the footballer-flavoured empty state without a CTA', () => {
    renderClient({
      conversations: [],
      role: 'footballer',
      user: { name: 'Giorgi M.', initials: 'GM' },
    });
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText(/კლუბები ინიციირებენ საუბარს/)).toBeTruthy();
    // No directory CTA for footballers.
    const directoryLink = screen
      .queryAllByRole('link')
      .find((l) => l.getAttribute('href') === '/directory');
    expect(directoryLink).toBeFalsy();
  });

  it('does not render the search box when there are no conversations', () => {
    renderClient({ conversations: [] });
    expect(screen.queryByPlaceholderText('საუბრის ძიება…')).toBeNull();
  });
});
