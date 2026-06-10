'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronRight } from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { MobileNavDrawer } from '@/components/mobile-nav-drawer';

const NAV_LINKS = [
  { href: '#features', label: 'პლატფორმა' },
  { href: '#footballer', label: 'ფეხბურთელებს' },
  { href: '#club', label: 'კლუბებს' },
] as const;

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8">
        {/* Logo + nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="Sport Visa — home">
            <Logo size="md" showWordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="cursor-pointer text-sm font-medium text-ink-400 transition-colors hover:text-ink-100"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="default"
            asChild
            className="hidden rounded-btn px-3.5 py-2 text-[13.5px] font-medium text-ink-400 hover:bg-ink-800 hover:text-ink-200 sm:inline-flex"
          >
            <Link href="/auth/signin">შესვლა</Link>
          </Button>
          <Button
            variant="default"
            size="default"
            asChild
            className="hidden rounded-btn px-3.5 py-2 text-[13.5px] font-medium sm:inline-flex"
          >
            <Link href="/auth/signup" className="inline-flex items-center gap-1">
              რეგისტრაცია
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-ink-400 hover:bg-ink-800 hover:text-ink-200"
            aria-label="მენიუ"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileNavDrawer
        role="public"
        currentPath={pathname}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </header>
  );
}
