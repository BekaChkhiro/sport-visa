'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { ChatBubble } from '@/components/chat-bubble';
import { ProfileAvatar } from '@/components/profile-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, ExternalLinkIcon, SendIcon, SpinnerIcon } from '@/components/icons';
import { usePusherChannel, usePusherEvent } from '@/hooks/use-pusher-channel';
import { channels, events } from '@/lib/pusher-client';
import type { AppSidebarStats } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';

export type ChatThreadMessage = {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type ChatThreadConversation = {
  id: string;
  clubUserId: string;
  footballerUserId: string;
  otherName: string;
  otherInitials: string;
  otherAvatarUrl?: string;
  otherProfileHref: string;
};

type ChatThreadClientProps = {
  currentPath: string;
  userId: string;
  role: 'footballer' | 'club';
  user: { name: string; initials: string; image?: string };
  conversation: ChatThreadConversation;
  initialMessages: ChatThreadMessage[];
  sidebarStats?: AppSidebarStats;
};

const MESSAGE_BODY_MAX = 2000;

type PusherNewMessagePayload = {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  createdAt: string;
};

type PusherMessagesReadPayload = {
  conversationId: string;
};

export function ChatThreadClient({
  currentPath,
  userId,
  role,
  user,
  conversation,
  initialMessages,
  sidebarStats,
}: ChatThreadClientProps) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatThreadMessage[]>(initialMessages);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Subscribe to the conversation's private chat channel so messages from
  // the other participant appear in real time without a full reload.
  const channelName = channels.chat(conversation.clubUserId, conversation.footballerUserId);
  const channel = usePusherChannel(channelName);
  usePusherEvent<PusherNewMessagePayload>(channel, events.NEW_MESSAGE, (payload) => {
    if (payload.conversationId !== conversation.id) return;
    const isIncoming = payload.senderUserId !== userId;
    setMessages((prev) => {
      if (prev.some((m) => m.id === payload.id)) return prev;
      return [
        ...prev,
        {
          id: payload.id,
          senderUserId: payload.senderUserId,
          body: payload.body,
          createdAt: payload.createdAt,
          read: payload.senderUserId === userId,
        },
      ];
    });
    // When an incoming message arrives while the user is viewing the thread,
    // immediately mark it as read in the DB so the sender sees a read receipt.
    if (isIncoming) {
      fetch(`/api/conversations/${encodeURIComponent(conversation.id)}/read`, {
        method: 'POST',
      }).catch(() => undefined);
    }
  });

  // When the other party opens the thread their client calls the read API which
  // triggers MESSAGES_READ. Update our outgoing messages to show as read.
  usePusherEvent<PusherMessagesReadPayload>(channel, events.MESSAGES_READ, (payload) => {
    if (payload.conversationId !== conversation.id) return;
    setMessages((prev) => prev.map((m) => (m.senderUserId === userId ? { ...m, read: true } : m)));
  });

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  async function handleSend(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    if (body.length > MESSAGE_BODY_MAX) {
      setError(`შეტყობინება ვერ აღემატება ${MESSAGE_BODY_MAX} სიმბოლოს`);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/conversations/${encodeURIComponent(conversation.id)}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        },
      );
      if (!res.ok) {
        let message = 'შეტყობინების გაგზავნა ვერ მოხერხდა';
        try {
          const data = (await res.json()) as { error?: { message?: string } };
          if (data.error?.message) message = data.error.message;
        } catch {
          // Body wasn't JSON; keep the default message.
        }
        setError(message);
        return;
      }
      const data = (await res.json()) as { message: ChatThreadMessage };
      setMessages((prev) =>
        prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message],
      );
      setDraft('');
    } catch {
      setError('ქსელის შეცდომა — სცადეთ თავიდან');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const remaining = MESSAGE_BODY_MAX - draft.length;
  const overLimit = remaining < 0;
  const canSend = !sending && draft.trim().length > 0 && !overLimit;

  return (
    <AppShell
      role={role}
      currentPath={currentPath}
      userId={userId}
      user={user}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col rounded-xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            asChild
            aria-label="ჩატების სიაში დაბრუნება"
          >
            <Link href="/chats">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <ProfileAvatar
            src={conversation.otherAvatarUrl}
            fallback={conversation.otherInitials}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{conversation.otherName}</p>
          </div>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={conversation.otherProfileHref} className="inline-flex items-center gap-1.5">
              <span>პროფილი</span>
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4" data-testid="chat-thread-messages">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-sm">ჯერ შეტყობინებები არ არის.</p>
              <p className="text-xs">დაიწყე საუბარი ქვემოთ.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const isOutgoing = m.senderUserId === userId;
                return (
                  <ChatBubble
                    key={m.id}
                    message={m.body}
                    sentAt={new Date(m.createdAt)}
                    direction={isOutgoing ? 'outgoing' : 'incoming'}
                    status={isOutgoing ? (m.read ? 'read' : 'sent') : undefined}
                    senderName={isOutgoing ? user.name : conversation.otherName}
                    senderLogoUrl={isOutgoing ? user.image : conversation.otherAvatarUrl}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-border px-4 py-3">
          {error ? (
            <p role="alert" className="mb-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="შეტყობინება…"
              aria-label="შეტყობინების ტექსტი"
              maxLength={MESSAGE_BODY_MAX + 200}
              rows={2}
              className="min-h-12 resize-none"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="გაგზავნა"
              disabled={!canSend}
              className="shrink-0"
            >
              {sending ? (
                <SpinnerIcon className="size-4 animate-spin" />
              ) : (
                <SendIcon className="size-4" />
              )}
            </Button>
          </div>
          <p
            className={cn(
              'mt-1.5 text-[11px] text-muted-foreground',
              overLimit && 'text-destructive',
            )}
          >
            {overLimit
              ? `${-remaining} სიმბოლოთი ლიმიტს ზემოთ — მაქს. ${MESSAGE_BODY_MAX}`
              : `მაქს. ${MESSAGE_BODY_MAX} სიმბოლო · Enter — გასაგზავნი, Shift+Enter — ახალ. ხაზი`}
          </p>
        </form>
      </div>
    </AppShell>
  );
}
