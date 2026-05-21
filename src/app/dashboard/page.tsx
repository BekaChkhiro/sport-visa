import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { roleDashboardPath } from '@/lib/auth/roles';

// /dashboard is a routing shim — sends verified users to their role dashboard.
// Middleware handles this at the edge; this page is the RSC fallback.
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.emailVerified) {
    redirect('/auth/signin');
  }

  redirect(roleDashboardPath(session.user.role));
}
