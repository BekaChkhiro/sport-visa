'use client';

import * as React from 'react';
import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MobileNavRole = 'public' | 'footballer' | 'club' | 'admin';

type MobileNavUser = {
  name: string;
  initials: string;
  image?: string;
};

type NavLink = {
  href: string;
  label: string;
};

type MobileNavDrawerProps = {
  role: MobileNavRole;
  currentPath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: MobileNavUser;
  className?: string;
};

const LINKS: Record<MobileNavRole, NavLink[]> = {
  public: [{ href: '/', label: 'მთავარი' }],
  footballer: [
    { href: '/dashboard/footballer', label: 'პანელი' },
    { href: '/clubs', label: 'კლუბები' },
    { href: '/services/request', label: 'სერვისები' },
    { href: '/services/my-requests', label: 'ჩემი მოთხოვნები' },
    { href: '/chats', label: 'ჩატები' },
    { href: '/notifications', label: 'შეტყობინებები' },
    { href: '/profile/edit', label: 'პროფილი' },
  ],
  club: [
    { href: '/dashboard/club', label: 'პანელი' },
    { href: '/directory', label: 'მოთამაშეები' },
    { href: '/shortlist', label: 'შერჩეულები' },
    { href: '/chats', label: 'ჩატები' },
    { href: '/notifications', label: 'შეტყობინებები' },
    { href: '/profile/club/edit', label: 'პროფილი' },
  ],
  admin: [
    { href: '/admin', label: 'პანელი' },
    { href: '/admin/verification', label: 'ვერიფიკაცია' },
    { href: '/admin/service-requests', label: 'სერვ. მოთხ.' },
    { href: '/admin/users', label: 'მომხმარებლები' },
    { href: '/admin/moderation', label: 'მოდერ.' },
    { href: '/admin/ref-data', label: 'სცნ. მონ.' },
  ],
};

function profilePathFor(role: MobileNavRole): string {
  if (role === 'club') return '/profile/club/edit';
  if (role === 'admin') return '/admin';
  return '/profile/edit';
}

function MobileNavDrawer({
  role,
  currentPath,
  open,
  onOpenChange,
  user,
  className,
}: MobileNavDrawerProps) {
  const links = LINKS[role];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn('flex w-80 flex-col gap-0 sm:max-w-sm', className)}>
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center">
            <Logo size="md" showWordmark />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col">
            {links.map((link) => {
              const isActive = currentPath === link.href || currentPath.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center px-6 py-4 text-xl leading-snug transition-colors',
                      isActive ? 'font-semibold text-primary' : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{user.name}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={profilePathFor(role)} onClick={() => onOpenChange(false)}>
                  პროფილი
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="default" size="lg" asChild>
                <Link href="/auth/signup" onClick={() => onOpenChange(false)}>
                  რეგისტრაცია
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/signin" onClick={() => onOpenChange(false)}>
                  შესვლა
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileNavDrawer };
export type { MobileNavRole, MobileNavUser };
