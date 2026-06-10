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
    <div className="relative min-h-screen bg-ink-950 text-ink-200">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 -top-32 h-[420px] w-[420px] rounded-full bg-brand-400/8 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-iris-400/6 blur-[130px]" />
      {children}
    </div>
  );
}
