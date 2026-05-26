import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { listUsers } from '@/lib/admin/users/actions';
import { UserManagementClient } from './user-management-client';

export const metadata: Metadata = {
  title: 'User management · Admin',
};

const PAGE_SIZE = 20;

type RoleFilter = 'ALL' | 'FOOTBALLER' | 'CLUB';

function str(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  return s || undefined;
}

function parseRole(raw: string | undefined): RoleFilter {
  if (raw === 'FOOTBALLER' || raw === 'CLUB') return raw;
  return 'ALL';
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const sp = await searchParams;
  const query = str(sp.q);
  const role = parseRole(str(sp.role));
  const page = parsePage(str(sp.page));

  const usersPage = await listUsers({ query, role, page, pageSize: PAGE_SIZE });

  const adminName = session.user.name ?? session.user.email ?? 'Admin';
  const initials =
    adminName
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase() || 'A';

  return (
    <UserManagementClient
      currentPath="/admin/users"
      userId={session.user.id}
      user={{ name: adminName, initials, email: session.user.email ?? undefined }}
      query={query ?? ''}
      role={role}
      page={page}
      pageSize={PAGE_SIZE}
      usersPage={usersPage}
    />
  );
}
