// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  PendingBadgeIcon: () => <svg data-testid="pending-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-icon" />,
  XCircleIcon: () => <svg data-testid="x-icon" />,
}));

import { ServiceRequestFormClient } from '@/app/services/request/[slug]/service-request-form-client';

const BASE_USER = {
  name: 'David B',
  initials: 'DB',
  profileCompletion: 80,
};

const BASE_STATS = { views: 10, saves: 2, unreadMessages: 0 };

const MEAL_PLAN_CATEGORY = { id: 'cat-1', slug: 'meal-plan', name: 'კვება' };
const OTHER_CATEGORY = { id: 'cat-4', slug: 'other', name: 'სხვა' };
const TRAINER_CATEGORY = { id: 'cat-2', slug: 'personal-trainer', name: 'პ. მწვრთნელი' };

function renderForm(category = MEAL_PLAN_CATEGORY) {
  return render(
    <ServiceRequestFormClient
      currentPath="/services/request/meal-plan"
      userId="u1"
      userEmail="player@test.com"
      user={BASE_USER}
      stats={BASE_STATS}
      unreadNotifications={0}
      category={category}
    />,
  );
}

describe('ServiceRequestFormClient — heading', () => {
  it('renders category name in heading', () => {
    renderForm();
    expect(screen.getByText(/კვება — დეტალები/)).toBeDefined();
  });

  it('renders step 2/2 indicator', () => {
    renderForm();
    expect(screen.getByText(/ნაბიჯი 2 \/ 2/)).toBeDefined();
  });

  it('renders back-to-categories link', () => {
    const { container } = renderForm();
    expect(container.querySelector('a[href="/services/request"]')).not.toBeNull();
  });
});

describe('ServiceRequestFormClient — meal-plan specific fields', () => {
  it('shows plan type radio buttons for meal-plan', () => {
    renderForm(MEAL_PLAN_CATEGORY);
    expect(screen.getByText('კვების ტიპი')).toBeDefined();
  });

  it('shows dietary options for meal-plan', () => {
    renderForm(MEAL_PLAN_CATEGORY);
    expect(screen.getByText('დიეტური შეზღუდვები')).toBeDefined();
  });

  it('shows date fields for meal-plan', () => {
    renderForm(MEAL_PLAN_CATEGORY);
    expect(screen.getByLabelText('დაწყების თარიღი')).toBeDefined();
    expect(screen.getByLabelText('დამთავრების თარიღი')).toBeDefined();
  });

  it('hides plan type and dietary fields for personal-trainer', () => {
    renderForm(TRAINER_CATEGORY);
    expect(screen.queryByText('კვების ტიპი')).toBeNull();
    expect(screen.queryByText('დიეტური შეზღუდვები')).toBeNull();
  });

  it('shows date fields for personal-trainer', () => {
    renderForm(TRAINER_CATEGORY);
    expect(screen.getByLabelText('დაწყების თარიღი')).toBeDefined();
  });
});

describe('ServiceRequestFormClient — other category', () => {
  it('shows subject field for "other" slug', () => {
    renderForm(OTHER_CATEGORY);
    expect(screen.getByLabelText(/თემა/)).toBeDefined();
  });

  it('hides date fields for "other" slug', () => {
    renderForm(OTHER_CATEGORY);
    expect(screen.queryByLabelText('დაწყების თარიღი')).toBeNull();
  });

  it('hides plan type for "other" slug', () => {
    renderForm(OTHER_CATEGORY);
    expect(screen.queryByText('კვების ტიპი')).toBeNull();
  });

  it('hides subject field for non-other slugs', () => {
    renderForm(MEAL_PLAN_CATEGORY);
    expect(screen.queryByLabelText(/თემა/)).toBeNull();
  });
});

