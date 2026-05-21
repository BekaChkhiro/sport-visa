import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { roleDashboardPath } from '@/lib/auth/roles';

// Guard: must be authenticated and email-verified to see onboarding.
// If a profile already exists, redirect to the role dashboard.
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!session.user.emailVerified) {
    redirect('/verification-pending');
  }

  const role = session.user.role;
  const userId = session.user.id;

  if (role === 'ADMIN') {
    redirect('/admin');
  }

  // If profile already exists, skip onboarding.
  const hasProfile =
    role === 'FOOTBALLER'
      ? await db.footballerProfile.findUnique({ where: { userId }, select: { id: true } })
      : await db.clubProfile.findUnique({ where: { userId }, select: { id: true } });

  if (hasProfile) {
    redirect(roleDashboardPath(role));
  }

  return (
    <div className="min-h-[calc(100vh-9rem)] py-8 px-4">
      <div className="max-w-2xl mx-auto">{children}</div>
    </div>
  );
}
