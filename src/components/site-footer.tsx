import Link from 'next/link';

import { Logo } from '@/components/logo';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1">
          <Logo size="sm" showWordmark />
          <p className="text-xs text-muted-foreground">ფეხბურთელებისა და კლუბების პლატფორმა</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border/40 px-4 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sport Visa
      </div>
    </footer>
  );
}