describe('ServiceRequestFormClient — notes field', () => {
  it('renders notes textarea', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: /შენიშვნები/ })).toBeDefined();
  });

  it('shows character counter', () => {
    renderForm();
    expect(screen.getByText('0/500')).toBeDefined();
  });

  it('updates character counter as user types', () => {
    renderForm();
    const textarea = screen.getByRole('textbox', { name: /შენიშვნები/ });
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(screen.getByText('5/500')).toBeDefined();
  });
});

describe('ServiceRequestFormClient — contact preference', () => {
  it('renders all three contact preference options', () => {
    renderForm();
    expect(screen.getByDisplayValue('EMAIL')).toBeDefined();
    expect(screen.getByDisplayValue('PHONE')).toBeDefined();
    expect(screen.getByDisplayValue('CHAT')).toBeDefined();
  });

  it('EMAIL is selected by default', () => {
    renderForm();
    const emailRadio = screen.getByDisplayValue('EMAIL') as HTMLInputElement;
    expect(emailRadio.checked).toBe(true);
  });
});

describe('ServiceRequestFormClient — submission', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows success screen after successful submission', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'req-1',
        requestCode: 'SR-2026-0001',
        status: 'PENDING',
        categoryName: 'კვება',
      }),
    } as Response);

    renderForm();

    // Fill required date fields
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText('დამთავრების თარიღი'), {
      target: { value: '2026-06-30' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'მოთხოვნის გაგზავნა' }));

    await waitFor(() => {
      expect(screen.getByText('მოთხოვნა გაიგზავნა!')).toBeDefined();
    });
    expect(screen.getByText('SR-2026-0001')).toBeDefined();
    expect(screen.getByText('კვება')).toBeDefined();
    expect(screen.getByText('player@test.com')).toBeDefined();
  });

  it('shows error alert on failed submission', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'სერვერის შეცდომა' } }),
    } as Response);

    renderForm();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText('დამთავრების თარიღი'), {
      target: { value: '2026-06-30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'მოთხოვნის გაგზავნა' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('სერვერის შეცდომა');
    });
  });

  it('shows generic error on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'));

    renderForm();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText('დამთავრების თარიღი'), {
      target: { value: '2026-06-30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'მოთხოვნის გაგზავნა' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('network down');
    });
  });

  it('disables submit button while submitting', async () => {
    let resolve: (v: unknown) => void = () => {};
    const pending = new Promise((r) => {
      resolve = r;
    });
    vi.mocked(fetch).mockReturnValueOnce(pending as Promise<Response>);

    renderForm();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText('დამთავრების თარიღი'), {
      target: { value: '2026-06-30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'მოთხოვნის გაგზავნა' }));

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'იგზავნება...' });
      expect(btn).toBeDefined();
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    resolve({ ok: true, json: async () => ({}) });
  });

  it('POSTs to /api/services/requests with categoryId', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'req-1',
        requestCode: 'SR-2026-0001',
        status: 'PENDING',
        categoryName: 'კვება',
      }),
    } as Response);

    renderForm();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText('დამთავრების თარიღი'), {
      target: { value: '2026-06-30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'მოთხოვნის გაგზავნა' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      '/api/services/requests',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"categoryId":"cat-1"'),
      }),
    );
  });
});

describe('ServiceRequestFormClient — success screen links', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function submitAndWaitForSuccess() {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'req-1',
        requestCode: 'SR-2026-0001',
        status: 'PENDING',
        categoryName: 'კვება',
      }),
    } as Response);

    renderForm();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText('დამთავრების თარიღი'), {
      target: { value: '2026-06-30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'მოთხოვნის გაგზავნა' }));

    await waitFor(() => screen.getByText('მოთხოვნა გაიგზავნა!'));
  }

  it('shows dashboard link on success screen', async () => {
    await submitAndWaitForSuccess();
    const { container } = { container: document.body };
    expect(container.querySelector('a[href="/dashboard"]')).not.toBeNull();
  });

  it('shows my-requests link on success screen', async () => {
    await submitAndWaitForSuccess();
    const { container } = { container: document.body };
    expect(container.querySelector('a[href="/services/my-requests"]')).not.toBeNull();
  });
});
