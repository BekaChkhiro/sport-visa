import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { roleDashboardPath } from '@/lib/auth/roles';
import { db } from '@/lib/db';

// Belt-and-suspenders RSC guard — middleware handles the common case at the
// edge, but this catches any gap (e.g. direct RSC fetch without middleware).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!session.user.emailVerified) {
    redirect('/verification-pending');
  }

  // ADMIN users have no /dashboard/* route — send them to /admin.
  if (session.user.role === 'ADMIN') {
    redirect(roleDashboardPath(session.user.role));
  }

  // Redirect to onboarding if the user hasn't created their profile yet.
  const userId = session.user.id;
  const role = session.user.role;
  const hasProfile =
    role === 'FOOTBALLER'
      ? await db.footballerProfile.findUnique({ where: { userId }, select: { id: true } })
      : await db.clubProfile.findUnique({ where: { userId }, select: { id: true } });

  if (!hasProfile) {
    redirect('/onboarding');
  }

  return <>{children}</>;
}
