import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { roleDashboardPath } from '@/lib/auth/roles';

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

  return <>{children}</>;
}
