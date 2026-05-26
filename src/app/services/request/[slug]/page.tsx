import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ServiceRequestFormClient } from './service-request-form-client';

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

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
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'FOOTBALLER') {
    redirect('/dashboard');
  }

  const { slug } = await params;

  const [profile, category, unreadNotifications] = await Promise.all([
    db.footballerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        positions: true,
        nationality: true,
        avatarKey: true,
        verificationStatus: true,
        profileViewCount: true,
        shortlistedBy: { select: { id: true } },
      },
    }),
    db.serviceCategory.findUnique({
      where: { slug, isActive: true },
      select: { id: true, slug: true, name: true },
    }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  if (!category) {
    notFound();
  }

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = [profile.firstName[0], profile.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <ServiceRequestFormClient
      currentPath="/services/request"
      userId={session.user.id}
      userEmail={session.user.email ?? ''}
      user={{
        name,
        initials,
        image: profile.avatarKey ? `${r2BaseUrl}/${profile.avatarKey}` : undefined,
        position: profile.positions[0] ?? undefined,
        nationality: profile.nationality ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
        profileCompletion: 100,
      }}
      stats={{
        views: profile.profileViewCount,
        saves: profile.shortlistedBy.length,
        unreadMessages: 0,
      }}
      unreadNotifications={unreadNotifications}
      category={category}
    />
  );
}
