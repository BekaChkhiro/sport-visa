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
  ArrowLeftIcon: () => <svg data-testid="arrow-left" />,
  MealPlanIcon: () => <svg data-testid="meal-plan-icon" />,
  PersonalTrainerIcon: () => <svg data-testid="personal-trainer-icon" />,
  TeamDoctorIcon: () => <svg data-testid="team-doctor-icon" />,
  OtherServicesIcon: () => <svg data-testid="other-services-icon" />,
}));

import { ServiceCategoriesClient } from '@/app/services/request/service-categories-client';

const BASE_USER = {
  name: 'David B',
  initials: 'DB',
  profileCompletion: 80,
};

const BASE_STATS = { views: 10, saves: 2, unreadMessages: 0 };

const CATEGORIES = [
  { id: 'cat-1', slug: 'meal-plan', name: 'კვება', icon: null, description: 'კვების გეგმა' },
  {
    id: 'cat-2',
    slug: 'personal-trainer',
    name: 'პ. მწვრთნელი',
    icon: null,
    description: null,
  },
];

function renderClient(categories = CATEGORIES) {
  return render(
    <ServiceCategoriesClient
      currentPath="/services/request"
      userId="u1"
      user={BASE_USER}
      stats={BASE_STATS}
      unreadNotifications={0}
      categories={categories}
    />,
  );
}

describe('ServiceCategoriesClient — heading', () => {
  it('renders page heading', () => {
    renderClient();
    expect(screen.getByText('სერვისის მოთხოვნა')).toBeDefined();
  });

  it('renders step indicator', () => {
    renderClient();
    expect(screen.getByText(/ნაბიჯი 1 \/ 2/)).toBeDefined();
  });

  it('renders back-to-dashboard link', () => {
    const { container } = renderClient();
    expect(container.querySelector('a[href="/dashboard"]')).not.toBeNull();
  });
});

describe('ServiceCategoriesClient — categories', () => {
  it('renders category names', () => {
    renderClient();
    expect(screen.getByText('კვება')).toBeDefined();
    expect(screen.getByText('პ. მწვრთნელი')).toBeDefined();
  });

  it('renders description when provided', () => {
    renderClient();
    expect(screen.getByText('კვების გეგმა')).toBeDefined();
  });

  it('renders an "არჩევა" button linking to the category slug', () => {
    const { container } = renderClient();
    const link = container.querySelector('a[href="/services/request/meal-plan"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain('არჩევა');
  });

  it('renders one card per category', () => {
    const { container } = renderClient();
    const links = container.querySelectorAll('a[href^="/services/request/"]');
    expect(links.length).toBe(2);
  });
});

describe('ServiceCategoriesClient — empty state', () => {
  it('shows empty state when no categories', () => {
    renderClient([]);
    expect(screen.getByText('სერვისები მიუწვდომელია')).toBeDefined();
  });

  it('hides category cards when no categories', () => {
    const { container } = renderClient([]);
    expect(container.querySelector('a[href^="/services/request/"]')).toBeNull();
  });
});
