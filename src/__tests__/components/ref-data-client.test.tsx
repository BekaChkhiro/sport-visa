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
  CheckCircleIcon: () => <svg />,
  DeleteIcon: () => <svg />,
  EditIcon: () => <svg />,
  GlobeIcon: () => <svg />,
  PlusIcon: () => <svg />,
  SettingsIcon: () => <svg />,
  XCircleIcon: () => <svg />,
}));
vi.mock('@/lib/admin/ref-data/actions', () => ({
  createLeague: vi.fn().mockResolvedValue({ status: 'success', message: 'ლიგა დაემატა' }),
  updateLeague: vi.fn().mockResolvedValue({ status: 'success', message: 'ლიგა განახლდა' }),
  deleteLeague: vi.fn().mockResolvedValue({ status: 'success', message: 'ლიგა წაიშალა' }),
  toggleLeagueActive: vi.fn().mockResolvedValue({ status: 'success' }),
  createServiceCategory: vi
    .fn()
    .mockResolvedValue({ status: 'success', message: 'კატეგორია დაემატა' }),
  updateServiceCategory: vi
    .fn()
    .mockResolvedValue({ status: 'success', message: 'კატეგორია განახლდა' }),
  deleteServiceCategory: vi
    .fn()
    .mockResolvedValue({ status: 'success', message: 'კატეგორია წაიშალა' }),
  toggleServiceCategoryActive: vi.fn().mockResolvedValue({ status: 'success' }),
}));

import { RefDataClient } from '@/app/admin/ref-data/ref-data-client';

type LeagueRow = {
  id: string;
  name: string;
  country: string | null;
  isActive: boolean;
  orderIndex: number;
};

type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  orderIndex: number;
  requestCount: number;
};

const BASE_USER = { name: 'Admin', initials: 'AD', email: 'admin@test.ge' };

function makeLeague(overrides: Partial<LeagueRow> = {}): LeagueRow {
  return {
    id: 'league-1',
    name: 'ეროვნული ლიგა',
    country: 'GE',
    isActive: true,
    orderIndex: 0,
    ...overrides,
  };
}

function makeCategory(overrides: Partial<ServiceCategoryRow> = {}): ServiceCategoryRow {
  return {
    id: 'cat-1',
    slug: 'meal_plan',
    name: 'კვება',
    icon: '🍽',
    description: 'კვების სერვისი',
    isActive: true,
    orderIndex: 0,
    requestCount: 5,
    ...overrides,
  };
}

function renderClient(overrides: Partial<Parameters<typeof RefDataClient>[0]> = {}) {
  return render(
    <RefDataClient
      currentPath="/admin/ref-data"
      userId="admin-1"
      user={BASE_USER}
      leagues={[makeLeague()]}
      serviceCategories={[makeCategory()]}
      pendingCount={0}
      pendingVerifications={0}
      {...overrides}
    />,
  );
}

// ── heading ───────────────────────────────────────────────────────────────────

describe('RefDataClient — heading', () => {
  it('renders h1 სცნობარო მონაცემები', () => {
    renderClient();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('სცნობარო მონაცემები')).toBeDefined();
  });

  it('renders subtitle containing ლიგები', () => {
    renderClient();
    expect(screen.getAllByText(/ლიგები/).length).toBeGreaterThanOrEqual(1);
  });
});

// ── tabs ──────────────────────────────────────────────────────────────────────

