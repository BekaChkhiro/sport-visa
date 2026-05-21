import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

import { FootballerWizard } from './footballer-wizard';
import { ClubWizard } from './club-wizard';

export const metadata: Metadata = {
  title: 'პროფილის შევსება',
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true },
  });

  const displayName = [dbUser?.firstName, dbUser?.lastName].filter(Boolean).join(' ');

  if (session.user.role === 'FOOTBALLER') {
    return <FootballerWizard displayName={displayName} />;
  }

  if (session.user.role === 'CLUB') {
    return <ClubWizard displayName={displayName} />;
  }

  redirect('/dashboard');
}
