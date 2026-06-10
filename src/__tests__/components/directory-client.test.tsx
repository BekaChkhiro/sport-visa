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

import { DirectoryClient } from '@/app/directory/directory-client';
import { DEFAULT_FILTERS } from '@/lib/directory/filters';
import { toggleShortlist } from '@/lib/directory/actions';

const toggleShortlistMock = vi.mocked(toggleShortlist);

const baseUser = {
  name: 'FC Dila',
  initials: 'FD',
  verificationStatus: 'verified' as const,
};

function makeFootballer(
  overrides: Partial<{
    id: string;
    name: string;
    position: string;
    nationality: string;
    isShortlisted: boolean;
  }> = {},
) {
  return {
    id: 'fb1',
    name: 'Giorgi Mikhelidze',
    position: 'CM',
    nationality: 'GEO',
    verificationStatus: 'verified' as const,
    isShortlisted: false,
    ...overrides,
  };
}

function renderDirectory(
  items: ReturnType<typeof makeFootballer>[] = [makeFootballer()],
  extra: Partial<{
    total: number;
    page: number;
    pageSize: number;
    view: 'grid' | 'list';
  }> = {},
) {
  return render(
    <DirectoryClient
      currentPath="/directory"
      user={baseUser}
      unreadNotifications={0}
      items={items}
      total={extra.total ?? items.length}
      page={extra.page ?? 1}
      pageSize={extra.pageSize ?? 20}
      sort="newest"
      view={extra.view ?? 'grid'}
      initialFilters={DEFAULT_FILTERS}
    />,
  );
}

describe('DirectoryClient — rendering', () => {
  it('renders total result count', () => {
    renderDirectory([makeFootballer()]);
    // The count digit lives in its own <span>, so match on the parent's full text.
    const counter = screen.getByText(/ფეხბურთელი მოიძებნა/);
    expect(counter.textContent?.replace(/\s+/g, ' ')).toContain('1 ფეხბურთელი მოიძებნა');
  });

  it('renders footballer names in grid view', () => {
    renderDirectory([makeFootballer({ name: 'Giorgi Mikhelidze' })]);
    expect(screen.getByText('Giorgi Mikhelidze')).toBeDefined();
  });

  it('renders footballer names in list view', () => {
    renderDirectory([makeFootballer({ name: 'Lasha Beridze' })], { view: 'list' });
    expect(screen.getByText('Lasha Beridze')).toBeDefined();
  });

  it('renders empty state when no items', () => {
    renderDirectory([]);
    expect(screen.getByText('ფეხბ. ვერ მოიძებნა')).toBeDefined();
  });

  it('renders sort select', () => {
    renderDirectory();
    expect(screen.getByLabelText('სორტირება')).toBeDefined();
  });

  it('renders grid and list view toggle buttons', () => {
    renderDirectory();
    expect(screen.getByLabelText('Grid ხედი')).toBeDefined();
    expect(screen.getByLabelText('List ხედი')).toBeDefined();
  });

  it('renders mobile filter button', () => {
    renderDirectory();
    expect(screen.getByLabelText(/ფილტრები/)).toBeDefined();
  });

  it('shows active filter count badge when filters are applied', () => {
    render(
      <DirectoryClient
        currentPath="/directory"
        user={baseUser}
        unreadNotifications={0}
        items={[makeFootballer()]}
        total={1}
        page={1}
        pageSize={20}
        sort="newest"
        view="grid"
        initialFilters={{ ...DEFAULT_FILTERS, positions: ['CM'] }}
      />,
    );
    expect(screen.getByLabelText('ფილტრები (1)')).toBeDefined();
  });
});

describe('DirectoryClient — pagination', () => {
  it('renders pagination nav when total exceeds page size', () => {
    renderDirectory([makeFootballer()], { total: 25, pageSize: 10, page: 1 });
    expect(screen.getByLabelText('პაგინაცია')).toBeDefined();
  });

  it('does not render pagination when all results fit on one page', () => {
    renderDirectory([makeFootballer()], { total: 5, pageSize: 10, page: 1 });
    expect(screen.queryByLabelText('პაგინაცია')).toBeNull();
  });

  it('previous page button is disabled on page 1', () => {
    renderDirectory([makeFootballer()], { total: 25, pageSize: 10, page: 1 });
    const prevBtn = screen.getByLabelText('წინა გვერდი') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('next page button is disabled on last page', () => {
    renderDirectory([makeFootballer()], { total: 25, pageSize: 10, page: 3 });
    const nextBtn = screen.getByLabelText('შემდეგი გვერდი') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });
});

describe('DirectoryClient — shortlist toggle (grid view)', () => {
  it('shows save button when footballer is not shortlisted', () => {
    renderDirectory([makeFootballer({ isShortlisted: false })]);
    const btn = screen.getByRole('button', { name: /შენახვა/i });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows remove button when footballer is shortlisted', () => {
    renderDirectory([makeFootballer({ isShortlisted: true })]);
    const btn = screen.getByRole('button', { name: /ჩამოშორება/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('applies optimistic shortlist update on click', () => {
    let resolve: (v: { status: 'success'; shortlisted: boolean }) => void;
    const pending = new Promise<{ status: 'success'; shortlisted: boolean }>((r) => {
      resolve = r;
    });
    toggleShortlistMock.mockReturnValueOnce(pending);

    renderDirectory([makeFootballer({ isShortlisted: false })]);
    fireEvent.click(screen.getByRole('button', { name: /შენახვა/i }));

    expect(screen.queryAllByRole('button', { name: /ჩამოშორება/i }).length).toBeGreaterThan(0);
    resolve!({ status: 'success', shortlisted: true });
  });

  it('reverts optimistic update on server error', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'error', message: 'failed' });

    renderDirectory([makeFootballer({ isShortlisted: false })]);
    fireEvent.click(screen.getByRole('button', { name: /შენახვა/i }));

    await waitFor(() => {
      expect(screen.queryAllByRole('button', { name: /შენახვა/i }).length).toBeGreaterThan(0);
    });
  });

  it('calls toggleShortlist with footballer id', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'success', shortlisted: true });

    renderDirectory([makeFootballer({ id: 'fb99', isShortlisted: false })]);
    fireEvent.click(screen.getByRole('button', { name: /შენახვა/i }));

    expect(toggleShortlistMock).toHaveBeenCalledWith('fb99');
  });
});

describe('DirectoryClient — shortlist toggle (list view)', () => {
  it('shows save button in list view when not shortlisted', () => {
    renderDirectory([makeFootballer({ isShortlisted: false })], { view: 'list' });
    const btn = screen.getByRole('button', { name: /შენახვა/i });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows remove button in list view when shortlisted', () => {
    renderDirectory([makeFootballer({ isShortlisted: true })], { view: 'list' });
    const btn = screen.getByRole('button', { name: /ჩამოშორება/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });
});