describe('RefDataClient — tabs', () => {
  it('shows ლიგები and სერვ. კატ. tab labels with counts in badges', () => {
    renderClient({
      leagues: [makeLeague(), makeLeague({ id: 'league-2', name: 'სუპერ ლიგა' })],
      serviceCategories: [makeCategory()],
    });
    expect(screen.getByRole('tab', { name: /ლიგები/ })).toBeDefined();
    expect(screen.getByRole('tab', { name: /სერვ\. კატ\./ })).toBeDefined();
    // counts appear as Badge children; verify both are in the document
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('leagues tab is selected by default (aria-selected=true)', () => {
    renderClient();
    const leaguesTab = screen.getByRole('tab', { name: /ლიგები/ });
    expect(leaguesTab.getAttribute('aria-selected')).toBe('true');
  });

  it('clicking categories tab changes aria-selected', () => {
    renderClient();
    const catTab = screen.getByRole('tab', { name: /სერვ\. კატ\./ });
    fireEvent.click(catTab);
    expect(catTab.getAttribute('aria-selected')).toBe('true');
    const leaguesTab = screen.getByRole('tab', { name: /ლიგები/ });
    expect(leaguesTab.getAttribute('aria-selected')).toBe('false');
  });
});

// ── leagues section (default tab) ─────────────────────────────────────────────

describe('RefDataClient — leagues section (default tab)', () => {
  it('renders league name', () => {
    renderClient();
    expect(screen.getByText('ეროვნული ლიგა')).toBeDefined();
  });

  it('renders country code', () => {
    renderClient();
    expect(screen.getByText('GE')).toBeDefined();
  });

  it('shows #0 order index text', () => {
    renderClient();
    expect(screen.getByText('#0')).toBeDefined();
  });

  it('shows გამოთიშული badge when isActive=false', () => {
    renderClient({ leagues: [makeLeague({ isActive: false })] });
    expect(screen.getByText('გამოთიშული')).toBeDefined();
  });

  it('has edit button (aria-label=რედაქტირება)', () => {
    renderClient();
    expect(screen.getByRole('button', { name: 'რედაქტირება' })).toBeDefined();
  });

  it('has delete button (aria-label=წაშლა)', () => {
    renderClient();
    expect(screen.getByRole('button', { name: 'წაშლა' })).toBeDefined();
  });

  it('has toggle button with aria-label გამოთიშვა when active', () => {
    renderClient({ leagues: [makeLeague({ isActive: true })] });
    expect(screen.getByRole('button', { name: 'გამოთიშვა' })).toBeDefined();
  });

  it('has toggle button with aria-label ჩართვა when inactive', () => {
    renderClient({ leagues: [makeLeague({ isActive: false })] });
    expect(screen.getByRole('button', { name: 'ჩართვა' })).toBeDefined();
  });

  it('shows empty state ლიგა არ არის when leagues=[]', () => {
    renderClient({ leagues: [] });
    expect(screen.getByText('ლიგა არ არის')).toBeDefined();
  });

  it('has ლიგის დამატება button', () => {
    renderClient();
    expect(screen.getByRole('button', { name: /ლიგის დამატება/ })).toBeDefined();
  });
});

// ── league dialog ─────────────────────────────────────────────────────────────

describe('RefDataClient — league dialog', () => {
  it('clicking ლიგის დამატება opens dialog with title ლიგის დამატება', () => {
    renderClient();
    fireEvent.click(screen.getByRole('button', { name: /ლიგის დამატება/ }));
    expect(screen.getByRole('heading', { name: 'ლიგის დამატება' })).toBeDefined();
  });

  it('dialog has name input (id=league-name)', () => {
    renderClient();
    fireEvent.click(screen.getByRole('button', { name: /ლიგის დამატება/ }));
    expect(document.getElementById('league-name')).not.toBeNull();
  });
});

// ── categories section ────────────────────────────────────────────────────────

describe('RefDataClient — categories section', () => {
  function switchToCategoriesTab() {
    renderClient();
    fireEvent.click(screen.getByRole('tab', { name: /სერვ\. კატ\./ }));
  }

  it('after clicking categories tab, shows category name', () => {
    switchToCategoriesTab();
    expect(screen.getByText('კვება')).toBeDefined();
  });

  it('shows category slug', () => {
    switchToCategoriesTab();
    expect(screen.getByText('meal_plan')).toBeDefined();
  });

  it('shows category icon when present', () => {
    switchToCategoriesTab();
    expect(screen.getByText('🍽')).toBeDefined();
  });

  it('shows გამოთიშული badge when isActive=false', () => {
    render(
      <RefDataClient
        currentPath="/admin/ref-data"
        userId="admin-1"
        user={BASE_USER}
        leagues={[makeLeague()]}
        serviceCategories={[makeCategory({ isActive: false })]}
        pendingCount={0}
        pendingVerifications={0}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: /სერვ\. კატ\./ }));
    expect(screen.getByText('გამოთიშული')).toBeDefined();
  });

  it('shows empty state კატეგორია არ არის when serviceCategories=[]', () => {
    render(
      <RefDataClient
        currentPath="/admin/ref-data"
        userId="admin-1"
        user={BASE_USER}
        leagues={[makeLeague()]}
        serviceCategories={[]}
        pendingCount={0}
        pendingVerifications={0}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: /სერვ\. კატ\./ }));
    expect(screen.getByText('კატეგორია არ არის')).toBeDefined();
  });

  it('კატეგორიის დამატება button exists in categories tab', () => {
    switchToCategoriesTab();
    expect(screen.getByRole('button', { name: /კატეგორიის დამატება/ })).toBeDefined();
  });
});

// ── delete dialog ─────────────────────────────────────────────────────────────

describe('RefDataClient — delete dialog', () => {
  it('clicking delete on a league opens confirm dialog (წაშლის დადასტურება)', () => {
    renderClient();
    fireEvent.click(screen.getByRole('button', { name: 'წაშლა' }));
    expect(screen.getByText('წაშლის დადასტურება')).toBeDefined();
  });
});
