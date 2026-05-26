'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  SearchIcon,
  ShieldIcon,
  XCircleIcon,
} from '@/components/icons';
import {
  approveClub,
  approveFootballer,
  rejectClub,
  rejectFootballer,
} from '@/lib/admin/verification/actions';

type Tab = 'footballers' | 'clubs';
type Sort = 'oldest' | 'newest';

type FootballerRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  positions: string[];
  city: string | null;
  nationality: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

type ClubRow = {
  id: string;
  name: string;
  email: string | null;
  league: string | null;
  city: string | null;
  country: string | null;
  logoUrl: string | null;
  createdAt: string;
};

type PageData<T> = {
  items: T[];
  total: number;
  pageCount: number;
};

type VerificationQueueClientProps = {
  currentPath: string;
  userId: string;
  user: { name: string; initials: string; email?: string };
  tab: Tab;
  query: string;
  sort: Sort;
  page: number;
  pageSize: number;
  counts: { footballers: number; clubs: number };
  footballerPage: PageData<FootballerRow> | null;
  clubPage: PageData<ClubRow> | null;
};

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '—'
  );
}

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
  current: { tab: Tab; query: string; sort: Sort; page: number },
  patch: Partial<{ tab: Tab; query: string; sort: Sort; page: number }>,
): string {
  const merged = { ...current, ...patch };
  const sp = new URLSearchParams();
  sp.set('tab', merged.tab);
  if (merged.query) sp.set('q', merged.query);
  if (merged.sort !== 'oldest') sp.set('sort', merged.sort);
  if (merged.page > 1) sp.set('page', String(merged.page));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
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
  onConfirm: (reason: string) => void;
  pending: boolean;
}) {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  const submit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('მიზეზი სავალდებულოა');
      return;
    }
    if (trimmed.length > 500) {
      setError('მაქს. 500 სიმბოლო');
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
            მიუთითეთ მოკლე ახსნა — გაიგზავნება მომხმარებლის ელ.ფოსტაზე.
            <span className="block mt-1 text-foreground/80">{targetLabel}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reject-reason">მიზეზი</Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="მაგ. ფოტო არასაკმარისი ხარისხის ან არასრული ინფორმაცია…"
            rows={4}
            maxLength={500}
            disabled={pending}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span aria-live="polite" className={error ? 'text-destructive' : undefined}>
              {error ?? `მაქს. 500 სიმბოლო (${reason.trim().length}/500)`}
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
            disabled={pending || !reason.trim()}
          >
            {pending ? 'იგზავნება…' : 'უარყოფა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FootballerCard({
  row,
  onApprove,
  onReject,
  pending,
}: {
  row: FootballerRow;
  onApprove: (id: string) => void;
  onReject: (id: string, label: string) => void;
  pending: boolean;
}) {
  const fullName = `${row.firstName} ${row.lastName}`.trim();
  const meta = [row.positions[0], row.city, row.nationality].filter(Boolean).join(' · ');

  return (
    <div
      data-slot="verification-row"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="size-10 shrink-0">
          {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt={fullName} /> : null}
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {initialsOf(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{fullName}</span>
          <span className="text-xs text-muted-foreground truncate">{row.email ?? '—'}</span>
          {meta ? <span className="text-xs text-muted-foreground truncate">{meta}</span> : null}
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:items-end text-xs text-muted-foreground sm:min-w-[100px]">
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          {formatDate(row.createdAt)}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          მოლოდინი
        </Badge>
      </div>
      <div className="flex items-center gap-2 sm:justify-end flex-wrap">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => onApprove(row.id)}
          disabled={pending}
        >
          <CheckCircleIcon className="size-3.5" />
          დადასტ.
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onReject(row.id, fullName)}
          disabled={pending}
        >
          <XCircleIcon className="size-3.5" />
          უარყ.
        </Button>
      </div>
    </div>
  );
}

function ClubCard({
  row,
  onApprove,
  onReject,
  pending,
}: {
  row: ClubRow;
  onApprove: (id: string) => void;
  onReject: (id: string, label: string) => void;
  pending: boolean;
}) {
  const meta = [row.league, row.city, row.country].filter(Boolean).join(' · ');

  return (
    <div
      data-slot="verification-row"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="size-10 shrink-0 rounded-md">
          {row.logoUrl ? <AvatarImage src={row.logoUrl} alt={row.name} /> : null}
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground rounded-md">
            {initialsOf(row.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{row.name}</span>
          <span className="text-xs text-muted-foreground truncate">{row.email ?? '—'}</span>
          {meta ? <span className="text-xs text-muted-foreground truncate">{meta}</span> : null}
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:items-end text-xs text-muted-foreground sm:min-w-[100px]">
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          {formatDate(row.createdAt)}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          მოლოდინი
        </Badge>
      </div>
      <div className="flex items-center gap-2 sm:justify-end flex-wrap">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => onApprove(row.id)}
          disabled={pending}
        >
          <CheckCircleIcon className="size-3.5" />
          დადასტ.
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onReject(row.id, row.name)}
          disabled={pending}
        >
          <XCircleIcon className="size-3.5" />
          უარყ.
        </Button>
      </div>
    </div>
  );
}

