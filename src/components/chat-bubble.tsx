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

function StatusIcon({ status, isOutgoing }: { status: ChatBubbleStatus; isOutgoing: boolean }) {
  const cls = isOutgoing ? 'text-ink-950/60' : 'text-ink-500';
  if (status === 'sent') {
    return <CheckCircleIcon size={12} className={cls} />;
  }
  return (
    <span className="inline-flex items-center -space-x-1">
      <CheckCircleIcon
        size={12}
        className={status === 'read' ? (isOutgoing ? 'text-ink-950' : 'text-ink-300') : cls}
      />
      <CheckCircleIcon
        size={12}
        className={status === 'read' ? (isOutgoing ? 'text-ink-950' : 'text-ink-300') : cls}
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
          <AvatarFallback className="bg-ink-800 text-[10px] font-semibold text-ink-300">
            {senderName ? senderName.slice(0, 2).toUpperCase() : '·'}
          </AvatarFallback>
        </Avatar>
      ) : null}
      <div
        className={cn('flex max-w-[78%] flex-col gap-1', isOutgoing ? 'items-end' : 'items-start')}
      >
        <div
          className={cn(
            'rounded-card px-4 py-2.5 text-[13.5px] leading-relaxed',
            isOutgoing
              ? 'rounded-br-sm bg-brand-400 text-ink-950'
              : 'rounded-bl-sm border border-ink-800 bg-ink-800/60 text-ink-100',
          )}
        >
          {message}
        </div>
        <div
          className={cn('flex items-center gap-1', isOutgoing ? 'flex-row-reverse' : 'flex-row')}
        >
          <time
            dateTime={sentAt.toISOString()}
            className={cn(
              'font-mono text-[10px] tabular-nums',
              isOutgoing ? 'text-ink-950/60' : 'text-ink-500',
            )}
          >
            {formatTime(sentAt)}
          </time>
          {isOutgoing && status ? <StatusIcon status={status} isOutgoing={isOutgoing} /> : null}
        </div>
      </div>
    </div>
  );
}

export { ChatBubble };
export type { ChatBubbleDirection, ChatBubbleStatus };
