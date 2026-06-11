'use client';

import { usePathname } from 'next/navigation';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

// Routes that render their own header/sidebar via AppShell. The marketing
// chrome must stay hidden there to avoid duplicate headers and footers.
const APP_SHELL_PREFIXES = [
  '/admin',
  '/auth',
  '/chat',
  '/chats',
  '/clubs',
  '/dashboard',
  '/directory',
  '/notifications',
  '/onboarding',
  '/profile',
  '/services',
  '/settings',
  '/shortlist',
  '/verification-pending',
] as const;

function isAppShellRoute(path: string): boolean {
  if (APP_SHELL_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return true;
  }
  if (path === '/posts/new') return true;
  if (/^\/posts\/[^/]+\/edit$/.test(path)) return true;
  return false;
}

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const hide = isAppShellRoute(pathname);

  if (hide) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
