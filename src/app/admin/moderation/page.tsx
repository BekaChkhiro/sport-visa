import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { listPosts, listConversations } from '@/lib/admin/moderation/actions';
import { ModerationClient } from './moderation-client';

export const metadata: Metadata = {
  title: 'მოდ. ინსტრ. · Admin',
};

const PAGE_SIZE = 20;

type Tab = 'posts' | 'chats';

function str(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  return s || undefined;
}

function parseTab(raw: string | undefined): Tab {
  if (raw === 'chats') return 'chats';
  return 'posts';
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const sp = await searchParams;
  const tab = parseTab(str(sp.tab));
  const query = str(sp.q);
  const page = parsePage(str(sp.page));

  const [pendingVerifications, pendingServiceRequests, postsPage, chatsPage] = await Promise.all([
    db.footballerProfile
      .count({ where: { verificationStatus: 'PENDING' } })
      .then(
        async (f) => f + (await db.clubProfile.count({ where: { verificationStatus: 'PENDING' } })),
      ),
    db.serviceRequest.count({ where: { status: 'PENDING' } }),
    listPosts({ query, page: tab === 'posts' ? page : 1, pageSize: PAGE_SIZE }),
    listConversations({ query, page: tab === 'chats' ? page : 1, pageSize: PAGE_SIZE }),
  ]);

  const adminName = session.user.name ?? session.user.email ?? 'Admin';
  const initials =
    adminName
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase() || 'A';

  return (
    <ModerationClient
      currentPath="/admin/moderation"
      userId={session.user.id}
      user={{ name: adminName, initials, email: session.user.email ?? undefined }}
      tab={tab}
      query={query ?? ''}
      page={page}
      pageSize={PAGE_SIZE}
      postsPage={postsPage}
      chatsPage={chatsPage}
      pendingVerifications={pendingVerifications}
      pendingServiceRequests={pendingServiceRequests}
    />
  );
}
