import * as React from 'react';

import { BellIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NotificationsBellProps = {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
};

function NotificationsBell({ unreadCount, onClick, className }: NotificationsBellProps) {
  const hasUnread = unreadCount > 0;
  const display = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={hasUnread ? `შეტყობინებები — ${unreadCount} წაუკითხავი` : 'შეტყობინებები'}
      className={cn('relative', className)}
    >
      <BellIcon className="size-5" />
      {hasUnread ? (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
        >
          {display}
        </span>
      ) : null}
    </Button>
  );
}

export { NotificationsBell };
