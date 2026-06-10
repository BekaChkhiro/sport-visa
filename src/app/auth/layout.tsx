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
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-200">
      {/* Ambient glow – decorative, pointer-events off */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-brand-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-accent-400/5 blur-[120px]" />
      {children}
    </div>
  );
}
