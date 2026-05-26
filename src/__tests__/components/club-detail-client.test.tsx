// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/clubs/actions', () => ({
  toggleSubscription: vi.fn(),
}));

import { ClubDetailClient } from '@/app/clubs/[clubId]/club-detail-client';
import { toggleSubscription } from '@/lib/clubs/actions';

const toggleSubscriptionMock = vi.mocked(toggleSubscription);

const baseClub = {
  id: 'c1',
  name: 'FC Dinamo Tbilisi',
  city: 'Tbilisi',
  country: 'GEO',
  league: 'Erovnuli Liga',
  foundedYear: 1925,
  verificationStatus: 'verified' as const,
  profileViewCount: 1200,
  subscriberCount: 34,
  officialWebsite: undefined as string | undefined,
  bio: undefined as string | undefined,
  stadiumName: undefined as string | undefined,
  stadiumCapacity: undefined as number | undefined,
  stadiumAddress: undefined as string | undefined,
  stadiumMapUrl: undefined as string | undefined,
  rosterEntries: [] as {
    id: string;
    playerName: string;
    position?: string;
    jerseyNumber?: number;
  }[],
  historyEvents: [] as {
    id: string;
    year: number;
    title: string;
    description?: string;
  }[],
};

function renderDetail(
  clubOverrides: Partial<typeof baseClub> = {},
  props: Partial<{
    viewerRole: string | null;
    activeTab: string;
    isSubscribed: boolean;
  }> = {},
) {
  return render(
    <ClubDetailClient
      viewerRole={props.viewerRole ?? 'FOOTBALLER'}
      activeTab={props.activeTab ?? 'history'}
      club={{ ...baseClub, ...clubOverrides }}
      isSubscribed={props.isSubscribed ?? false}
    />,
  );
}

describe('ClubDetailClient — hero section', () => {
  it('renders club name', () => {
    renderDetail();
    expect(screen.getByText('FC Dinamo Tbilisi')).toBeDefined();
  });

  it('renders city and country in meta paragraph', () => {
    renderDetail();
    expect(screen.getByText(/Tbilisi · GEO/)).toBeDefined();
  });

  it('renders profile view count', () => {
    renderDetail();
    expect(screen.getByText(/1200 ნახვა/)).toBeDefined();
  });

  it('renders subscriber count', () => {
    renderDetail();
    expect(screen.getByText(/34 გამ/)).toBeDefined();
  });

  it('renders back link to /clubs', () => {
    const { container } = renderDetail();
    expect(container.querySelector('a[href="/clubs"]')).not.toBeNull();
  });

  it('renders official website link when provided', () => {
    renderDetail({ officialWebsite: 'https://fc-dinamo.ge' });
    expect(screen.getByText('fc-dinamo.ge')).toBeDefined();
  });
});

describe('ClubDetailClient — subscribe button visibility', () => {
  it('shows subscribe button for FOOTBALLER viewer', () => {
    renderDetail({}, { viewerRole: 'FOOTBALLER' });
    expect(screen.getByRole('button', { name: /გამოწ/i })).toBeDefined();
  });

  it('shows subscribe button for unauthenticated viewer (null role)', () => {
    renderDetail({}, { viewerRole: null });
    expect(screen.getByRole('button', { name: /გამოწ/i })).toBeDefined();
  });

  it('hides subscribe button for CLUB viewer', () => {
    renderDetail({}, { viewerRole: 'CLUB' });
    expect(screen.queryByRole('button', { name: /გამოწ/i })).toBeNull();
  });
});

