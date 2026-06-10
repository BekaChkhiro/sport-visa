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
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        isActive ? 'bg-ink-800' : 'hover:bg-ink-800/50',
        className,
      )}
    >
      <Avatar className="size-10 rounded-md shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} className="rounded-md" /> : null}
        <AvatarFallback className="rounded-md bg-ink-800 text-xs font-semibold text-ink-300">
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-ink-50">{name}</span>
          {lastMessageAt ? (
            <time
              dateTime={lastMessageAt.toISOString()}
              className="shrink-0 font-mono text-[10px] tabular-nums text-ink-500"
            >
              {formatRelativeTime(lastMessageAt)}
            </time>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {lastMessage ? (
            <p className="line-clamp-2 flex-1 text-xs text-ink-400">{lastMessage}</p>
          ) : (
            <span className="flex-1 text-xs italic text-ink-500">ჯერ შეტყობინებების გარეშე</span>
          )}
          {unreadCount > 0 ? (
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-[10px] font-bold text-ink-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export { ChatListItem };
