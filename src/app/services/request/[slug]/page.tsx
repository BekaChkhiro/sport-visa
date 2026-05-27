import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { ServiceRequestFormClient } from './service-request-form-client';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.serviceCategory.findUnique({
    where: { slug },
    select: { name: true },
  });
  return { title: category ? `${category.name} — სერვისის მოთხოვნა` : 'სერვისის მოთხოვნა' };
}

export default async function ServiceRequestFormPage({ params }: Props) {
  const { slug } = await params;
  const shell = await requireAppShellContext(`/services/request/${slug}`);

  if (shell.role !== 'footballer') {
    redirect('/dashboard');
  }

  const category = await db.serviceCategory.findUnique({
    where: { slug, isActive: true },
    select: { id: true, slug: true, name: true },
  });

  if (!category) {
    notFound();
  }

  return (
    <ServiceRequestFormClient
      currentPath="/services/request"
      userId={shell.userId}
      userEmail={shell.user.email ?? ''}
      user={{
        ...shell.user,
        profileCompletion: shell.user.profileCompletion ?? 0,
      }}
      stats={shell.sidebarStats ?? {}}
      unreadNotifications={shell.unreadNotifications}
      category={category}
    />
  );
}