describe('ClubDetailClient — subscribe button state', () => {
  it('button shows subscribed state when isSubscribed=true', () => {
    renderDetail({}, { viewerRole: 'FOOTBALLER', isSubscribed: true });
    const btn = screen.getByRole('button', { name: /გამოწ/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('button shows unsubscribed state when isSubscribed=false', () => {
    renderDetail({}, { viewerRole: 'FOOTBALLER', isSubscribed: false });
    const btn = screen.getByRole('button', { name: /გამოწ/i });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('applies optimistic subscribe update on click', () => {
    let resolve: (v: { status: 'success'; subscribed: boolean }) => void;
    const pending = new Promise<{ status: 'success'; subscribed: boolean }>((r) => {
      resolve = r;
    });
    toggleSubscriptionMock.mockReturnValueOnce(pending);

    renderDetail({}, { viewerRole: 'FOOTBALLER', isSubscribed: false });
    fireEvent.click(screen.getByRole('button', { name: /გამოწ/i }));

    expect(screen.getByRole('button', { name: /გამოწ/i }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    resolve!({ status: 'success', subscribed: true });
  });

  it('reverts optimistic subscribe update on server error', async () => {
    toggleSubscriptionMock.mockResolvedValueOnce({ status: 'error', message: 'failed' });

    renderDetail({}, { viewerRole: 'FOOTBALLER', isSubscribed: false });
    fireEvent.click(screen.getByRole('button', { name: /გამოწ/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /გამოწ/i }).getAttribute('aria-pressed')).toBe(
        'false',
      );
    });
  });
});

describe('ClubDetailClient — tab navigation', () => {
  it('renders all four tabs', () => {
    renderDetail();
    expect(screen.getByText('ისტ. / ბიო')).toBeDefined();
    expect(screen.getByText('შემ. სია')).toBeDefined();
    expect(screen.getByText('სტ. ინფ.')).toBeDefined();
    expect(screen.getByText('სიახლეები')).toBeDefined();
  });

  it('marks history tab as current by default', () => {
    const { container } = renderDetail();
    const historyBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'ისტ. / ბიო',
    )!;
    expect(historyBtn.getAttribute('aria-current')).toBe('page');
  });

  it('marks roster tab as current when activeTab is roster', () => {
    const { container } = renderDetail({}, { activeTab: 'roster' });
    const rosterBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'შემ. სია',
    )!;
    expect(rosterBtn.getAttribute('aria-current')).toBe('page');
  });

  it('marks stadium tab as current when activeTab is stadium', () => {
    const { container } = renderDetail({}, { activeTab: 'stadium' });
    const stadiumBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'სტ. ინფ.',
    )!;
    expect(stadiumBtn.getAttribute('aria-current')).toBe('page');
  });
});

describe('ClubDetailClient — history tab', () => {
  it('renders bio when provided', () => {
    renderDetail({ bio: 'Founded in 1925 in Tbilisi.' });
    expect(screen.getByText('Founded in 1925 in Tbilisi.')).toBeDefined();
  });

  it('renders history events when provided', () => {
    renderDetail({
      historyEvents: [{ id: 'h1', year: 1925, title: 'Club founded' }],
    });
    expect(screen.getByText('Club founded')).toBeDefined();
  });

  it('shows empty state when no bio and no events', () => {
    renderDetail({ bio: undefined, historyEvents: [] });
    expect(screen.getByText('ისტორია / ბიო ჯერ არ არის დამატებული.')).toBeDefined();
  });
});

describe('ClubDetailClient — roster tab', () => {
  it('renders roster entries in table', () => {
    renderDetail(
      {
        rosterEntries: [
          { id: 'r1', playerName: 'Giorgi Mikhelidze', position: 'CM', jerseyNumber: 10 },
        ],
      },
      { activeTab: 'roster' },
    );
    expect(screen.getByText('Giorgi Mikhelidze')).toBeDefined();
    expect(screen.getByText('CM')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
  });

  it('renders table headers', () => {
    renderDetail(
      { rosterEntries: [{ id: 'r1', playerName: 'Test Player' }] },
      { activeTab: 'roster' },
    );
    expect(screen.getByText('სახელი')).toBeDefined();
    expect(screen.getByText('პოზ.')).toBeDefined();
  });

  it('shows empty state when no roster entries', () => {
    renderDetail({ rosterEntries: [] }, { activeTab: 'roster' });
    expect(screen.getByText('შემადგენლობა ჯერ არ არის დამატებული.')).toBeDefined();
  });
});

describe('ClubDetailClient — stadium tab', () => {
  it('renders stadium name when provided', () => {
    renderDetail({ stadiumName: 'Boris Paichadze Arena' }, { activeTab: 'stadium' });
    expect(screen.getByText('Boris Paichadze Arena')).toBeDefined();
  });

  it('renders stadium capacity', () => {
    renderDetail({ stadiumCapacity: 100 }, { activeTab: 'stadium' });
    expect(screen.getByText(/100 ადგილი/)).toBeDefined();
  });

  it('renders stadium address', () => {
    renderDetail({ stadiumAddress: '5 Akaki Tsereteli Ave' }, { activeTab: 'stadium' });
    expect(screen.getByText('5 Akaki Tsereteli Ave')).toBeDefined();
  });

  it('renders iframe for coordinate map URL', () => {
    const { container } = renderDetail(
      { stadiumMapUrl: '41.7151,44.8271' },
      { activeTab: 'stadium' },
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.src).toContain('output=embed');
  });

  it('does not render iframe when stadiumMapUrl is absent', () => {
    const { container } = renderDetail(
      { stadiumName: 'Some Stadium', stadiumMapUrl: undefined },
      { activeTab: 'stadium' },
    );
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('shows empty state when no stadium info at all', () => {
    renderDetail(
      {
        stadiumName: undefined,
        stadiumCapacity: undefined,
        stadiumAddress: undefined,
        stadiumMapUrl: undefined,
      },
      { activeTab: 'stadium' },
    );
    expect(screen.getByText('სტადიონის ინფო ჯერ არ არის დამატებული.')).toBeDefined();
  });
});

describe('ClubDetailClient — news tab', () => {
  it('renders phase 7 placeholder text', () => {
    renderDetail({}, { activeTab: 'news' });
    expect(screen.getByText(/სიახლეები მალე გამოჩნდება/)).toBeDefined();
  });
});
