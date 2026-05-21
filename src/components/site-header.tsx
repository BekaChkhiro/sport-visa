import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:h-16">
        <Link href="/" className="flex items-center" aria-label="Sport Visa — home">
          <Logo size="md" showWordmark />
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="default" asChild>
            <Link href="/auth/signin">შესვლა</Link>
          </Button>
          <Button variant="default" size="default" asChild>
            <Link href="/auth/signup">რეგისტრაცია</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
