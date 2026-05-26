// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }));
vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('@/components/icons', () => ({
  ChevronLeftIcon: () => <svg />,
  ChevronRightIcon: () => <svg />,
  CheckCircleIcon: () => <svg />,
  ClockIcon: () => <svg />,
  SearchIcon: () => <svg />,
  ShieldIcon: () => <svg />,
  XCircleIcon: () => <svg />,
}));
vi.mock('@/lib/admin/verification/actions', () => ({
  approveFootballer: vi.fn().mockResolvedValue({ status: 'success', message: 'დადასტ.' }),
  approveClub: vi.fn().mockResolvedValue({ status: 'success', message: 'დადასტ.' }),
  rejectFootballer: vi.fn().mockResolvedValue({ status: 'success', message: 'უარყ.' }),
  rejectClub: vi.fn().mockResolvedValue({ status: 'success', message: 'უარყ.' }),
}));

import { VerificationQueueClient } from '@/app/admin/verification/verification-queue-client';

type FootballerRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  positions: string[];
  city: string | null;
  nationality: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

type ClubRow = {
  id: string;
  name: string;
  email: string | null;
  league: string | null;
  city: string | null;
  country: string | null;
  logoUrl: string | null;
  createdAt: string;
};

type PageData<T> = {
  items: T[];
  total: number;
  pageCount: number;
};

const BASE_USER = { name: 'Admin', initials: 'AD', email: 'admin@test.ge' };

