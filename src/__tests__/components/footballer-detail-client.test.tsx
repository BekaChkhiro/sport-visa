// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }));
vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));
vi.mock('@/lib/directory/actions', () => ({
  toggleShortlist: vi.fn(),
}));

import { FootballerDetailClient } from '@/app/directory/[footballerId]/footballer-detail-client';
import { toggleShortlist } from '@/lib/directory/actions';

const toggleShortlistMock = vi.mocked(toggleShortlist);

const baseUser = {
  name: 'FC Dila',
  initials: 'FD',
  verificationStatus: 'verified' as const,
};

const baseFootballer = {
  id: 'fb1',
  firstName: 'Giorgi',
  lastName: 'Mikhelidze',
  age: 26 as number | undefined,
  nationality: 'GEO' as string | undefined,
  city: undefined as string | undefined,
  country: undefined as string | undefined,
  bio: undefined as string | undefined,
  positions: ['CM'] as string[],
  dominantFoot: undefined as string | undefined,
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  currentClub: undefined as string | undefined,
  jerseyNumber: undefined as number | undefined,
  experienceLevel: undefined as string | undefined,
  desiredLeague: undefined as string | undefined,
  avatarUrl: undefined as string | undefined,
  coverUrl: undefined as string | undefined,
  videoLinks: [] as string[],
  verificationStatus: 'verified' as const,
  profileViewCount: 348,
  shortlistCount: 5,
  agentName: undefined as string | undefined,
  agentPhone: undefined as string | undefined,
  agentEmail: undefined as string | undefined,
  careerEntries: [] as {
    id: string;
    clubName: string;
    startYear: number;
    endYear?: number;
    position?: string;
  }[],
  galleryPhotos: [] as { id: string; url: string }[],
  isShortlisted: false,
};

function renderDetail(
  footballerOverrides: Partial<typeof baseFootballer> = {},
  userOverrides: Partial<typeof baseUser> = {},
) {
  return render(
    <FootballerDetailClient
      currentPath="/directory"
      user={{ ...baseUser, ...userOverrides }}
      unreadNotifications={0}
      footballer={{ ...baseFootballer, ...footballerOverrides }}
    />,
  );
}

describe('FootballerDetailClient — hero section', () => {
  it('renders full footballer name', () => {
    renderDetail();
    expect(screen.getByText('Giorgi Mikhelidze')).toBeDefined();
  });

  it('renders primary position chip', () => {
    renderDetail();
    expect(screen.getByText('CM')).toBeDefined();
  });

  it('renders age', () => {
    renderDetail();
    expect(screen.getByText(/26 წ\./)).toBeDefined();
  });

  it('renders nationality', () => {
    renderDetail();
    expect(screen.getAllByText('GEO').length).toBeGreaterThanOrEqual(1);
  });

  it('renders profile view count', () => {
    renderDetail();
    expect(screen.getByText(/348 ნახვა/)).toBeDefined();
  });

  it('renders back-link pointing to /directory', () => {
    const { container } = renderDetail();
    const link = container.querySelector('a[href="/directory"]');
    expect(link).not.toBeNull();
  });
});