export function VerificationQueueClient({
  currentPath,
  userId,
  user,
  tab,
  query,
  sort,
  page,
  counts,
  footballerPage,
  clubPage,
}: VerificationQueueClientProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [searchValue, setSearchValue] = React.useState(query);
  const [feedback, setFeedback] = React.useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<{
    profileType: 'footballer' | 'club';
    profileId: string;
    label: string;
  } | null>(null);

  React.useEffect(() => setSearchValue(query), [query]);

  const base = '/admin/verification';
  const current = { tab, query, sort, page };

  const handleSignOut = React.useCallback(() => {
    signOut({ callbackUrl: '/auth/signin' }).then(() => router.push('/auth/signin'));
  }, [router]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildUrl(base, current, { query: searchValue.trim(), page: 1 });
    router.push(next);
  };

  const setSort = (next: Sort) => {
    router.push(buildUrl(base, current, { sort: next, page: 1 }));
  };

  const setTab = (next: Tab) => {
    router.push(buildUrl(base, current, { tab: next, page: 1 }));
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

  const handleApproveFootballer = (id: string) => {
    startTransition(async () => {
      const state = await approveFootballer({ profileId: id });
      announce(state, 'პროფილი დადასტურდა');
      router.refresh();
    });
  };

  const handleApproveClub = (id: string) => {
    startTransition(async () => {
      const state = await approveClub({ profileId: id });
      announce(state, 'კლუბი დადასტურდა');
      router.refresh();
    });
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    const target = rejectTarget;
    startTransition(async () => {
      const fn = target.profileType === 'footballer' ? rejectFootballer : rejectClub;
      const state = await fn({ profileId: target.profileId, reason });
      announce(state, 'უარყოფა გაიგზავნა');
      setRejectTarget(null);
      router.refresh();
    });
  };

  const activeData = tab === 'footballers' ? footballerPage : clubPage;
  const activeTotal = activeData?.total ?? 0;
  const activePageCount = activeData?.pageCount ?? 1;

  return (
    <AppShell
      role="admin"
      currentPath={currentPath}
      user={user}
      userId={userId}
      adminBadges={{
        pendingVerifications: counts.footballers + counts.clubs,
      }}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldIcon className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">ვერიფიკაციის რიგი</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            ფეხბურთელებისა და კლუბების ახალი პროფილების განხილვა.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="ვერიფიკაცია">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'footballers'}
            onClick={() => setTab('footballers')}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
              tab === 'footballers'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            ფეხბურთელები
            <Badge
              variant={counts.footballers > 0 ? 'destructive' : 'secondary'}
              className="text-[10px]"
            >
              {counts.footballers}
            </Badge>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'clubs'}
            onClick={() => setTab('clubs')}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
              tab === 'clubs'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            კლუბები
            <Badge variant={counts.clubs > 0 ? 'destructive' : 'secondary'} className="text-[10px]">
              {counts.clubs}
            </Badge>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={submitSearch} className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="ძიება სახელით ან ელ.ფოსტით…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
              aria-label="ძიება"
            />
          </form>
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="text-xs text-muted-foreground">
              დახარისხება
            </Label>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger id="sort" className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest">უძველესი ჯერ</SelectItem>
                <SelectItem value="newest">უახლესი ჯერ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
          {tab === 'footballers' && footballerPage ? (
            footballerPage.items.length === 0 ? (
              <EmptyState
                title={query ? 'ვერ მოიძებნა' : 'მოლოდინში არ არის'}
                description={
                  query
                    ? 'შეცვალე ძიების სიტყვა ან გასწორდი ფილტრები.'
                    : 'ყველა ფეხბურთელის პროფილი განხილულია.'
                }
              />
            ) : (
              footballerPage.items.map((row) => (
                <FootballerCard
                  key={row.id}
                  row={row}
                  onApprove={handleApproveFootballer}
                  onReject={(id, label) =>
                    setRejectTarget({ profileType: 'footballer', profileId: id, label })
                  }
                  pending={pending}
                />
              ))
            )
          ) : null}

          {tab === 'clubs' && clubPage ? (
            clubPage.items.length === 0 ? (
              <EmptyState
                title={query ? 'ვერ მოიძებნა' : 'მოლოდინში არ არის'}
                description={
                  query
                    ? 'შეცვალე ძიების სიტყვა ან გასწორდი ფილტრები.'
                    : 'ყველა კლუბის პროფილი განხილულია.'
                }
              />
            ) : (
              clubPage.items.map((row) => (
                <ClubCard
                  key={row.id}
                  row={row}
                  onApprove={handleApproveClub}
                  onReject={(id, label) =>
                    setRejectTarget({ profileType: 'club', profileId: id, label })
                  }
                  pending={pending}
                />
              ))
            )
          ) : null}
        </div>

        {activePageCount > 1 ? (
          <nav aria-label="გვერდები" className="flex items-center justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground">
              გვერდი {page} / {activePageCount} ({activeTotal} ჩანაწერი)
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
                disabled={page >= activePageCount}
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
