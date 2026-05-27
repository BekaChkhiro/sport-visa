import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { MyRequestsClient } from './my-requests-client';

export const metadata: Metadata = {
  title: 'ჩემი სერვ. მოთხოვნები',
};

export default async function MyRequestsPage() {
  const shell = await requireAppShellContext('/services/my-requests');

  if (shell.role !== 'footballer') {
    redirect('/dashboard');
  }

  const serviceRequests = await db.serviceRequest.findMany({
    where: { userId: shell.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      requestCode: true,
      status: true,
      createdAt: true,
      startDate: true,
      endDate: true,
      notes: true,
      adminNote: true,
      contactPref: true,
      category: {
        select: { id: true, name: true, slug: true, icon: true },
      },
    },
  });

  const requests = serviceRequests.map((r) => ({
    id: r.id,
    requestCode: r.requestCode,
    status: r.status as 'PENDING' | 'RESOLVED' | 'REJECTED',
    createdAt: r.createdAt.toISOString(),
    startDate: r.startDate ? r.startDate.toISOString() : null,
    endDate: r.endDate ? r.endDate.toISOString() : null,
    notes: r.notes,
    adminNote: r.adminNote,
    contactPref: r.contactPref,
    category: r.category,
  }));

  return (
    <MyRequestsClient
      currentPath="/services/my-requests"
      userId={shell.userId}
      user={{
        ...shell.user,
        profileCompletion: shell.user.profileCompletion ?? 0,
      }}
      stats={shell.sidebarStats ?? {}}
      unreadNotifications={shell.unreadNotifications}
      requests={requests}
    />
  );
}
