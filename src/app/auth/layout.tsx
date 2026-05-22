import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

// Auth pages are unauthenticated-only. If a session exists we kick the user
// straight to their role dashboard (admin → /admin, club → /dashboard/club,
// footballer → /dashboard/footballer).
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) {
    if (!session.user.emailVerified) {
      redirect('/verification-pending');
    }
    const role = session.user.role;
    if (role === 'ADMIN') redirect('/admin');
    if (role === 'CLUB') redirect('/dashboard/club');
    redirect('/dashboard/footballer');
  }
  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
