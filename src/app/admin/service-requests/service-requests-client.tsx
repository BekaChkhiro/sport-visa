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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  XCircleIcon,
} from '@/components/icons';
import {
  resolveServiceRequest,
  rejectServiceRequest,
  type ServiceRequestRow,
} from '@/lib/admin/service-requests/actions';

type StatusFilter = 'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED';

type RequestsPage = {
  items: ServiceRequestRow[];
  total: number;
  pageCount: number;
};

type ServiceRequestsClientProps = {
  currentPath: string;
  userId: string;
  user: { name: string; initials: string; email?: string };
  query: string;
  status: StatusFilter;
  page: number;
  pageSize: number;
  requestsPage: RequestsPage;
  pendingCount: number;
  pendingVerifications: number;
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
  current: { query: string; status: StatusFilter; page: number },
  patch: Partial<{ query: string; status: StatusFilter; page: number }>,
): string {
  const merged = { ...current, ...patch };
  const sp = new URLSearchParams();
  if (merged.query) sp.set('q', merged.query);
  if (merged.status !== 'ALL') sp.set('status', merged.status);
  if (merged.page > 1) sp.set('page', String(merged.page));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function StatusBadge({ status }: { status: ServiceRequestRow['status'] }) {
  if (status === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircleIcon className="size-3" />
        შეს.
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <XCircleIcon className="size-3" />
        უარყ.
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
      <ClockIcon className="size-3" />
      ახ.
    </span>
  );
}

function RejectDialog({
  open,
  onOpenChange,
  targetLabel,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLabel: string;
  onConfirm: (adminNote: string) => void;
  pending: boolean;
}) {
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setNote('');
      setError(null);
    }
  }, [open]);

  const submit = () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setError('მიზეზი სავალდებულოა');
      return;
    }
    if (trimmed.length > 1000) {
      setError('მაქს. 1000 სიმბოლო');
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>უარყოფის მიზეზი</DialogTitle>
          <DialogDescription>
            მიუთითეთ მოკლე ახსნა — ეს ჩაიწერება მოთხოვნაზე.
            <span className="block mt-1 text-foreground/80">{targetLabel}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reject-note">მიზეზი</Label>
          <Textarea
            id="reject-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="მაგ. სერვისი ამჟამად მიუწვდომელია ან მოთხოვნა არასრულია…"
            rows={4}
            maxLength={1000}
            disabled={pending}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span aria-live="polite" className={error ? 'text-destructive' : undefined}>
              {error ?? `მაქს. 1000 სიმბოლო (${note.trim().length}/1000)`}
            </span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              გაუქმება
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={submit}
            disabled={pending || !note.trim()}
          >
            {pending ? 'იგზავნება…' : 'უარყოფა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestCard({
  row,
  onResolve,
  onReject,
  pending,
}: {
  row: ServiceRequestRow;
  onResolve: (id: string) => void;
  onReject: (id: string, label: string) => void;
  pending: boolean;
}) {
  const isPending = row.status === 'PENDING';
  const label = row.footballerName ?? row.userEmail ?? row.id;

  return (
    <div
      data-slot="service-request-row"
      data-request-id={row.id}
      className={`flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center ${!isPending ? 'opacity-70' : ''}`}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-mono font-medium text-muted-foreground">
            {row.requestCode}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {row.categoryName}
          </Badge>
          <StatusBadge status={row.status} />
        </div>
        <span className="text-xs text-muted-foreground truncate mt-0.5">{label}</span>
        {row.adminNote ? (
          <span className="text-xs text-muted-foreground italic mt-0.5 truncate">
            {row.adminNote}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 sm:items-end text-xs text-muted-foreground sm:min-w-[90px]">
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          {formatDate(row.createdAt)}
        </span>
        {row.resolvedAt ? (
          <span className="flex items-center gap-1 text-[11px]">
            შეს.: {formatDate(row.resolvedAt)}
          </span>
        ) : null}
      </div>
      {isPending ? (
        <div className="flex items-center gap-2 sm:justify-end flex-wrap">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onResolve(row.id)}
            disabled={pending}
          >
            <CheckCircleIcon className="size-3.5" />
            ჩამ.
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onReject(row.id, `${row.requestCode} · ${row.categoryName}`)}
            disabled={pending}
          >
            <XCircleIcon className="size-3.5" />
            უარყ.
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ServiceRequestsClient({
  currentPath,
  userId,
  user,
  query,
  status,
  page,
  requestsPage,
  pendingCount,
  pendingVerifications,
}: ServiceRequestsClientProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [searchValue, setSearchValue] = React.useState(query);
  const [feedback, setFeedback] = React.useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<{
    requestId: string;
    label: string;
  } | null>(null);

  React.useEffect(() => setSearchValue(query), [query]);

  const base = '/admin/service-requests';
  const current = { query, status, page };

  const handleSignOut = React.useCallback(() => {
    void signOut({ callbackUrl: '/auth/signin' }).then(() => router.push('/auth/signin'));
  }, [router]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl(base, current, { query: searchValue.trim(), page: 1 }));
  };

  const setStatus = (next: StatusFilter) => {
    router.push(buildUrl(base, current, { status: next, page: 1 }));
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

  const handleResolve = (id: string) => {
    startTransition(async () => {
      const state = await resolveServiceRequest({ requestId: id });
      announce(state, 'მოთხოვნა შესრულდა');
      router.refresh();
    });
  };

  const handleReject = (adminNote: string) => {
    if (!rejectTarget) return;
    const target = rejectTarget;
    startTransition(async () => {
      const state = await rejectServiceRequest({ requestId: target.requestId, adminNote });
      announce(state, 'მოთხოვნა უარყოფილია');
      setRejectTarget(null);
      router.refresh();
    });
  };

  const tabs: { value: StatusFilter; label: string; count?: number }[] = [
    { value: 'ALL', label: 'ყველა' },
    { value: 'PENDING', label: 'ახ.', count: pendingCount },
    { value: 'RESOLVED', label: 'შეს.' },
    { value: 'REJECTED', label: 'უარყ.' },
  ];

  return (
    <AppShell
      role="admin"
      currentPath={currentPath}
      user={user}
      userId={userId}
      adminBadges={{
        pendingVerifications,
        pendingServiceRequests: pendingCount,
      }}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">სერვ. მოთხოვნები</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            ფეხბურთელების სერვისის მოთხოვნების განხილვა და შესრულება.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="სტატუსი">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              onClick={() => setStatus(t.value)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                status === t.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {t.count !== undefined ? (
                <Badge variant={t.count > 0 ? 'destructive' : 'secondary'} className="text-[10px]">
                  {t.count}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="კოდი, ელ.ფოსტა ან სერვ. ტიპი…"
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
          {requestsPage.items.length === 0 ? (
            <EmptyState
              title={query ? 'ვერ მოიძებნა' : 'მოთხოვნა არ არის'}
              description={
                query
                  ? 'შეცვალე ძიების სიტყვა ან გასწორდი ფილტრები.'
                  : 'ამ სტატუსის მოთხოვნა ჯერ არ არის.'
              }
            />
          ) : (
            requestsPage.items.map((row) => (
              <RequestCard
                key={row.id}
                row={row}
                onResolve={handleResolve}
                onReject={(id, label) => setRejectTarget({ requestId: id, label })}
                pending={pending}
              />
            ))
          )}
        </div>

        {requestsPage.pageCount > 1 ? (
          <nav aria-label="გვერდები" className="flex items-center justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground">
              გვერდი {page} / {requestsPage.pageCount} ({requestsPage.total} მოთხ.)
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
                disabled={page >= requestsPage.pageCount}
              >
                შემდეგი
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </nav>
        ) : null}
      </div>

      <RejectDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        targetLabel={rejectTarget?.label ?? ''}
        onConfirm={handleReject}
        pending={pending}
      />
    </AppShell>
  );
}