describe('FootballerDetailClient — shortlist button', () => {
  it('shows "შ. სიაში" when not shortlisted', () => {
    renderDetail({ isShortlisted: false });
    const buttons = screen.getAllByRole('button', { name: /შ\. სია/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]!.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows shortlisted state when isShortlisted=true', () => {
    renderDetail({ isShortlisted: true });
    const buttons = screen.getAllByRole('button', { name: /შ\. სიაშია/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]!.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls toggleShortlist with footballer id when clicked', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'success', shortlisted: true });
    renderDetail({ isShortlisted: false });
    const buttons = screen.getAllByRole('button', { name: /შ\. სია/i });
    fireEvent.click(buttons[0]!);
    expect(toggleShortlistMock).toHaveBeenCalledWith('fb1');
  });

  it('applies optimistic update before server responds', () => {
    let resolve: (v: { status: 'success'; shortlisted: boolean }) => void;
    const pending = new Promise<{ status: 'success'; shortlisted: boolean }>((r) => {
      resolve = r;
    });
    toggleShortlistMock.mockReturnValueOnce(pending);

    renderDetail({ isShortlisted: false });
    const buttons = screen.getAllByRole('button', { name: /შ\. სია/i });
    fireEvent.click(buttons[0]!);

    // Optimistic: button is now shown as shortlisted before server responds
    const afterClick = screen.queryAllByRole('button', { name: /შ\. სიაშია/i });
    expect(afterClick.length).toBeGreaterThanOrEqual(1);

    // Clean up promise
    resolve!({ status: 'success', shortlisted: true });
  });

  it('reverts optimistic update on server error', async () => {
    toggleShortlistMock.mockResolvedValueOnce({ status: 'error', message: 'failed' });
    renderDetail({ isShortlisted: false });
    const buttons = screen.getAllByRole('button', { name: /შ\. სია/i });
    fireEvent.click(buttons[0]!);

    await waitFor(() => {
      // after revert, button returns to non-shortlisted label
      const reverted = screen.queryAllByRole('button', { name: /შ\. სიაში/i });
      expect(reverted.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('FootballerDetailClient — bio section', () => {
  it('renders bio when provided', () => {
    renderDetail({ bio: 'პროფესიონალი ფეხბურთელი.' });
    expect(screen.getByText('პროფესიონალი ფეხბურთელი.')).toBeDefined();
  });

  it('omits bio section when not provided', () => {
    renderDetail({ bio: undefined });
    expect(screen.queryByText(/ბიო/i)).toBeNull();
  });
});

describe('FootballerDetailClient — career history', () => {
  const careerEntries = [
    { id: 'c1', clubName: 'FC Dinamo Tbilisi', startYear: 2022, endYear: 2024, position: 'CM' },
    { id: 'c2', clubName: 'FC Locomotive', startYear: 2020, endYear: 2022, position: 'CM' },
  ];

  it('renders career entry club names', () => {
    renderDetail({ careerEntries });
    expect(screen.getByText('FC Dinamo Tbilisi')).toBeDefined();
    expect(screen.getByText('FC Locomotive')).toBeDefined();
  });

  it('renders year ranges for entries', () => {
    renderDetail({ careerEntries });
    expect(screen.getByText(/2022–2024/)).toBeDefined();
  });

  it('shows "ახლ." for entries without endYear', () => {
    renderDetail({
      careerEntries: [{ id: 'c3', clubName: 'FC Dila', startYear: 2024 }],
    });
    expect(screen.getByText(/2024–ახლ\./)).toBeDefined();
  });

  it('omits career section when no entries', () => {
    renderDetail({ careerEntries: [] });
    expect(screen.queryByText(/კარიერა/i)).toBeNull();
  });
});

describe('FootballerDetailClient — gallery', () => {
  const photos = [
    { id: 'g1', url: 'https://cdn.example.com/photo1.jpg' },
    { id: 'g2', url: 'https://cdn.example.com/photo2.jpg' },
    { id: 'g3', url: 'https://cdn.example.com/photo3.jpg' },
  ];

  it('renders gallery section heading when photos exist', () => {
    renderDetail({ galleryPhotos: photos });
    expect(screen.getByText(/გალერეა/i)).toBeDefined();
  });

  it('shows navigation buttons when more than one photo', () => {
    renderDetail({ galleryPhotos: photos });
    expect(screen.getByLabelText('წინა ფოტო')).toBeDefined();
    expect(screen.getByLabelText('შემდეგი ფოტო')).toBeDefined();
  });

  it('prev button is disabled on first photo', () => {
    renderDetail({ galleryPhotos: photos });
    expect(screen.getByLabelText('წინა ფოტო').hasAttribute('disabled')).toBe(true);
  });

  it('navigates to next photo on click', () => {
    renderDetail({ galleryPhotos: photos });
    const nextBtn = screen.getByLabelText('შემდეგი ფოტო');
    fireEvent.click(nextBtn);
    expect(screen.getByText('2/3')).toBeDefined();
  });

  it('omits navigation when only one photo', () => {
    renderDetail({ galleryPhotos: [photos[0]!] });
    expect(screen.queryByLabelText('წინა ფოტო')).toBeNull();
  });

  it('omits gallery section when no photos', () => {
    renderDetail({ galleryPhotos: [] });
    expect(screen.queryByText(/გალერეა/i)).toBeNull();
  });
});

describe('FootballerDetailClient — videos', () => {
  it('renders iframe for YouTube watch URL', () => {
    const { container } = renderDetail({
      videoLinks: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    });
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.src).toContain('/embed/dQw4w9WgXcQ');
  });

  it('renders iframe for youtu.be short URL', () => {
    const { container } = renderDetail({
      videoLinks: ['https://youtu.be/dQw4w9WgXcQ'],
    });
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.src).toContain('/embed/dQw4w9WgXcQ');
  });

  it('omits iframe for non-YouTube URLs', () => {
    const { container } = renderDetail({
      videoLinks: ['https://example.com/video.mp4'],
    });
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('omits videos section when no links provided', () => {
    renderDetail({ videoLinks: [] });
    expect(screen.queryByText(/ვიდეოები/i)).toBeNull();
  });
});

describe('FootballerDetailClient — agent section', () => {
  it('renders agent section when agentName provided', () => {
    renderDetail({ agentName: 'John Smith' });
    expect(screen.getByText('John Smith')).toBeDefined();
  });

  it('renders agent phone as tel: link', () => {
    const { container } = renderDetail({ agentPhone: '+995555123456' });
    const link = container.querySelector('a[href="tel:+995555123456"]');
    expect(link).not.toBeNull();
  });

  it('renders agent email as mailto: link', () => {
    const { container } = renderDetail({ agentEmail: 'agent@example.com' });
    const link = container.querySelector('a[href="mailto:agent@example.com"]');
    expect(link).not.toBeNull();
  });

  it('omits agent section when no agent data', () => {
    renderDetail({ agentName: undefined, agentPhone: undefined, agentEmail: undefined });
    expect(screen.queryByText(/აგენტი/i)).toBeNull();
  });
});

describe('FootballerDetailClient — sport & physical info', () => {
  it('renders height when provided', () => {
    renderDetail({ height: 182 });
    expect(screen.getByText(/182 სმ/)).toBeDefined();
  });

  it('renders weight when provided', () => {
    renderDetail({ weight: 78 });
    expect(screen.getByText(/78 კგ/)).toBeDefined();
  });

  it('renders current club', () => {
    renderDetail({ currentClub: 'FC Dila Gori' });
    expect(screen.getByText('FC Dila Gori')).toBeDefined();
  });
});

describe('FootballerDetailClient — mobile sticky actions', () => {
  it('renders sticky shortlist and chat buttons for mobile', () => {
    renderDetail();
    const shortlistBtns = screen.getAllByRole('button', { name: /შ\. სია/i });
    // At least two: header + sticky footer
    expect(shortlistBtns.length).toBeGreaterThanOrEqual(2);
  });
});
