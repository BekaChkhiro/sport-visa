import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 sticky top-0 z-40 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Sport Visa
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">მთავარი</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">ფეხბურთელები</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">კლუბები</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
