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
import { LogOutIcon, SettingsIcon, UserIcon } from '@/components/icons';
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
          'rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        <Avatar className="size-9">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-50">
        <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onProfile}>
          <UserIcon className="size-4" />
          პროფილი
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSettings}>
          <SettingsIcon className="size-4" />
          პარამეტრები
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
