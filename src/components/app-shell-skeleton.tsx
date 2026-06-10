import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Skeleton } from '@/components/ui/skeleton';

// Sidebar + header skeleton that mirrors the real AppShell shape so a
// `loading.tsx` rendered before the page component mounts still shows the
// dashboard chrome. The sidebar variant is role-agnostic (footballer is the
// largest layout, so we use it as the default skeleton).
//
// Pass the page-specific content skeleton as children — it renders inside
// the main area, just like in the real AppShell.
export function AppShellSkeleton({
  variant = 'footballer',
  children,
}: {
  variant?: 'footballer' | 'club' | 'admin';
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink-800 bg-ink-900/85 px-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-btn bg-ink-800 lg:hidden" />
          <Link href="/dashboard" className="flex items-center" aria-label="Sport Visa">
            <Logo size="md" showWordmark />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-btn bg-ink-800" />
          <Skeleton className="h-8 w-20 rounded-pill bg-ink-800" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-ink-800 bg-ink-950 px-4 py-6 lg:block">
          {variant === 'footballer' ? <FootballerSidebarSkeleton /> : null}
          {variant === 'club' ? <ClubSidebarSkeleton /> : null}
          {variant === 'admin' ? <AdminSidebarSkeleton /> : null}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function FootballerSidebarSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center gap-2 px-3 py-2 text-center">
        <Skeleton className="size-20 rounded-full bg-ink-800" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32 bg-ink-800" />
          <Skeleton className="h-3 w-20 bg-ink-800" />
        </div>
        <div className="w-full space-y-1">
          <Skeleton className="h-2 w-full rounded-full bg-ink-800" />
          <Skeleton className="h-3 w-28 bg-ink-800" />
        </div>
        <div className="flex w-full gap-2">
          <Skeleton className="h-8 flex-1 rounded-btn bg-ink-800" />
          <Skeleton className="h-8 flex-1 rounded-btn bg-ink-800" />
        </div>
      </div>

      <hr className="my-4 border-ink-800" />

      <Skeleton className="mx-3 mb-2 h-3 w-32 bg-ink-800" />
      <nav className="flex flex-col gap-1 px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="mx-2 h-9 rounded-btn bg-ink-800" />
        ))}
      </nav>

      <hr className="my-4 border-ink-800" />

      <Skeleton className="mx-3 mb-2 h-3 w-24 bg-ink-800" />
      <ul className="flex flex-col gap-2 px-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center gap-2">
            <Skeleton className="size-4 bg-ink-800" />
            <Skeleton className="h-3 w-8 bg-ink-800" />
            <Skeleton className="h-3 w-14 bg-ink-800" />
          </li>
        ))}
      </ul>
    </>
  );
}

function ClubSidebarSkeleton() {
  return (
    <>
      <div className="flex flex-col items-start gap-2 px-3 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-md bg-ink-800" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 bg-ink-800" />
            <Skeleton className="h-3 w-20 bg-ink-800" />
          </div>
        </div>
        <div className="flex w-full gap-2">
          <Skeleton className="h-8 flex-1 rounded-btn bg-ink-800" />
          <Skeleton className="h-8 flex-1 rounded-btn bg-ink-800" />
        </div>
      </div>

      <hr className="my-4 border-ink-800" />

      <Skeleton className="mx-3 mb-2 h-3 w-32 bg-ink-800" />
      <nav className="flex flex-col gap-1 px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="mx-2 h-9 rounded-btn bg-ink-800" />
        ))}
      </nav>

      <hr className="my-4 border-ink-800" />

      <Skeleton className="mx-3 mb-2 h-3 w-28 bg-ink-800" />
      <div className="flex items-center gap-2 px-3">
        <Skeleton className="size-4 bg-ink-800" />
        <Skeleton className="h-3 w-8 bg-ink-800" />
        <Skeleton className="h-3 w-16 bg-ink-800" />
      </div>
    </>
  );
}

function AdminSidebarSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center gap-2 px-3 py-2 text-center">
        <Skeleton className="size-12 rounded-full bg-ink-800" />
        <Skeleton className="h-4 w-24 bg-ink-800" />
        <Skeleton className="h-3 w-12 bg-ink-800" />
      </div>

      <hr className="my-4 border-ink-800" />

      <nav className="flex flex-col gap-1 px-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mx-2 h-9 rounded-btn bg-ink-800" />
        ))}
      </nav>
    </>
  );
}
