import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { roleDashboardPath } from '@/lib/auth/roles';

// Belt-and-suspenders RSC guard for admin routes.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!session.user.emailVerified) {
    redirect('/verification-pending');
  }

  if (session.user.role !== 'ADMIN') {
    redirect(roleDashboardPath(session.user.role));
  }

  return <>{children}</>;
}
