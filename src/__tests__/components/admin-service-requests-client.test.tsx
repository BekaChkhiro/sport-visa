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
vi.mock('@/components/icons', () => ({
  ChevronLeftIcon: () => <svg />,
  ChevronRightIcon: () => <svg />,
  CheckCircleIcon: () => <svg />,
  ClockIcon: () => <svg />,
  FileTextIcon: () => <svg />,
  SearchIcon: () => <svg />,
  XCircleIcon: () => <svg />,
}));
vi.mock('@/lib/admin/service-requests/actions', () => ({
  resolveServiceRequest: vi.fn().mockResolvedValue({ status: 'success', message: 'შეს.' }),
  rejectServiceRequest: vi.fn().mockResolvedValue({ status: 'success', message: 'უარყ.' }),
}));

import { ServiceRequestsClient } from '@/app/admin/service-requests/service-requests-client';
import type { ServiceRequestRow } from '@/lib/admin/service-requests/actions';

const BASE_USER = { name: 'Admin', initials: 'AD', email: 'admin@test.ge' };

function makeRow(overrides: Partial<ServiceRequestRow> = {}): ServiceRequestRow {
  return {
    id: 'req-1',
    requestCode: 'SR-2026-0001',
    status: 'PENDING',
    categoryName: 'კვება',
    userEmail: 'user@test.ge',
    footballerName: 'გიორგი მ.',
    adminNote: null,
    resolvedAt: null,
    createdAt: '2026-05-18T10:00:00Z',
    ...overrides,
  };
}

function renderClient(
  rows: ServiceRequestRow[] = [makeRow()],
  opts: { query?: string; status?: 'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED' } = {},
) {
  return render(
    <ServiceRequestsClient
      currentPath="/admin/service-requests"
      userId="admin-1"
      user={BASE_USER}
      query={opts.query ?? ''}
      status={opts.status ?? 'ALL'}
      page={1}
      pageSize={20}
      requestsPage={{ items: rows, total: rows.length, pageCount: 1 }}
      pendingCount={rows.filter((r) => r.status === 'PENDING').length}
      pendingVerifications={0}
    />,
  );
}

describe('ServiceRequestsClient — heading', () => {
  it('renders page heading', () => {
    renderClient();
    expect(screen.getByText('სერვ. მოთხოვნები')).toBeDefined();
  });

  it('renders subtitle', () => {
    renderClient();
    expect(screen.getByText(/ფეხბურთელების სერვისის/)).toBeDefined();
  });
});

describe('ServiceRequestsClient — tabs', () => {
  it('renders all status tabs', () => {
    renderClient();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(4);
  });

  it('ALL tab is selected by default', () => {
    renderClient();
    const allTab = screen.getByRole('tab', { name: /ყველა/ });
    expect(allTab.getAttribute('aria-selected')).toBe('true');
  });

  it('PENDING tab selected when status=PENDING', () => {
    renderClient([makeRow()], { status: 'PENDING' });
    const pendingTab = screen.getByRole('tab', { name: /ახ\./ });
    expect(pendingTab.getAttribute('aria-selected')).toBe('true');
  });
});

describe('ServiceRequestsClient — request list', () => {
  it('renders request code', () => {
    renderClient();
    expect(screen.getByText('SR-2026-0001')).toBeDefined();
  });

  it('renders category name badge', () => {
    renderClient();
    expect(screen.getByText('კვება')).toBeDefined();
  });

  it('renders footballer name', () => {
    renderClient();
    expect(screen.getByText('გიორგი მ.')).toBeDefined();
  });

  it('renders adminNote when present', () => {
    renderClient([makeRow({ adminNote: 'სერვისი ხელმიუწვდომელია' })]);
    expect(screen.getByText('სერვისი ხელმიუწვდომელია')).toBeDefined();
  });

  it('hides adminNote when null', () => {
    renderClient();
    expect(screen.queryByText('სერვისი ხელმიუწვდომელია')).toBeNull();
  });
});

describe('ServiceRequestsClient — empty state', () => {
  it('shows empty state when no items', () => {
    renderClient([]);
    expect(screen.getByText('მოთხოვნა არ არის')).toBeDefined();
  });

  it('shows search empty state when query given but no items', () => {
    renderClient([], { query: 'test' });
    expect(screen.getByText('ვერ მოიძებნა')).toBeDefined();
  });
});

describe('ServiceRequestsClient — action buttons', () => {
  it('shows resolve and reject buttons for PENDING rows', () => {
    renderClient([makeRow({ status: 'PENDING' })]);
    const resolveBtn = screen.getByRole('button', { name: /ჩამ\./ });
    expect(resolveBtn).toBeDefined();
    // reject action button (not the tab button)
    const rejectBtns = screen.getAllByRole('button', { name: /უარყ\./ });
    // at least one is the action button (outside tablist)
    expect(rejectBtns.some((b) => b.getAttribute('role') !== 'tab')).toBe(true);
  });

  it('hides resolve action button for RESOLVED rows', () => {
    renderClient([makeRow({ status: 'RESOLVED', resolvedAt: '2026-05-19T10:00:00Z' })]);
    expect(screen.queryByRole('button', { name: /ჩამ\./ })).toBeNull();
  });

  it('hides resolve action button for REJECTED rows', () => {
    renderClient([makeRow({ status: 'REJECTED', resolvedAt: '2026-05-19T10:00:00Z' })]);
    expect(screen.queryByRole('button', { name: /ჩამ\./ })).toBeNull();
  });

  it('opens reject dialog when reject button in card is clicked', () => {
    renderClient([makeRow({ status: 'PENDING' })]);
    const rejectBtns = screen.getAllByRole('button', { name: /უარყ\./ });
    const cardBtn = rejectBtns.find((b) => b.getAttribute('role') !== 'tab');
    if (!cardBtn) throw new Error('card reject button not found');
    fireEvent.click(cardBtn);
    expect(screen.getByText('უარყოფის მიზეზი')).toBeDefined();
  });

  it('reject dialog submit is disabled when note is empty', () => {
    renderClient([makeRow({ status: 'PENDING' })]);
    const rejectBtns = screen.getAllByRole('button', { name: /უარყ\./ });
    const cardBtn = rejectBtns.find((b) => b.getAttribute('role') !== 'tab');
    if (!cardBtn) throw new Error('card reject button not found');
    fireEvent.click(cardBtn);
    const submitBtn = screen.getByRole('button', { name: 'უარყოფა' });
    expect(submitBtn.getAttribute('disabled')).not.toBeNull();
  });
});

describe('ServiceRequestsClient — pagination', () => {
  it('hides pagination when pageCount is 1', () => {
    renderClient();
    expect(screen.queryByRole('navigation', { name: 'გვერდები' })).toBeNull();
  });

  it('shows pagination when pageCount > 1', () => {
    render(
      <ServiceRequestsClient
        currentPath="/admin/service-requests"
        userId="admin-1"
        user={BASE_USER}
        query=""
        status="ALL"
        page={1}
        pageSize={20}
        requestsPage={{ items: [makeRow()], total: 40, pageCount: 2 }}
        pendingCount={1}
        pendingVerifications={0}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'გვერდები' })).toBeDefined();
  });
});
