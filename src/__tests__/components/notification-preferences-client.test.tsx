// @vitest-environment happy-dom
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn().mockResolvedValue(undefined) }));

vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock('@/components/icons', () => ({
  BellIcon: () => <svg data-testid="bell-icon" />,
  MailIcon: () => <svg data-testid="mail-icon" />,
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    disabled,
    'aria-label': ariaLabel,
  }: {
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

import { NotificationPreferencesClient } from '@/app/settings/notifications/notification-preferences-client';

const BASE_USER = { name: 'Ana K', initials: 'AK' };
const DEFAULT_PREFS = { emailInstant: true, emailDigest: true };

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(status = 500): Response {
  return new Response(null, { status });
}

function renderPrefs(prefs = DEFAULT_PREFS) {
  return render(
    <NotificationPreferencesClient
      currentPath="/settings/notifications"
      userId="u1"
      role="footballer"
      user={BASE_USER}
      initialPrefs={prefs}
    />,
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NotificationPreferencesClient — headings', () => {
  it('renders the section heading', () => {
    renderPrefs();
    expect(screen.getByText('შეტყობინებების პარამეტრები')).toBeTruthy();
  });

  it('renders the email section label', () => {
    renderPrefs();
    expect(screen.getByText('ელ. ფოსტის შეტყობინებები')).toBeTruthy();
  });

  it('renders both preference row titles', () => {
    renderPrefs();
    expect(screen.getByText('მყისიერი შეტყობინება')).toBeTruthy();
    expect(screen.getByText('დღიური გამოჯამება')).toBeTruthy();
  });
});

describe('NotificationPreferencesClient — initial state', () => {
  it('renders emailInstant switch as checked when true', () => {
    renderPrefs({ emailInstant: true, emailDigest: false });
    const instantSwitch = screen.getByRole('switch', { name: 'მყისიერი შეტყობინება' });
    expect(instantSwitch.getAttribute('aria-checked')).toBe('true');
  });

  it('renders emailDigest switch as unchecked when false', () => {
    renderPrefs({ emailInstant: true, emailDigest: false });
    const digestSwitch = screen.getByRole('switch', { name: 'დღიური გამოჯამება' });
    expect(digestSwitch.getAttribute('aria-checked')).toBe('false');
  });

  it('does not show save state text on initial render', () => {
    renderPrefs();
    expect(screen.queryByText('ინახება…')).toBeNull();
    expect(screen.queryByText('შენახულია')).toBeNull();
  });
});

describe('NotificationPreferencesClient — toggling preferences', () => {
  it('toggles emailDigest and calls PATCH with updated prefs', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okResponse({ emailInstant: true, emailDigest: false }));

    renderPrefs({ emailInstant: true, emailDigest: true });
    fireEvent.click(screen.getByRole('switch', { name: 'დღიური გამოჯამება' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/settings/notification-preferences',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailInstant: true, emailDigest: false }),
        }),
      );
    });
  });

  it('toggles emailInstant and calls PATCH with updated prefs', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okResponse({ emailInstant: false, emailDigest: true }));

    renderPrefs({ emailInstant: true, emailDigest: true });
    fireEvent.click(screen.getByRole('switch', { name: 'მყისიერი შეტყობინება' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/settings/notification-preferences',
        expect.objectContaining({
          body: JSON.stringify({ emailInstant: false, emailDigest: true }),
        }),
      );
    });
  });

  it('shows "ინახება…" text while saving', async () => {
    let resolveResponse!: (r: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((res) => {
        resolveResponse = res;
      }),
    );

    renderPrefs();
    fireEvent.click(screen.getByRole('switch', { name: 'დღიური გამოჯამება' }));

    expect(screen.getByText('ინახება…')).toBeTruthy();

    // Clean up the pending promise
    resolveResponse(okResponse({ emailInstant: true, emailDigest: false }));
    await waitFor(() => expect(screen.queryByText('ინახება…')).toBeNull());
  });

  it('shows "შენახულია" after a successful save', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okResponse({ emailInstant: true, emailDigest: false }));

    renderPrefs();
    fireEvent.click(screen.getByRole('switch', { name: 'დღიური გამოჯამება' }));

    await waitFor(() => {
      expect(screen.getByText('შენახულია')).toBeTruthy();
    });
  });

  it('shows error text when PATCH fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(errorResponse(500));

    renderPrefs();
    fireEvent.click(screen.getByRole('switch', { name: 'დღიური გამოჯამება' }));

    await waitFor(() => {
      expect(screen.getByText('შენახვა ვერ მოხერხდა, სცადეთ თავიდან')).toBeTruthy();
    });
  });

  it('disables switches while saving', async () => {
    let resolveResponse!: (r: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((res) => {
        resolveResponse = res;
      }),
    );

    renderPrefs();
    fireEvent.click(screen.getByRole('switch', { name: 'დღიური გამოჯამება' }));

    const switches = screen.getAllByRole('switch');
    switches.forEach((sw) => {
      expect((sw as HTMLButtonElement).disabled).toBe(true);
    });

    resolveResponse(okResponse({ emailInstant: true, emailDigest: false }));
    await waitFor(() => {
      const allSwitches = screen.getAllByRole('switch');
      allSwitches.forEach((sw) => {
        expect((sw as HTMLButtonElement).disabled).toBe(false);
      });
    });
  });
});
