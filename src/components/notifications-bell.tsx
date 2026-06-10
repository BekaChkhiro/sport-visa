import * as React from 'react';

import { BellIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type NotificationsBellProps = {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
};

function NotificationsBell({ unreadCount, onClick, className }: NotificationsBellProps) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hasUnread ? `შეტყობინებები — ${unreadCount} წაუკითხავი` : 'შეტყობინებები'}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-btn text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
        className,
      )}
    >
      <BellIcon className="size-5" />
      {hasUnread ? (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-400 ring-2 ring-ink-900"
        />
      ) : null}
    </button>
  );
}

export { NotificationsBell };
