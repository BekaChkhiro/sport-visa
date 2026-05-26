// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/clubs/actions', () => ({
  toggleSubscription: vi.fn(),
}));

import { ClubsDirectoryClient } from '@/app/clubs/clubs-directory-client';
import { toggleSubscription } from '@/lib/clubs/actions';

const toggleSubscriptionMock = vi.mocked(toggleSubscription);

const baseProps = {
  viewerRole: null as string | null,
  items: [] as ReturnType<typeof makeClub>[],
  total: 0,
  page: 1,
  pageSize: 12,
  sort: 'newest' as const,
  countryOptions: [] as { value: string; label: string }[],
  cityOptions: [] as { value: string; label: string }[],
};

function makeClub(
  overrides: Partial<{
    id: string;
    name: string;
    country: string;
    isSubscribed: boolean;
  }> = {},
) {
  return {
    id: 'c1',
    name: 'FC Dinamo Tbilisi',
    country: 'GEO',
    verificationStatus: 'verified' as const,
    isSubscribed: false,
    ...overrides,
  };
}

describe('ClubsDirectoryClient — rendering', () => {
  it('renders club names', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} />);
    expect(screen.getByText('FC Dinamo Tbilisi')).toBeDefined();
  });

  it('renders total count', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} />);
    expect(screen.getByText(/1 კლუბი/)).toBeDefined();
  });

  it('renders empty state without filter message when no items and no search', () => {
    render(<ClubsDirectoryClient {...baseProps} />);
    expect(screen.getByText('კლუბი ვერ მოიძებნა')).toBeDefined();
    expect(screen.getByText(/კლუბები ჯერ არ არის/)).toBeDefined();
  });

  it('renders filtered empty state message when search is active', () => {
    render(
      <ClubsDirectoryClient {...baseProps} initialSearch="nonexistent" items={[]} total={0} />,
    );
    expect(screen.getByText(/ფილტრებთან კლუბი ვერ მოიძებნა/)).toBeDefined();
  });

  it('renders search input', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} />);
    expect(screen.getByLabelText('კლუბის ძებნა')).toBeDefined();
  });

  it('renders sort select', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} />);
    expect(screen.getByLabelText('სორტირება')).toBeDefined();
  });

  it('renders country select when countryOptions provided', () => {
    render(
      <ClubsDirectoryClient
        {...baseProps}
        items={[makeClub()]}
        total={1}
        countryOptions={[{ value: 'GEO', label: 'Georgia' }]}
      />,
    );
    expect(screen.getByLabelText('ქვეყანა')).toBeDefined();
  });

  it('does not render country select when countryOptions is empty', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} />);
    expect(screen.queryByLabelText('ქვეყანა')).toBeNull();
  });

  it('renders city select when cityOptions provided', () => {
    render(
      <ClubsDirectoryClient
        {...baseProps}
        items={[makeClub()]}
        total={1}
        cityOptions={[{ value: 'Tbilisi', label: 'Tbilisi' }]}
      />,
    );
    expect(screen.getByLabelText('ქალაქი')).toBeDefined();
  });

  it('shows reset button when search filter is active', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[]} total={0} initialSearch="test" />);
    expect(screen.getByText('გასუფ.')).toBeDefined();
  });

  it('hides reset button when no filters are active', () => {
    render(<ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} />);
    expect(screen.queryByText('გასუფ.')).toBeNull();
  });
});

describe('ClubsDirectoryClient — subscribe buttons', () => {
  it('shows subscribe buttons when viewerRole is FOOTBALLER', () => {
    render(
      <ClubsDirectoryClient
        {...baseProps}
        viewerRole="FOOTBALLER"
        items={[makeClub()]}
        total={1}
      />,
    );
    expect(screen.getByLabelText('გამოწერა')).toBeDefined();
  });

  it('does not show subscribe buttons when viewerRole is CLUB', () => {
    render(
      <ClubsDirectoryClient {...baseProps} viewerRole="CLUB" items={[makeClub()]} total={1} />,
    );
    expect(screen.queryByLabelText(/გამოწერ/)).toBeNull();
  });

  it('does not show subscribe buttons when viewerRole is null', () => {
    render(
      <ClubsDirectoryClient {...baseProps} viewerRole={null} items={[makeClub()]} total={1} />,
    );
    expect(screen.queryByLabelText(/გამოწერ/)).toBeNull();
  });

  it('reflects initial isSubscribed=true state on button', () => {
    render(
      <ClubsDirectoryClient
        {...baseProps}
        viewerRole="FOOTBALLER"
        items={[makeClub({ isSubscribed: true })]}
        total={1}
      />,
    );
    const btn = screen.getByLabelText('გამოწერა გაუქ.');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('applies optimistic subscribe update on click', () => {
    let resolve: (v: { status: 'success'; subscribed: boolean }) => void;
    const pending = new Promise<{ status: 'success'; subscribed: boolean }>((r) => {
      resolve = r;
    });
    toggleSubscriptionMock.mockReturnValueOnce(pending);

    render(
      <ClubsDirectoryClient
        {...baseProps}
        viewerRole="FOOTBALLER"
        items={[makeClub({ isSubscribed: false })]}
        total={1}
      />,
    );

    fireEvent.click(screen.getByLabelText('გამოწერა'));

    expect(screen.getByLabelText('გამოწერა გაუქ.').getAttribute('aria-pressed')).toBe('true');
    resolve!({ status: 'success', subscribed: true });
  });

  it('reverts optimistic subscribe update on server error', async () => {
    toggleSubscriptionMock.mockResolvedValueOnce({ status: 'error', message: 'failed' });

    render(
      <ClubsDirectoryClient
        {...baseProps}
        viewerRole="FOOTBALLER"
        items={[makeClub({ isSubscribed: false })]}
        total={1}
      />,
    );

    fireEvent.click(screen.getByLabelText('გამოწერა'));

    await waitFor(() => {
      expect(screen.getByLabelText('გამოწერა').getAttribute('aria-pressed')).toBe('false');
    });
  });
});

describe('ClubsDirectoryClient — pagination', () => {
  it('shows pagination when total exceeds page size', () => {
    render(
      <ClubsDirectoryClient
        {...baseProps}
        items={Array.from({ length: 5 }, (_, i) => makeClub({ id: `c${i}`, name: `Club ${i}` }))}
        total={25}
        pageSize={5}
        page={1}
      />,
    );
    expect(screen.getByLabelText('პაგინაცია')).toBeDefined();
  });

  it('hides pagination when results fit on one page', () => {
    render(
      <ClubsDirectoryClient {...baseProps} items={[makeClub()]} total={1} pageSize={12} page={1} />,
    );
    expect(screen.queryByLabelText('პაგინაცია')).toBeNull();
  });
});
