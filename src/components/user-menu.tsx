'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, LogOutIcon, SettingsIcon, UserIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type UserMenuUser = {
  name: string;
  image?: string;
  initials: string;
};

type UserMenuProps = {
  user: UserMenuUser;
  onProfile?: () => void;
  onSettings?: () => void;
  onSignOut: () => void;
  className?: string;
};

function UserMenu({ user, onProfile, onSettings, onSignOut, className }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`მომხმარებლის მენიუ — ${user.name}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-950/50 py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
          className,
        )}
      >
        <Avatar className="size-7">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
          <AvatarFallback className="bg-ink-800 text-ink-200 text-xs font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="size-3.5 text-ink-500" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-50 border-ink-800 bg-ink-900">
        <DropdownMenuLabel className="truncate text-ink-200">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-ink-800" />
        <DropdownMenuItem
          onSelect={onProfile}
          className="text-ink-200 focus:bg-ink-800 focus:text-ink-50"
        >
          <UserIcon className="size-4" />
          პროფილი
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onSettings}
          className="text-ink-200 focus:bg-ink-800 focus:text-ink-50"
        >
          <SettingsIcon className="size-4" />
          პარამეტრები
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-ink-800" />
        <DropdownMenuItem onSelect={onSignOut} variant="destructive">
          <LogOutIcon className="size-4" />
          გამოსვლა
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
export type { UserMenuUser };
