import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ChatBubbleDirection = 'incoming' | 'outgoing';
type ChatBubbleStatus = 'sent' | 'delivered' | 'read';

type ChatBubbleProps = {
  message: string;
  sentAt: Date;
  direction: ChatBubbleDirection;
  status?: ChatBubbleStatus;
  senderName?: string;
  senderLogoUrl?: string;
  className?: string;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('ka', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function StatusIcon({ status }: { status: ChatBubbleStatus }) {
  if (status === 'sent') {
    return <CheckCircleIcon size={12} className="text-primary-foreground/70" />;
  }
  return (
    <span className="inline-flex items-center -space-x-1">
      <CheckCircleIcon
        size={12}
        className={cn(status === 'read' ? 'text-primary-foreground' : 'text-primary-foreground/70')}
      />
      <CheckCircleIcon
        size={12}
        className={cn(status === 'read' ? 'text-primary-foreground' : 'text-primary-foreground/70')}
      />
    </span>
  );
}

function ChatBubble({
  message,
  sentAt,
  direction,
  status,
  senderName,
  senderLogoUrl,
  className,
}: ChatBubbleProps) {
  const isOutgoing = direction === 'outgoing';

  return (
    <div
      data-slot="chat-bubble"
      data-direction={direction}
      className={cn(
        'flex w-full items-end gap-2',
        isOutgoing ? 'flex-row-reverse' : 'flex-row',
        className,
      )}
    >
      {!isOutgoing ? (
        <Avatar className="size-6 shrink-0">
          {senderLogoUrl ? <AvatarImage src={senderLogoUrl} alt={senderName ?? ''} /> : null}
          <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
            {senderName ? senderName.slice(0, 2).toUpperCase() : '·'}
          </AvatarFallback>
        </Avatar>
      ) : null}
      <div
        className={cn('flex max-w-[75%] flex-col gap-1', isOutgoing ? 'items-end' : 'items-start')}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isOutgoing
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted text-foreground',
          )}
        >
          {message}
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground',
            isOutgoing ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <time dateTime={sentAt.toISOString()}>{formatTime(sentAt)}</time>
          {isOutgoing && status ? <StatusIcon status={status} /> : null}
        </div>
      </div>
    </div>
  );
}

export { ChatBubble };
export type { ChatBubbleDirection, ChatBubbleStatus };
