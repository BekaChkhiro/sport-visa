'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Badge } from '@/components/ui/badge';
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
    return new Intl.DateTimeFormat('ka', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
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
    <div
      data-slot="post-row"
      data-post-id={row.id}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium truncate">{row.title}</span>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {row.clubName}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{row.bodyPreview}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
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
    </div>
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
    <div
      data-slot="chat-row"
      data-conversation-id={row.id}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium truncate">{clubLabel}</span>
          <span className="text-xs text-muted-foreground">↔</span>
          <span className="text-sm truncate">{footballerLabel}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
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
        <div className="mt-0.5 text-[11px] text-muted-foreground/70 truncate">
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
    </div>
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

  const tabs: { value: Tab; label: string }[] = [
    { value: 'posts', label: 'პოსტები' },
    { value: 'chats', label: 'ჩატები' },
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FlagIcon className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">მოდ. ინსტრუმენტები</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            პოსტებისა და ჩატების ზედამხედველობა და წაშლა.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="განყოფილება">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                tab === t.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={tab === 'posts' ? 'სათ. ან კლუბი…' : 'ელ.ფ. ან სახ.…'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
            aria-label="ძიება"
          />
        </form>

        {feedback ? (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-md border px-4 py-2 text-sm ${
              feedback.kind === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'
                : 'border-destructive/40 bg-destructive/10 text-destructive'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

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

        {totalPages > 1 ? (
          <nav aria-label="გვერდები" className="flex items-center justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground">
              გვერდი {page} / {totalPages} ({currentPage.total} სულ)
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
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
