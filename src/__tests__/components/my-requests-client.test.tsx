// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  ArrowLeftIcon: () => <svg data-testid="arrow-left" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  MealPlanIcon: () => <svg data-testid="meal-plan-icon" />,
  PersonalTrainerIcon: () => <svg data-testid="personal-trainer-icon" />,
  TeamDoctorIcon: () => <svg data-testid="team-doctor-icon" />,
  OtherServicesIcon: () => <svg data-testid="other-services-icon" />,
  PendingBadgeIcon: () => <svg data-testid="pending-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-icon" />,
  XCircleIcon: () => <svg data-testid="x-icon" />,
}));

import { MyRequestsClient } from '@/app/services/my-requests/my-requests-client';

const BASE_USER = {
  name: 'David B',
  initials: 'DB',
  profileCompletion: 80,
};

const BASE_STATS = { views: 10, saves: 2, unreadMessages: 0 };

function makeRequest(
  overrides: Partial<{
    id: string;
    requestCode: string;
    status: 'PENDING' | 'RESOLVED' | 'REJECTED';
    notes: string | null;
    adminNote: string | null;
    category: { id: string; name: string; slug: string; icon: string | null };
  }> = {},
) {
  return {
    id: 'req-1',
    requestCode: 'SR-2026-0001',
    status: 'PENDING' as const,
    createdAt: '2026-05-18T10:00:00Z',
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T00:00:00Z',
    notes: null,
    adminNote: null,
    contactPref: 'EMAIL',
    category: { id: 'cat-1', name: 'კვება', slug: 'meal-plan', icon: null },
    ...overrides,
  };
}

function renderClient(requests = [makeRequest()]) {
  return render(
    <MyRequestsClient
      currentPath="/services/my-requests"
      userId="u1"
      user={BASE_USER}
      stats={BASE_STATS}
      unreadNotifications={0}
      requests={requests}
    />,
  );
}

describe('MyRequestsClient — heading', () => {
  it('renders page heading', () => {
    renderClient();
    expect(screen.getByText('ჩემი სერვ. მოთხოვნები')).toBeDefined();
  });

  it('renders back-to-dashboard link', () => {
    const { container } = renderClient();
    expect(container.querySelector('a[href="/dashboard"]')).not.toBeNull();
  });

  it('renders new request link', () => {
    const { container } = renderClient();
    expect(container.querySelector('a[href="/services/request"]')).not.toBeNull();
  });
});

describe('MyRequestsClient — empty state', () => {
  it('shows empty state heading when no requests', () => {
    renderClient([]);
    expect(screen.getByText('მოთხოვნები არ არის')).toBeDefined();
  });

  it('shows "not submitted yet" subtitle when no requests', () => {
    renderClient([]);
    const matches = screen.getAllByText(/სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('hides filter tabs when no requests', () => {
    renderClient([]);
    expect(screen.queryByRole('tablist')).toBeNull();
  });
});

describe('MyRequestsClient — request list', () => {
  it('shows request count in subtitle', () => {
    renderClient([makeRequest(), makeRequest({ id: 'req-2', requestCode: 'SR-2026-0002' })]);
    expect(screen.getByText('სულ 2 მოთხოვნა')).toBeDefined();
  });

  it('renders request code', () => {
    renderClient();
    expect(screen.getByText('SR-2026-0001')).toBeDefined();
  });

  it('renders category name', () => {
    renderClient();
    expect(screen.getByText('კვება')).toBeDefined();
  });

  it('renders notes when present', () => {
    renderClient([makeRequest({ notes: 'test note' })]);
    expect(screen.getByText('test note')).toBeDefined();
  });

  it('hides notes when null', () => {
    renderClient([makeRequest({ notes: null })]);
    expect(screen.queryByText(/test note/)).toBeNull();
  });

  it('renders adminNote when present', () => {
    renderClient([makeRequest({ adminNote: 'admin reply' })]);
    expect(screen.getByText(/admin reply/)).toBeDefined();
  });

  it('hides adminNote when null', () => {
    renderClient([makeRequest({ adminNote: null })]);
    expect(screen.queryByText(/admin reply/)).toBeNull();
  });
});

describe('MyRequestsClient — filter tabs', () => {
  it('shows filter tabs when requests exist', () => {
    renderClient();
    expect(screen.getByRole('tablist')).toBeDefined();
  });

  it('renders all 4 tab labels', () => {
    renderClient();
    expect(screen.getByRole('tab', { name: /ყველა/ })).toBeDefined();
    expect(screen.getByRole('tab', { name: /მოლოდინში/ })).toBeDefined();
    expect(screen.getByRole('tab', { name: /დადასტურდა/ })).toBeDefined();
    expect(screen.getByRole('tab', { name: /უარყოფილია/ })).toBeDefined();
  });

  it('"all" tab is selected by default', () => {
    renderClient();
    const allTab = screen.getByRole('tab', { name: /ყველა/ });
    expect(allTab.getAttribute('aria-selected')).toBe('true');
  });

  it('filters to only PENDING requests when pending tab is clicked', () => {
    renderClient([
      makeRequest({ id: 'r1', requestCode: 'SR-2026-0001', status: 'PENDING' }),
      makeRequest({ id: 'r2', requestCode: 'SR-2026-0002', status: 'RESOLVED' }),
    ]);
    fireEvent.click(screen.getByRole('tab', { name: /მოლოდინში/ }));
    expect(screen.getByText('SR-2026-0001')).toBeDefined();
    expect(screen.queryByText('SR-2026-0002')).toBeNull();
  });

  it('filters to only RESOLVED requests when resolved tab is clicked', () => {
    renderClient([
      makeRequest({ id: 'r1', requestCode: 'SR-2026-0001', status: 'PENDING' }),
      makeRequest({ id: 'r2', requestCode: 'SR-2026-0002', status: 'RESOLVED' }),
    ]);
    fireEvent.click(screen.getByRole('tab', { name: /დადასტურდა/ }));
    expect(screen.queryByText('SR-2026-0001')).toBeNull();
    expect(screen.getByText('SR-2026-0002')).toBeDefined();
  });

  it('shows empty-filter state when no matches for selected tab', () => {
    renderClient([makeRequest({ status: 'PENDING' })]);
    fireEvent.click(screen.getByRole('tab', { name: /დადასტურდა/ }));
    expect(screen.getByText('ამ კატეგორიაში მოთხოვნა არ არის')).toBeDefined();
  });

  it('shows all requests again when "all" tab re-selected', () => {
    renderClient([
      makeRequest({ id: 'r1', requestCode: 'SR-2026-0001', status: 'PENDING' }),
      makeRequest({ id: 'r2', requestCode: 'SR-2026-0002', status: 'RESOLVED' }),
    ]);
    fireEvent.click(screen.getByRole('tab', { name: /მოლოდინში/ }));
    fireEvent.click(screen.getByRole('tab', { name: /ყველა/ }));
    expect(screen.getByText('SR-2026-0001')).toBeDefined();
    expect(screen.getByText('SR-2026-0002')).toBeDefined();
  });
});
