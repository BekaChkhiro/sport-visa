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
  DeleteIcon: () => <svg />,
  LockIcon: () => <svg />,
  SearchIcon: () => <svg />,
  UnlockIcon: () => <svg />,
  UsersIcon: () => <svg />,
  XCircleIcon: () => <svg />,
}));
vi.mock('@/lib/admin/users/actions', () => ({
  banUser: vi.fn().mockResolvedValue({ status: 'success', message: 'დაბლ.' }),
  unbanUser: vi.fn().mockResolvedValue({ status: 'success', message: 'განბლ.' }),
  deleteUser: vi.fn().mockResolvedValue({ status: 'success', message: 'წაშ.' }),
}));

import { UserManagementClient } from '@/app/admin/users/user-management-client';

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'FOOTBALLER' | 'CLUB' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  emailVerified: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
  createdAt: string;
};

const BASE_USER = { name: 'Admin', initials: 'AD', email: 'admin@test.ge' };

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: 'user-1',
    email: 'giorgi@test.ge',
    firstName: 'გიორგი',
    lastName: 'მელიქიძე',
    role: 'FOOTBALLER',
    status: 'ACTIVE',
    emailVerified: null,
    verificationStatus: null,
    createdAt: '2026-05-18T10:00:00Z',
    ...overrides,
  };
}

function renderClient(
  rows: UserRow[] = [makeUser()],
  opts: {
    query?: string;
    role?: 'ALL' | 'FOOTBALLER' | 'CLUB';
    page?: number;
    pageCount?: number;
    total?: number;
  } = {},
) {
  const pageCount = opts.pageCount ?? 1;
  const total = opts.total ?? rows.length;
  return render(
    <UserManagementClient
      currentPath="/admin/users"
      userId="admin-1"
      user={BASE_USER}
      query={opts.query ?? ''}
      role={opts.role ?? 'ALL'}
      page={opts.page ?? 1}
      pageSize={20}
      usersPage={{ items: rows, total, pageCount }}
    />,
  );
}

describe('UserManagementClient — heading & subtitle', () => {
  it("renders h1 with 'მომხმარებელთა მართვა'", () => {
    renderClient();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('მომხმარებელთა მართვა')).toBeDefined();
  });

  it("renders subtitle text containing 'ბლოკირება'", () => {
    renderClient();
    expect(screen.getByText(/ბლოკირება/)).toBeDefined();
  });
});

describe('UserManagementClient — user cards', () => {
  it('renders user email', () => {
    renderClient([makeUser({ email: 'test@example.com' })]);
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it("renders user's display name (firstName + lastName joined)", () => {
    renderClient([makeUser({ firstName: 'გიორგი', lastName: 'მელიქიძე' })]);
    expect(screen.getByText('გიორგი მელიქიძე')).toBeDefined();
  });

  it("user with role FOOTBALLER shows 'ფეხბ.' badge", () => {
    renderClient([makeUser({ role: 'FOOTBALLER' })]);
    expect(screen.getByText('ფეხბ.')).toBeDefined();
  });

  it("user with role CLUB shows 'კლუბი' badge", () => {
    renderClient([makeUser({ role: 'CLUB' })]);
    expect(screen.getByText('კლუბი')).toBeDefined();
  });

  it("user with role ADMIN shows 'Admin' badge", () => {
    renderClient([makeUser({ role: 'ADMIN' })]);
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it("blocked user shows 'დაბლოკ.' badge", () => {
    renderClient([makeUser({ status: 'BLOCKED' })]);
    expect(screen.getByText('დაბლოკ.')).toBeDefined();
  });

  it("VERIFIED status shows 'VER' text", () => {
    renderClient([makeUser({ verificationStatus: 'VERIFIED' })]);
    expect(screen.getByText(/VER/)).toBeDefined();
  });

  it("PENDING status shows 'PEND' text", () => {
    renderClient([makeUser({ verificationStatus: 'PENDING' })]);
    expect(screen.getByText(/PEND/)).toBeDefined();
  });

  it("REJECTED status shows 'REJ' text", () => {
    renderClient([makeUser({ verificationStatus: 'REJECTED' })]);
    expect(screen.getByText(/REJ/)).toBeDefined();
  });
});

describe('UserManagementClient — empty state', () => {
  it("shows 'მომხმარებელი არ არის' when items=[]", () => {
    renderClient([]);
    expect(screen.getByText('მომხმარებელი არ არის')).toBeDefined();
  });

  it("shows 'ვერ მოიძებნა' when items=[] and query given", () => {
    renderClient([], { query: 'someone' });
    expect(screen.getByText('ვერ მოიძებნა')).toBeDefined();
  });
});

describe('UserManagementClient — action buttons', () => {
  it("active user shows Ban button ('ბლ.')", () => {
    renderClient([makeUser({ status: 'ACTIVE' })]);
    expect(screen.getByRole('button', { name: /ბლ\./ })).toBeDefined();
  });

  it("blocked user shows Unban button ('განბლ.') instead of ban", () => {
    renderClient([makeUser({ status: 'BLOCKED' })]);
    expect(screen.getByRole('button', { name: /განბლ\./ })).toBeDefined();
    expect(screen.queryByRole('button', { name: /^ბლ\.$/ })).toBeNull();
  });

  it('delete button is shown', () => {
    renderClient();
    expect(screen.getByRole('button', { name: /წაშ\./ })).toBeDefined();
  });

  it('ADMIN role user: Ban and Delete buttons are disabled', () => {
    renderClient([makeUser({ role: 'ADMIN', status: 'ACTIVE' })]);
    const banBtn = screen.getByRole('button', { name: /ბლ\./ });
    const deleteBtn = screen.getByRole('button', { name: /წაშ\./ });
    expect(banBtn.getAttribute('disabled')).not.toBeNull();
    expect(deleteBtn.getAttribute('disabled')).not.toBeNull();
  });

  it("clicking delete opens confirm dialog with 'მომხმარებლის წაშლა' title", () => {
    renderClient([makeUser({ role: 'FOOTBALLER' })]);
    const deleteBtn = screen.getByRole('button', { name: /წაშ\./ });
    fireEvent.click(deleteBtn);
    expect(screen.getByText('მომხმარებლის წაშლა')).toBeDefined();
  });
});

describe('UserManagementClient — pagination', () => {
  it('no pagination when pageCount=1', () => {
    renderClient([makeUser()], { pageCount: 1 });
    expect(screen.queryByRole('navigation', { name: 'გვერდები' })).toBeNull();
  });

  it("shows pagination nav 'გვერდები' when pageCount > 1", () => {
    renderClient([makeUser()], { pageCount: 2, total: 40 });
    expect(screen.getByRole('navigation', { name: 'გვერდები' })).toBeDefined();
  });
});
