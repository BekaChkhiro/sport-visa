// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }));
vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));
vi.mock('@/lib/directory/actions', () => ({
  toggleShortlist: vi.fn(),
}));

import { ShortlistClient } from '@/app/shortlist/shortlist-client';
import { toggleShortlist } from '@/lib/directory/actions';

const toggleShortlistMock = vi.mocked(toggleShortlist);

const baseUser = {
  name: 'FC Dila',
  initials: 'FD',
  verificationStatus: 'verified' as const,
};

function makeItem(
  overrides: Partial<{
    id: string;
    shortlistEntryId: string;
    firstName: string;
    lastName: string;
  }> = {},
) {
  return {
    shortlistEntryId: 'sl1',
    id: 'fb1',
    firstName: 'Giorgi',
    lastName: 'Mikhelidze',
    positions: ['CM'],
    verificationStatus: 'verified' as const,
    shortlistedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderShortlist(items: ReturnType<typeof makeItem>[] = [makeItem()]) {
  return render(
    <ShortlistClient
      currentPath="/shortlist"
      user={baseUser}
      unreadNotifications={0}
      items={items}
    />,
  );
}

describe('ShortlistClient — rendering', () => {
  it('renders footballer full name in shortlist row', () => {
    renderShortlist([makeItem({ firstName: 'Giorgi', lastName: 'Mikhelidze' })]);
    expect(screen.getByText('Giorgi Mikhelidze')).toBeDefined();
  });

  it('renders profile link for each item', () => {
    const { container } = renderShortlist([makeItem({ id: 'fb1' })]);
    expect(container.querySelector('a[href="/directory/fb1"]')).not.toBeNull();
  });

  it('renders remove button for each item', () => {
    renderShortlist([makeItem()]);
    expect(screen.getByLabelText('სიიდან ამოშლა')).toBeDefined();
  });

  it('renders item count in heading', () => {
    renderShortlist([
      makeItem({ id: 'fb1', shortlistEntryId: 'sl1' }),
      makeItem({ id: 'fb2', shortlistEntryId: 'sl2' }),
    ]);
    expect(screen.getByText(/2 ფეხბ/)).toBeDefined();
  });

  it('renders empty state when no items', () => {
    renderShortlist([]);
    expect(screen.getByText('შ. სია ცარიელია')).toBeDefined();
  });

  it('renders directory link button', () => {
    const { container } = renderShortlist();
    expect(container.querySelector('a[href="/directory"]')).not.toBeNull();
  });

  it('renders back link to club dashboard', () => {
    const { container } = renderShortlist();
    expect(container.querySelector('a[href="/dashboard/club"]')).not.toBeNull();
  });

  it('renders page heading', () => {
    renderShortlist();
    expect(screen.getByText('შერჩეული ფეხბურთელები')).toBeDefined();
  });
});

describe('ShortlistClient — remove interaction', () => {
  it('calls toggleShortlist with footballer id when remove clicked', () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'success', shortlisted: false });
    renderShortlist([makeItem({ id: 'fb99' })]);
    fireEvent.click(screen.getByLabelText('სიიდან ამოშლა'));
    expect(toggleShortlistMock).toHaveBeenCalledWith('fb99');
  });

  it('removes item from list on successful removal', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'success', shortlisted: false });
    renderShortlist([makeItem({ firstName: 'Giorgi', lastName: 'Mikhelidze' })]);
    fireEvent.click(screen.getByLabelText('სიიდან ამოშლა'));

    await waitFor(() => {
      expect(screen.queryByText('Giorgi Mikhelidze')).toBeNull();
    });
  });

  it('shows success toast after removal', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'success', shortlisted: false });
    renderShortlist([makeItem()]);
    fireEvent.click(screen.getByLabelText('სიიდან ამოშლა'));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByRole('status').textContent).toContain('სიიდან ამოიშალა');
    });
  });

  it('shows error toast on removal failure', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'error', message: 'ვერ ამოიშალა' });
    renderShortlist([makeItem()]);
    fireEvent.click(screen.getByLabelText('სიიდან ამოშლა'));

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain('ვერ ამოიშალა');
    });
  });

  it('keeps item in list when removal fails', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'error', message: 'ვერ ამოიშალა' });
    renderShortlist([makeItem({ firstName: 'Giorgi', lastName: 'Mikhelidze' })]);
    fireEvent.click(screen.getByLabelText('სიიდან ამოშლა'));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeDefined();
    });
    expect(screen.getByText('Giorgi Mikhelidze')).toBeDefined();
  });
});
