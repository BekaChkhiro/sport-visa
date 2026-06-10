import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { Logo } from '@/components/logo';

const FOOTER_COLS = [
  {
    heading: 'პლატფორმა',
    links: [
      { href: '#footballer', label: 'ფეხბურთელებს' },
      { href: '#club', label: 'კლუბებს' },
      { href: '#features', label: 'ფუნქციები' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'კომპანია',
    links: [
      { href: '/about', label: 'ჩვენ შესახებ' },
      { href: '/contact', label: 'კონტაქტი' },
    ],
  },
  {
    heading: 'სამართალი',
    links: [
      { href: '/privacy', label: 'კონფიდენციალურობა' },
      { href: '/terms', label: 'პირობები' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" showWordmark />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-500">
              ქართული პლატფორმა, რომელიც ფეხბურთელებსა და კლუბებს ერთ სივრცეში ხვდება.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(({ heading, links }) => (
            <div key={heading}>
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-500">
                {heading}
              </div>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[13px] text-ink-400 transition-colors hover:text-ink-100"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-800 pt-6 text-[13px] text-ink-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Sport Visa. ყველა უფლება დაცულია.</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            საქართველო · ქართული
          </span>
        </div>
      </div>
    </footer>
  );
}
