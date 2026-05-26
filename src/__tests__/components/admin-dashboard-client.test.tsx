// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }));
vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));
vi.mock('@/components/icons', () => ({
  UsersIcon: () => <svg data-testid="users-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-circle-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
  AlertCircleIcon: () => <svg data-testid="alert-circle-icon" />,
  ArrowRightIcon: () => <svg data-testid="arrow-right-icon" />,
  ShieldIcon: () => <svg data-testid="shield-icon" />,
}));
vi.mock('@/lib/format-relative-time', () => ({
  formatRelativeTime: () => '1 წ. წინ',
}));

import { AdminDashboardClient } from '@/app/admin/admin-dashboard-client';

const BASE_USER = { name: 'Admin User', initials: 'AU', email: 'admin@example.com' };

const BASE_KPI = {
  totalUsers: 150,
  pendingFootballers: 14,
  pendingClubs: 3,
  pendingServiceRequests: 8,
  verifiedFootballers: 120,
  verifiedClubs: 35,
};

const BASE_FOOTBALLERS = [
  {
    id: 'f1',
    firstName: 'გიორგი',
    lastName: 'მელიქიძე',
    email: 'g@test.ge',
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'f2',
    firstName: 'ნინო',
    lastName: 'ბაქრაძე',
    email: 'n@test.ge',
    createdAt: '2026-05-02T00:00:00Z',
  },
];

const BASE_CLUBS = [
  { id: 'c1', name: 'FC Dila', email: 'fc@dila.ge', createdAt: '2026-05-01T00:00:00Z' },
];

const BASE_SERVICE_REQUESTS = [
  {
    id: 'sr1',
    requestCode: 'SR-2026-0042',
    categoryName: 'კვება',
    email: 'user@test.ge',
    createdAt: '2026-05-18T00:00:00Z',
  },
];

function renderDashboard(overrides: Partial<Parameters<typeof AdminDashboardClient>[0]> = {}) {
  return render(
    <AdminDashboardClient
      currentPath="/admin"
      userId="admin-1"
      user={BASE_USER}
      kpi={BASE_KPI}
      recentPendingFootballers={BASE_FOOTBALLERS}
      recentPendingClubs={BASE_CLUBS}
      recentServiceRequests={BASE_SERVICE_REQUESTS}
      {...overrides}
    />,
  );
}

describe('AdminDashboardClient — KPI cards', () => {
  it('renders the AppShell wrapper', () => {
    renderDashboard();
    expect(screen.getByTestId('app-shell')).toBeDefined();
  });

  it('renders page heading', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('Admin Dashboard')).toBeDefined();
  });

  it('renders total users KPI value', () => {
    renderDashboard();
    expect(screen.getByText('150')).toBeDefined();
  });

  it('renders pending footballers count', () => {
    renderDashboard();
    // value appears in KPI card and in section badge — use getAllByText
    expect(screen.getAllByText('14').length).toBeGreaterThanOrEqual(1);
  });

  it('renders pending clubs count', () => {
    renderDashboard();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('renders verified footballers count', () => {
    renderDashboard();
    expect(screen.getAllByText('120').length).toBeGreaterThanOrEqual(1);
  });

  it('renders verified clubs count', () => {
    renderDashboard();
    expect(screen.getAllByText('35').length).toBeGreaterThanOrEqual(1);
  });

  it('renders pending service requests count', () => {
    renderDashboard();
    expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(1);
  });
});

describe('AdminDashboardClient — verification queue section', () => {
  it('renders verification queue section heading', () => {
    renderDashboard();
    // heading appears in section heading and quick links — use getAllByText
    expect(screen.getAllByText(/ვერიფიკაციის რიგი/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders pending footballer names', () => {
    renderDashboard();
    expect(screen.getByText(/გიორგი/)).toBeDefined();
    expect(screen.getByText(/ნინო/)).toBeDefined();
  });

  it('renders pending club names', () => {
    renderDashboard();
    expect(screen.getByText('FC Dila')).toBeDefined();
  });

  it('shows pending count in section heading when pending > 0', () => {
    renderDashboard();
    expect(screen.getByText(/ვერიფიკაციის რიგი \(17\)/)).toBeDefined();
  });

  it('shows empty state when no pending footballers', () => {
    renderDashboard({ recentPendingFootballers: [] });
    expect(screen.getAllByText('მოლოდინში არ არის').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no pending clubs', () => {
    renderDashboard({ recentPendingClubs: [] });
    expect(screen.getAllByText('მოლოდინში არ არის').length).toBeGreaterThanOrEqual(1);
  });
});

describe('AdminDashboardClient — service requests section', () => {
  it('renders service requests section heading', () => {
    renderDashboard();
    expect(screen.getByText(/სერვისის მოთხოვნები/)).toBeDefined();
  });

  it('renders service request code', () => {
    renderDashboard();
    expect(screen.getByText('SR-2026-0042')).toBeDefined();
  });

  it('renders service request category name', () => {
    renderDashboard();
    expect(screen.getByText('კვება')).toBeDefined();
  });

  it('shows empty state when no service requests', () => {
    renderDashboard({ recentServiceRequests: [] });
    expect(screen.getAllByText('მოლოდინში არ არის').length).toBeGreaterThanOrEqual(1);
  });
});

describe('AdminDashboardClient — quick links', () => {
  it('renders verification queue quick link', () => {
    renderDashboard();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/admin/verification');
  });

  it('renders service requests quick link', () => {
    renderDashboard();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/admin/service-requests');
  });

  it('renders users management quick link', () => {
    renderDashboard();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/admin/users');
  });
});

describe('AdminDashboardClient — zero-pending state', () => {
  it('does not show count badge in heading when no pending items', () => {
    renderDashboard({
      kpi: { ...BASE_KPI, pendingFootballers: 0, pendingClubs: 0 },
      recentPendingFootballers: [],
      recentPendingClubs: [],
    });
    // heading appears in section + quick link; none should have a count suffix
    const headings = screen.getAllByText('ვერიფიკაციის რიგი');
    expect(headings.length).toBeGreaterThanOrEqual(1);
    // No element should contain "(0)" suffix
    const headingsWithCount = screen.queryAllByText(/ვერიფიკაციის რიგი \(\d+\)/);
    expect(headingsWithCount.length).toBe(0);
  });
});
