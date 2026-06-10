'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { ChatBubble } from '@/components/chat-bubble';
import { ProfileAvatar } from '@/components/profile-avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ExternalLinkIcon, SendIcon, SpinnerIcon } from '@/components/icons';
import { usePusherChannel, usePusherEvent } from '@/hooks/use-pusher-channel';
import { channels, events } from '@/lib/pusher-client';
import type { AppSidebarStats, AppSidebarUser } from '@/components/app-sidebar';
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
  user: AppSidebarUser & { email?: string };
  unreadNotifications: number;
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
  unreadNotifications,
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
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      {/* Thread card */}
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
        {/* Thread header */}
        <header className="flex items-center gap-3 border-b border-ink-800 bg-ink-900/60 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            asChild
            aria-label="ჩატების სიაში დაბრუნება"
            className="shrink-0 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
          >
            <Link href="/chats">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>

          <div className="relative shrink-0">
            <ProfileAvatar
              src={conversation.otherAvatarUrl}
              fallback={conversation.otherInitials}
              size="md"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink-50">
              {conversation.otherName}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 border-ink-700 bg-ink-900 text-ink-200 hover:border-ink-600 hover:bg-ink-800 hover:text-ink-50"
          >
            <Link href={conversation.otherProfileHref} className="inline-flex items-center gap-1.5">
              <span>პროფილი</span>
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </header>

        {/* Messages area */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:#343943_transparent] [scrollbar-width:thin] sm:px-6"
          data-testid="chat-thread-messages"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(174,222,72,0.03), transparent 60%)',
          }}
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-[13px] text-ink-400">ჯერ შეტყობინებები არ არის.</p>
              <p className="text-[12px] text-ink-500">დაიწყე საუბარი ქვემოთ.</p>
            </div>
          ) : (
            <div className="space-y-1">
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

        {/* Composer */}
        <form
          onSubmit={handleSend}
          className="border-t border-ink-800 bg-ink-900 px-3 py-3 sm:px-4"
        >
          {error ? (
            <p role="alert" className="mb-2 text-xs text-danger-300">
              {error}
            </p>
          ) : null}

          <div className="flex items-end gap-2 rounded-card border border-ink-700 bg-ink-950 px-2 py-1.5 transition-colors focus-within:border-brand-400/50 focus-within:ring-4 focus-within:ring-brand-400/10">
            <button
              type="button"
              aria-label="ფაილის მიმაგრება"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-ink-500 transition-colors hover:bg-ink-800 hover:text-accent-300"
            >
              {/* Paperclip inline — not yet re-exported from icons.tsx */}
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21.4 11.1 12.3 20a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.6 1.6 0 0 1-2.4-2.3l8.3-8.3" />
              </svg>
            </button>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="დაწერე შეტყობინება…"
              aria-label="შეტყობინების ტექსტი"
              maxLength={MESSAGE_BODY_MAX + 200}
              rows={1}
              disabled={sending}
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[14px] leading-relaxed text-ink-50 placeholder:text-ink-600 outline-none"
            />

            <Button
              type="submit"
              size="icon"
              aria-label="გაგზავნა"
              disabled={!canSend}
              className="h-10 w-10 shrink-0 rounded-btn bg-brand-400 text-ink-950 hover:bg-brand-300 active:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
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
              'mt-1.5 px-1 text-[11px]',
              overLimit ? 'text-danger-300' : 'text-ink-600',
            )}
          >
            {overLimit
              ? `${-remaining} სიმბოლოთი ლიმიტს ზემოთ — მაქს. ${MESSAGE_BODY_MAX}`
              : 'Enter — გაგზავნა · Shift + Enter — ახალი ხაზი'}
          </p>
        </form>
      </div>
    </AppShell>
  );
}
