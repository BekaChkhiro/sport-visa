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
  ClockIcon: () => <svg />,
  DeleteIcon: () => <svg />,
  FlagIcon: () => <svg />,
  HeartIcon: () => <svg />,
  MessageCircleIcon: () => <svg />,
  SearchIcon: () => <svg />,
}));
vi.mock('@/lib/admin/moderation/actions', () => ({
  deletePost: vi.fn().mockResolvedValue({ status: 'success', message: 'პოსტი წაშლილია' }),
  deleteConversation: vi.fn().mockResolvedValue({ status: 'success', message: 'საუბარი წაშლილია' }),
}));

import { ModerationClient } from '@/app/admin/moderation/moderation-client';

type PostRow = {
  id: string;
  title: string;
  bodyPreview: string;
  clubId: string;
  clubName: string;
  likeCount: number;
  createdAt: string;
};

type ConversationRow = {
  id: string;
  clubUserEmail: string;
  clubName: string | null;
  footballerUserEmail: string;
  footballerName: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
};

type ModerationPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const BASE_USER = { name: 'Admin', initials: 'AD', email: 'admin@test.ge' };

function makePost(overrides: Partial<PostRow> = {}): PostRow {
  return {
    id: 'post-1',
    title: 'სატესტო პოსტი',
    bodyPreview: 'ეს არის პოსტის შინაარსი.',
    clubId: 'club-1',
    clubName: 'დინამო',
    likeCount: 5,
    createdAt: '2026-05-01T10:00:00Z',
    ...overrides,
  };
}

function makeChat(overrides: Partial<ConversationRow> = {}): ConversationRow {
  return {
    id: 'chat-1',
    clubUserEmail: 'club@test.ge',
    clubName: 'ლოკომოტივი',
    footballerUserEmail: 'player@test.ge',
    footballerName: 'ლუკა ბ.',
    messageCount: 3,
    lastMessageAt: '2026-05-10T12:00:00Z',
    createdAt: '2026-05-05T08:00:00Z',
    ...overrides,
  };
}

function emptyPostsPage(overrides: Partial<ModerationPage<PostRow>> = {}): ModerationPage<PostRow> {
  return { items: [], total: 0, page: 1, pageSize: 20, pageCount: 1, ...overrides };
}

function emptyChatsPage(
  overrides: Partial<ModerationPage<ConversationRow>> = {},
): ModerationPage<ConversationRow> {
  return { items: [], total: 0, page: 1, pageSize: 20, pageCount: 1, ...overrides };
}

type RenderOptions = {
  tab?: 'posts' | 'chats';
  query?: string;
  page?: number;
  pageSize?: number;
  postsPage?: ModerationPage<PostRow>;
  chatsPage?: ModerationPage<ConversationRow>;
  pendingVerifications?: number;
  pendingServiceRequests?: number;
};

function renderClient(overrides: RenderOptions = {}) {
  const tab = overrides.tab ?? 'posts';
  const postsPage = overrides.postsPage ?? {
    items: [makePost()],
    total: 1,
    page: 1,
    pageSize: 20,
    pageCount: 1,
  };
  const chatsPage = overrides.chatsPage ?? {
    items: [makeChat()],
    total: 1,
    page: 1,
    pageSize: 20,
    pageCount: 1,
  };

  return render(
    <ModerationClient
      currentPath="/admin/moderation"
      userId="admin-1"
      user={BASE_USER}
      tab={tab}
      query={overrides.query ?? ''}
      page={overrides.page ?? 1}
      pageSize={overrides.pageSize ?? 20}
      postsPage={postsPage}
      chatsPage={chatsPage}
      pendingVerifications={overrides.pendingVerifications ?? 0}
      pendingServiceRequests={overrides.pendingServiceRequests ?? 0}
    />,
  );
}

describe('ModerationClient — heading', () => {
  it('renders h1 with მოდ. ინსტრუმენტები', () => {
    renderClient();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('მოდ. ინსტრუმენტები');
  });

  it('renders subtitle containing პოსტებისა', () => {
    renderClient();
    expect(screen.getByText(/პოსტებისა/)).toBeDefined();
  });

  it('app-shell wrapper is present', () => {
    renderClient();
    expect(screen.getByTestId('app-shell')).toBeDefined();
  });
});