function makeFootballer(overrides: Partial<FootballerRow> = {}): FootballerRow {
  return {
    id: 'f-1',
    firstName: 'გიორგი',
    lastName: 'მელიქიძე',
    email: 'giorgi@test.ge',
    positions: ['მცველი'],
    city: 'თბილისი',
    nationality: 'GEO',
    avatarUrl: null,
    createdAt: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

function makeClub(overrides: Partial<ClubRow> = {}): ClubRow {
  return {
    id: 'c-1',
    name: 'FC Dila',
    email: 'dila@test.ge',
    league: 'ეროვნული ლიგა',
    city: 'გორი',
    country: 'GEO',
    logoUrl: null,
    createdAt: '2026-05-02T00:00:00Z',
    ...overrides,
  };
}

function renderClient(
  overrides: Partial<{
    tab: 'footballers' | 'clubs';
    query: string;
    sort: 'oldest' | 'newest';
    page: number;
    pageSize: number;
    counts: { footballers: number; clubs: number };
    footballerPage: PageData<FootballerRow> | null;
    clubPage: PageData<ClubRow> | null;
  }> = {},
) {
  const tab = overrides.tab ?? 'footballers';
  const footballerPage: PageData<FootballerRow> =
    overrides.footballerPage !== undefined
      ? (overrides.footballerPage as PageData<FootballerRow>)
      : { items: [makeFootballer()], total: 1, pageCount: 1 };
  const clubPage: PageData<ClubRow> =
    overrides.clubPage !== undefined
      ? (overrides.clubPage as PageData<ClubRow>)
      : { items: [makeClub()], total: 1, pageCount: 1 };

  return render(
    <VerificationQueueClient
      currentPath="/admin/verification"
      userId="admin-1"
      user={BASE_USER}
      tab={tab}
      query={overrides.query ?? ''}
      sort={overrides.sort ?? 'oldest'}
      page={overrides.page ?? 1}
      pageSize={overrides.pageSize ?? 20}
      counts={overrides.counts ?? { footballers: 3, clubs: 2 }}
      footballerPage={footballerPage}
      clubPage={clubPage}
    />,
  );
}

describe('VerificationQueueClient — heading', () => {
  it("renders h1 'ვერიფიკაციის რიგი'", () => {
    renderClient();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('ვერიფიკაციის რიგი')).toBeDefined();
  });

  it("renders subtitle containing 'ფეხბურთელებისა'", () => {
    renderClient();
    expect(screen.getByText(/ფეხბურთელებისა/)).toBeDefined();
  });
});

describe('VerificationQueueClient — tabs', () => {
  it("renders 'ფეხბურთელები' tab and 'კლუბები' tab", () => {
    renderClient();
    expect(screen.getByRole('tab', { name: /ფეხბურთელები/ })).toBeDefined();
    expect(screen.getByRole('tab', { name: /კლუბები/ })).toBeDefined();
  });

  it("footballers tab is aria-selected=true when tab='footballers'", () => {
    renderClient({ tab: 'footballers' });
    const tab = screen.getByRole('tab', { name: /ფეხბურთელები/ });
    expect(tab.getAttribute('aria-selected')).toBe('true');
  });

  it("clubs tab is aria-selected=true when tab='clubs'", () => {
    renderClient({ tab: 'clubs' });
    const tab = screen.getByRole('tab', { name: /კლუბები/ });
    expect(tab.getAttribute('aria-selected')).toBe('true');
  });

  it('tabs show pending counts in badge (counts.footballers, counts.clubs)', () => {
    renderClient({ counts: { footballers: 7, clubs: 4 } });
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
  });
});

describe("VerificationQueueClient — footballer cards (tab='footballers')", () => {
  it('renders footballer full name (firstName + lastName)', () => {
    renderClient({
      tab: 'footballers',
      footballerPage: {
        items: [makeFootballer({ firstName: 'ნინო', lastName: 'ბაქრაძე' })],
        total: 1,
        pageCount: 1,
      },
    });
    expect(screen.getByText('ნინო ბაქრაძე')).toBeDefined();
  });

  it('renders footballer email', () => {
    renderClient({
      tab: 'footballers',
      footballerPage: {
        items: [makeFootballer({ email: 'nino@test.ge' })],
        total: 1,
        pageCount: 1,
      },
    });
    expect(screen.getByText('nino@test.ge')).toBeDefined();
  });

  it("renders 'დადასტ.' (approve) button", () => {
    renderClient({ tab: 'footballers' });
    expect(screen.getByRole('button', { name: /დადასტ\./ })).toBeDefined();
  });

  it("renders 'უარყ.' (reject) button", () => {
    renderClient({ tab: 'footballers' });
    expect(screen.getByRole('button', { name: /უარყ\./ })).toBeDefined();
  });

  it("shows meta: position, city, nationality separated by '·'", () => {
    renderClient({
      tab: 'footballers',
      footballerPage: {
        items: [makeFootballer({ positions: ['მცველი'], city: 'თბილისი', nationality: 'GEO' })],
        total: 1,
        pageCount: 1,
      },
    });
    expect(screen.getByText('მცველი · თბილისი · GEO')).toBeDefined();
  });
});

describe("VerificationQueueClient — club cards (tab='clubs')", () => {
  it('renders club name', () => {
    renderClient({
      tab: 'clubs',
      clubPage: { items: [makeClub({ name: 'FC Locomotive' })], total: 1, pageCount: 1 },
    });
    expect(screen.getByText('FC Locomotive')).toBeDefined();
  });

  it('renders club email', () => {
    renderClient({
      tab: 'clubs',
      clubPage: { items: [makeClub({ email: 'loco@test.ge' })], total: 1, pageCount: 1 },
    });
    expect(screen.getByText('loco@test.ge')).toBeDefined();
  });

  it('renders approve button', () => {
    renderClient({ tab: 'clubs' });
    expect(screen.getByRole('button', { name: /დადასტ\./ })).toBeDefined();
  });

  it('renders reject button', () => {
    renderClient({ tab: 'clubs' });
    expect(screen.getByRole('button', { name: /უარყ\./ })).toBeDefined();
  });

  it('shows meta when league/city/country present', () => {
    renderClient({
      tab: 'clubs',
      clubPage: {
        items: [makeClub({ league: 'ეროვნული ლიგა', city: 'გორი', country: 'GEO' })],
        total: 1,
        pageCount: 1,
      },
    });
    expect(screen.getByText('ეროვნული ლიგა · გორი · GEO')).toBeDefined();
  });
});

describe('VerificationQueueClient — reject dialog', () => {
  it("clicking reject on footballer opens dialog with title 'უარყოფის მიზეზი'", () => {
    renderClient({ tab: 'footballers' });
    const rejectBtn = screen.getByRole('button', { name: /უარყ\./ });
    fireEvent.click(rejectBtn);
    expect(screen.getByText('უარყოფის მიზეზი')).toBeDefined();
  });

  it('submit button is disabled when reason is empty', () => {
    renderClient({ tab: 'footballers' });
    const rejectBtn = screen.getByRole('button', { name: /უარყ\./ });
    fireEvent.click(rejectBtn);
    const submitBtn = screen.getByRole('button', { name: 'უარყოფა' });
    expect(submitBtn.getAttribute('disabled')).not.toBeNull();
  });

  it('cancel button present', () => {
    renderClient({ tab: 'footballers' });
    const rejectBtn = screen.getByRole('button', { name: /უარყ\./ });
    fireEvent.click(rejectBtn);
    expect(screen.getByRole('button', { name: 'გაუქმება' })).toBeDefined();
  });
});

describe('VerificationQueueClient — empty states', () => {
  it("shows 'მოლოდინში არ არის' when footballers tab and empty items", () => {
    renderClient({
      tab: 'footballers',
      query: '',
      footballerPage: { items: [], total: 0, pageCount: 1 },
    });
    expect(screen.getByText('მოლოდინში არ არის')).toBeDefined();
  });

  it("shows 'ვერ მოიძებნა' when footballers tab, empty items, and query given", () => {
    renderClient({
      tab: 'footballers',
      query: 'ნინო',
      footballerPage: { items: [], total: 0, pageCount: 1 },
    });
    expect(screen.getByText('ვერ მოიძებნა')).toBeDefined();
  });

  it("shows 'მოლოდინში არ არის' when clubs tab and empty items", () => {
    renderClient({
      tab: 'clubs',
      query: '',
      clubPage: { items: [], total: 0, pageCount: 1 },
    });
    expect(screen.getByText('მოლოდინში არ არის')).toBeDefined();
  });
});

describe('VerificationQueueClient — pagination', () => {
  it('no pagination when pageCount=1', () => {
    renderClient({
      tab: 'footballers',
      footballerPage: { items: [makeFootballer()], total: 1, pageCount: 1 },
    });
    expect(screen.queryByRole('navigation', { name: 'გვერდები' })).toBeNull();
  });

  it("shows pagination nav 'გვერდები' when pageCount > 1", () => {
    renderClient({
      tab: 'footballers',
      footballerPage: { items: [makeFootballer()], total: 40, pageCount: 2 },
    });
    expect(screen.getByRole('navigation', { name: 'გვერდები' })).toBeDefined();
  });
});
