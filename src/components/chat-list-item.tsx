'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

type ChatListItemProps = {
  conversationId: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  isActive?: boolean;
  onClick?: (conversationId: string) => void;
  className?: string;
};

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function ChatListItem({
  conversationId,
  name,
  avatarUrl,
  lastMessage,
  lastMessageAt,
  unreadCount,
  isActive,
  onClick,
  className,
}: ChatListItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      data-slot="chat-list-item"
      onClick={() => onClick?.(conversationId)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
        className,
      )}
    >
      <Avatar className="size-10 rounded-md shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} className="rounded-md" /> : null}
        <AvatarFallback className="rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          {lastMessageAt ? (
            <time
              dateTime={lastMessageAt.toISOString()}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {formatRelativeTime(lastMessageAt)}
            </time>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {lastMessage ? (
            <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">{lastMessage}</p>
          ) : (
            <span className="flex-1 text-xs italic text-muted-foreground">
              ჯერ შეტყობინებების გარეშე
            </span>
          )}
          {unreadCount > 0 ? (
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export { ChatListItem };
