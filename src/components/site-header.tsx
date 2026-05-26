'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { MobileNavDrawer } from '@/components/mobile-nav-drawer';

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:h-16">
        <Link href="/" className="flex items-center" aria-label="Sport Visa — home">
          <Logo size="md" showWordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" size="default" asChild>
            <Link href="/auth/signin">შესვლა</Link>
          </Button>
          <Button variant="default" size="default" asChild>
            <Link href="/auth/signup">რეგისტრაცია</Link>
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="მენიუ"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
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
