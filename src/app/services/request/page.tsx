import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { ServiceCategoriesClient } from './service-categories-client';

export const metadata: Metadata = {
  title: 'სერვისის მოთხოვნა',
};

export default async function ServiceRequestPage() {
  const shell = await requireAppShellContext('/services/request');

  if (shell.role !== 'footballer') {
    redirect('/dashboard');
  }

  const categories = await db.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      description: true,
    },
  });

  return (
    <ServiceCategoriesClient
      currentPath="/services/request"
      userId={shell.userId}
      user={{
        ...shell.user,
        profileCompletion: shell.user.profileCompletion ?? 0,
      }}
      stats={shell.sidebarStats ?? {}}
      unreadNotifications={shell.unreadNotifications}
      categories={categories}
    />
  );
}