describe('ModerationClient — tabs', () => {
  it('shows პოსტები and ჩატები tabs', () => {
    renderClient();
    expect(screen.getByRole('tab', { name: 'პოსტები' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'ჩატები' })).toBeDefined();
  });

  it('posts tab is aria-selected=true when tab=posts', () => {
    renderClient({ tab: 'posts' });
    const postsTab = screen.getByRole('tab', { name: 'პოსტები' });
    expect(postsTab.getAttribute('aria-selected')).toBe('true');
  });

  it('chats tab is aria-selected=true when tab=chats', () => {
    renderClient({ tab: 'chats' });
    const chatsTab = screen.getByRole('tab', { name: 'ჩატები' });
    expect(chatsTab.getAttribute('aria-selected')).toBe('true');
  });
});

describe('ModerationClient — posts tab content', () => {
  it('renders post title', () => {
    renderClient({ tab: 'posts' });
    expect(screen.getByText('სატესტო პოსტი')).toBeDefined();
  });

  it('renders club name badge', () => {
    renderClient({ tab: 'posts' });
    expect(screen.getByText('დინამო')).toBeDefined();
  });

  it('renders body preview text', () => {
    renderClient({ tab: 'posts' });
    expect(screen.getByText('ეს არის პოსტის შინაარსი.')).toBeDefined();
  });

  it('delete button is shown', () => {
    renderClient({ tab: 'posts' });
    expect(screen.getByRole('button', { name: /წაშ\./ })).toBeDefined();
  });
});

describe('ModerationClient — chats tab content', () => {
  it('renders clubName and footballerName', () => {
    renderClient({ tab: 'chats' });
    expect(screen.getByText('ლოკომოტივი')).toBeDefined();
    expect(screen.getByText('ლუკა ბ.')).toBeDefined();
  });

  it('renders messageCount with შეტ. suffix', () => {
    renderClient({ tab: 'chats' });
    expect(screen.getByText('3 შეტ.')).toBeDefined();
  });

  it('delete button is shown', () => {
    renderClient({ tab: 'chats' });
    expect(screen.getByRole('button', { name: /წაშ\./ })).toBeDefined();
  });

  it('falls back to clubUserEmail when clubName is null', () => {
    renderClient({
      tab: 'chats',
      chatsPage: {
        items: [makeChat({ clubName: null })],
        total: 1,
        page: 1,
        pageSize: 20,
        pageCount: 1,
      },
    });
    expect(screen.getByText('club@test.ge')).toBeDefined();
  });
});

describe('ModerationClient — empty states', () => {
  it('shows პოსტი არ არის when posts tab and no items', () => {
    renderClient({ tab: 'posts', postsPage: emptyPostsPage() });
    expect(screen.getByText('პოსტი არ არის')).toBeDefined();
  });

  it('shows ჩატი არ არის when chats tab and no items', () => {
    renderClient({ tab: 'chats', chatsPage: emptyChatsPage() });
    expect(screen.getByText('ჩატი არ არის')).toBeDefined();
  });

  it('shows ვერ მოიძებნა when posts tab, no items, and query given', () => {
    renderClient({ tab: 'posts', postsPage: emptyPostsPage(), query: 'ძიება' });
    expect(screen.getByText('ვერ მოიძებნა')).toBeDefined();
  });
});

describe('ModerationClient — delete dialog', () => {
  it('clicking delete on a post opens confirm dialog with წაშლის დადასტურება', () => {
    renderClient({ tab: 'posts' });
    fireEvent.click(screen.getByRole('button', { name: /წაშ\./ }));
    expect(screen.getByText('წაშლის დადასტურება')).toBeDefined();
  });

  it('clicking cancel dismisses dialog', () => {
    renderClient({ tab: 'posts' });
    fireEvent.click(screen.getByRole('button', { name: /წაშ\./ }));
    expect(screen.getByText('წაშლის დადასტურება')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'გაუქმება' }));
    expect(screen.queryByText('წაშლის დადასტურება')).toBeNull();
  });
});

describe('ModerationClient — pagination', () => {
  it('no pagination when pageCount=1', () => {
    renderClient({ tab: 'posts' });
    expect(screen.queryByRole('navigation', { name: 'გვერდები' })).toBeNull();
  });

  it('shows pagination nav გვერდები when pageCount > 1', () => {
    renderClient({
      tab: 'posts',
      postsPage: { items: [makePost()], total: 40, page: 1, pageSize: 20, pageCount: 2 },
    });
    expect(screen.getByRole('navigation', { name: 'გვერდები' })).toBeDefined();
  });
});
