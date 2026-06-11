'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DeleteIcon,
  FlagIcon,
  HeartIcon,
  MessageCircleIcon,
  SearchIcon,
} from '@/components/icons';
import {
  deletePost,
  deleteConversation,
  type PostRow,
  type ConversationRow,
  type ModerationPage,
} from '@/lib/admin/moderation/actions';
import { formatKaDateNumeric } from '@/lib/format-ka-date';

type Tab = 'posts' | 'chats';

type ModerationClientProps = {
  currentPath: string;
  userId: string;
  user: { name: string; initials: string; email?: string };
  tab: Tab;
  query: string;
  page: number;
  pageSize: number;
  postsPage: ModerationPage<PostRow>;
  chatsPage: ModerationPage<ConversationRow>;
  pendingVerifications: number;
  pendingServiceRequests: number;
};

function formatDate(iso: string): string {
  try {
    return formatKaDateNumeric(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function buildUrl(
  base: string,
  current: { tab: Tab; query: string; page: number },
  patch: Partial<{ tab: Tab; query: string; page: number }>,
): string {
  const merged = { ...current, ...patch };
  const sp = new URLSearchParams();
  if (merged.tab !== 'posts') sp.set('tab', merged.tab);
  if (merged.query) sp.set('q', merged.query);
  if (merged.page > 1) sp.set('page', String(merged.page));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  targetLabel,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLabel: string;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>წაშლის დადასტურება</DialogTitle>
          <DialogDescription>
            ეს მოქმედება შეუქცევადია. გსურთ წაშლა?
            <span className="mt-1 block font-medium text-foreground/80">{targetLabel}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              გაუქმება
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'იშლება…' : 'წაშლა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostCard({
  row,
  onDelete,
  pending,
}: {
  row: PostRow;
  onDelete: (id: string, label: string) => void;
  pending: boolean;
}) {
  return (
    <article
      data-slot="post-row"
      data-post-id={row.id}
      className="flex flex-col gap-3 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700 sm:flex-row sm:items-start"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-ink-50 truncate">{row.title}</span>
          <span className="shrink-0 rounded-pill border border-ink-700 bg-ink-800/60 px-2 py-0.5 text-[10.5px] font-medium text-ink-300">
            {row.clubName}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400 line-clamp-2">
          {row.bodyPreview}
        </p>
        <div className="mt-2 flex items-center gap-4 text-[11.5px] text-ink-600">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            {formatDate(row.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <HeartIcon className="size-3" />
            {row.likeCount}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => onDelete(row.id, `"${row.title}" · ${row.clubName}`)}
        disabled={pending}
        className="shrink-0"
      >
        <DeleteIcon className="size-3.5" />
        წაშ.
      </Button>
    </article>
  );
}

function ChatCard({
  row,
  onDelete,
  pending,
}: {
  row: ConversationRow;
  onDelete: (id: string, label: string) => void;
  pending: boolean;
}) {
  const clubLabel = row.clubName ?? row.clubUserEmail;
  const footballerLabel = row.footballerName ?? row.footballerUserEmail;

  return (
    <article
      data-slot="chat-row"
      data-conversation-id={row.id}
      className="flex flex-col gap-3 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-ink-50 truncate">{clubLabel}</span>
          <span className="text-[13px] text-ink-500">↔</span>
          <span className="text-[14px] text-ink-200 truncate">{footballerLabel}</span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-[11.5px] text-ink-600">
          <span className="flex items-center gap-1">
            <MessageCircleIcon className="size-3" />
            {row.messageCount} შეტ.
          </span>
          {row.lastMessageAt ? (
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              {formatDate(row.lastMessageAt)}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-ink-700">
          {row.clubUserEmail} · {row.footballerUserEmail}
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => onDelete(row.id, `${clubLabel} ↔ ${footballerLabel}`)}
        disabled={pending}
        className="shrink-0"
      >
        <DeleteIcon className="size-3.5" />
        წაშ.
      </Button>
    </article>
  );
}

export function ModerationClient({
  currentPath,
  userId,
  user,
  tab,
  query,
  page,
  postsPage,
  chatsPage,
  pendingVerifications,
  pendingServiceRequests,
}: ModerationClientProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [searchValue, setSearchValue] = React.useState(query);
  const [feedback, setFeedback] = React.useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    kind: 'post' | 'chat';
    id: string;
    label: string;
  } | null>(null);

  React.useEffect(() => setSearchValue(query), [query]);

  const base = '/admin/moderation';
  const current = { tab, query, page };

  const handleSignOut = React.useCallback(() => {
    void signOut({ callbackUrl: '/auth/signin' }).then(() => router.push('/auth/signin'));
  }, [router]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl(base, current, { query: searchValue.trim(), page: 1 }));
  };

  const setTab = (next: Tab) => {
    router.push(buildUrl(base, current, { tab: next, query: '', page: 1 }));
  };

  const setPage = (next: number) => {
    router.push(buildUrl(base, current, { page: Math.max(1, next) }));
  };

  const announce = (
    state: { status: 'success' | 'error' | 'idle'; message?: string },
    fallback: string,
  ) => {
    if (state.status === 'success') {
      setFeedback({ kind: 'success', message: state.message ?? fallback });
    } else if (state.status === 'error') {
      setFeedback({ kind: 'error', message: state.message ?? 'ოპერაცია ვერ შესრულდა' });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      if (target.kind === 'post') {
        const state = await deletePost({ postId: target.id });
        announce(state, 'პოსტი წაშლილია');
      } else {
        const state = await deleteConversation({ conversationId: target.id });
        announce(state, 'საუბარი წაშლილია');
      }
      router.refresh();
    });
  };

  const currentPage = tab === 'posts' ? postsPage : chatsPage;
  const totalPages = currentPage.pageCount;

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'posts', label: 'პოსტები', count: postsPage.total },
    { value: 'chats', label: 'ჩატები', count: chatsPage.total },
  ];

  return (
    <AppShell
      role="admin"
      currentPath={currentPath}
      user={user}
      userId={userId}
      adminBadges={{
        pendingVerifications,
        pendingServiceRequests,
      }}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FlagIcon className="size-5 text-ink-400" />
            <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
              მოდ. ინსტრუმენტები
            </h1>
          </div>
          <p className="text-[13.5px] text-ink-400">
            პოსტებისა და ჩატების ზედამხედველობა და წაშლა.
          </p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex rounded-btn border border-ink-800 bg-ink-900 p-1"
            role="tablist"
            aria-label="განყოფილება"
          >
            {tabs.map((t) => {
              const on = t.value === tab;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.value)}
                  className={`flex items-center gap-2 rounded-[7px] px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    on ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-100'
                  }`}
                >
                  {t.label}
                  <span
                    aria-hidden="true"
                    className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-bold tabular-nums ${
                      on ? 'bg-brand-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={submitSearch} className="relative sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-500" />
            <Input
              type="search"
              placeholder={tab === 'posts' ? 'სათ. ან კლუბი…' : 'ელ.ფ. ან სახ.…'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-10 border-ink-700 bg-ink-950 text-ink-100 placeholder:text-ink-600 focus:border-brand-400/50 focus:ring-brand-400/15"
              aria-label="ძიება"
            />
          </form>
        </div>

        {/* Feedback */}
        {feedback ? (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-card border px-4 py-2 text-sm ${
              feedback.kind === 'success'
                ? 'border-success-400/30 bg-success-400/10 text-success-300'
                : 'border-danger-400/30 bg-danger-400/10 text-danger-300'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {/* Content */}
        <div className="flex flex-col gap-3">
          {tab === 'posts' ? (
            postsPage.items.length === 0 ? (
              <EmptyState
                title={query ? 'ვერ მოიძებნა' : 'პოსტი არ არის'}
                description={
                  query ? 'შეცვალე ძიების სიტყვა.' : 'კლუბების მიერ განთავსებული პოსტი არ არის.'
                }
              />
            ) : (
              postsPage.items.map((row) => (
                <PostCard
                  key={row.id}
                  row={row}
                  onDelete={(id, label) => setDeleteTarget({ kind: 'post', id, label })}
                  pending={pending}
                />
              ))
            )
          ) : chatsPage.items.length === 0 ? (
            <EmptyState
              title={query ? 'ვერ მოიძებნა' : 'ჩატი არ არის'}
              description={query ? 'შეცვალე ძიების სიტყვა.' : 'მომხმარებლებს შორის ჩატი არ არის.'}
            />
          ) : (
            chatsPage.items.map((row) => (
              <ChatCard
                key={row.id}
                row={row}
                onDelete={(id, label) => setDeleteTarget({ kind: 'chat', id, label })}
                pending={pending}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <nav
            aria-label="გვერდები"
            className="flex items-center justify-between border-t border-ink-800 pt-4"
          >
            <span className="text-[12.5px] text-ink-500">
              ნაჩვენებია{' '}
              <b className="font-semibold tabular-nums text-ink-300">
                {tab === 'posts' ? postsPage.total : chatsPage.total}
              </b>{' '}
              {tab === 'posts' ? 'პოსტი' : 'ჩატი'}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="border-ink-800 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              >
                <ChevronLeftIcon className="size-4" />
                წინა
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="border-ink-800 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              >
                შემდეგი
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </nav>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        targetLabel={deleteTarget?.label ?? ''}
        onConfirm={handleConfirmDelete}
        pending={pending}
      />
    </AppShell>
  );
}
