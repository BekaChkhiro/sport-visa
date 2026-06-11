'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DeleteIcon,
  LockIcon,
  SearchIcon,
  UnlockIcon,
  UsersIcon,
  XCircleIcon,
} from '@/components/icons';
import { banUser, unbanUser, deleteUser, type UserRow } from '@/lib/admin/users/actions';
import { formatKaDateNumeric } from '@/lib/format-ka-date';

type RoleFilter = 'ALL' | 'FOOTBALLER' | 'CLUB';

type UsersPage = {
  items: UserRow[];
  total: number;
  pageCount: number;
};

type UserManagementClientProps = {
  currentPath: string;
  userId: string;
  user: { name: string; initials: string; email?: string };
  query: string;
  role: RoleFilter;
  page: number;
  pageSize: number;
  usersPage: UsersPage;
};

function initialsOf(firstName: string | null, lastName: string | null, email: string): string {
  const name = [firstName, lastName].filter(Boolean).join(' ');
  if (name) {
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
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  try {
    return formatKaDateNumeric(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function buildUrl(
  base: string,
  current: { query: string; role: RoleFilter; page: number },
  patch: Partial<{ query: string; role: RoleFilter; page: number }>,
): string {
  const merged = { ...current, ...patch };
  const sp = new URLSearchParams();
  if (merged.query) sp.set('q', merged.query);
  if (merged.role !== 'ALL') sp.set('role', merged.role);
  if (merged.page > 1) sp.set('page', String(merged.page));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function VerificationBadge({ status }: { status: UserRow['verificationStatus'] }) {
  if (!status) return null;
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill bg-success-400/10 px-2 py-0.5 text-[10.5px] font-semibold text-success-300">
        <CheckCircleIcon className="size-3" />
        VER
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill bg-warning-400/10 px-2 py-0.5 text-[10.5px] font-semibold text-warning-300">
        <ClockIcon className="size-3" />
        PEND
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-danger-400/10 px-2 py-0.5 text-[10.5px] font-semibold text-danger-300">
      <XCircleIcon className="size-3" />
      REJ
    </span>
  );
}

function RoleBadge({ role }: { role: UserRow['role'] }) {
  const label = role === 'FOOTBALLER' ? 'ფეხბ.' : role === 'CLUB' ? 'კლუბი' : 'Admin';
  const cls =
    role === 'FOOTBALLER'
      ? 'bg-iris-400/15 text-iris-300'
      : role === 'CLUB'
        ? 'bg-accent-400/15 text-accent-300'
        : 'bg-flame-400/15 text-flame-300';
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'destructive' | 'default';
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              გაუქმება
            </Button>
          </DialogClose>
          <Button type="button" variant={variant} onClick={onConfirm} disabled={pending}>
            {pending ? 'მუშავდება…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserCard({
  row,
  onBan,
  onUnban,
  onDelete,
  pending,
}: {
  row: UserRow;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
  onDelete: (id: string, label: string) => void;
  pending: boolean;
}) {
  const displayName =
    [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email.split('@')[0] || row.email;
  const isBlocked = row.status === 'BLOCKED';

  return (
    <div
      data-slot="user-row"
      className={`flex flex-col gap-3 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700 sm:flex-row sm:items-center ${isBlocked ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950 font-bold text-xs">
            {initialsOf(row.firstName, row.lastName, row.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-[13.5px] font-semibold truncate flex items-center gap-1.5 text-ink-50">
            {displayName}
            {isBlocked ? (
              <LockIcon className="size-3 text-danger-300 shrink-0" aria-label="დაბლოკილი" />
            ) : null}
          </span>
          <span className="text-[11.5px] text-ink-500 truncate">{row.email}</span>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <RoleBadge role={row.role} />
            <VerificationBadge status={row.verificationStatus} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:items-end text-xs text-ink-500 sm:min-w-[90px]">
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          {formatDate(row.createdAt)}
        </span>
        {isBlocked ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-danger-400/30 bg-danger-400/10 px-2 py-0.5 text-[10px] font-semibold text-danger-300">
            დაბლოკ.
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 sm:justify-end flex-wrap">
        {isBlocked ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUnban(row.id)}
            disabled={pending}
          >
            <UnlockIcon className="size-3.5" />
            განბლ.
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onBan(row.id)}
            disabled={pending || row.role === 'ADMIN'}
          >
            <LockIcon className="size-3.5" />
            ბლ.
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(row.id, displayName)}
          disabled={pending || row.role === 'ADMIN'}
        >
          <DeleteIcon className="size-3.5" />
          წაშ.
        </Button>
      </div>
    </div>
  );
}

export function UserManagementClient({
  currentPath,
  userId,
  user,
  query,
  role,
  page,
  usersPage,
}: UserManagementClientProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [searchValue, setSearchValue] = React.useState(query);
  const [feedback, setFeedback] = React.useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    userId: string;
    label: string;
  } | null>(null);

  React.useEffect(() => setSearchValue(query), [query]);

  const base = '/admin/users';
  const current = { query, role, page };

  const handleSignOut = React.useCallback(() => {
    void signOut({ callbackUrl: '/auth/signin' }).then(() => router.push('/auth/signin'));
  }, [router]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl(base, current, { query: searchValue.trim(), page: 1 }));
  };

  const setRole = (next: RoleFilter) => {
    router.push(buildUrl(base, current, { role: next, page: 1 }));
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

  const handleBan = (id: string) => {
    startTransition(async () => {
      const state = await banUser({ userId: id });
      announce(state, 'მომხმარებელი დაბლოკილია');
      router.refresh();
    });
  };

  const handleUnban = (id: string) => {
    startTransition(async () => {
      const state = await unbanUser({ userId: id });
      announce(state, 'ბლოკი მოხსნილია');
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const state = await deleteUser({ userId: target.userId });
      announce(state, 'მომხმარებელი წაშლილია');
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <AppShell
      role="admin"
      currentPath={currentPath}
      user={user}
      userId={userId}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-5 text-ink-400" />
              <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
                მომხმარებელთა მართვა
              </h1>
            </div>
            <p className="text-[13.5px] text-ink-400">მომხმარებლების ნახვა, ბლოკირება და წაშლა.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-btn border border-ink-700 bg-ink-900 p-1">
            {(
              [
                ['ALL', 'ყველა'],
                ['FOOTBALLER', 'ფეხბურთელები'],
                ['CLUB', 'კლუბები'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`flex items-center gap-2 rounded-[8px] px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  role === id ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={submitSearch}
            className="relative ml-auto hidden sm:flex flex-1 max-w-[260px]"
          >
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-500" />
            <Input
              type="search"
              placeholder="ძიება სახელით ან ელ.ფოსტით…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-10 border-ink-700 bg-ink-950 text-ink-100 placeholder:text-ink-600 focus:border-brand-400/50 focus:ring-brand-400/15"
              aria-label="ძიება"
            />
          </form>

          <div className="flex items-center gap-2">
            <Label htmlFor="role-filter" className="text-xs text-ink-500">
              როლი
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as RoleFilter)}>
              <SelectTrigger
                id="role-filter"
                className="w-[160px] border-ink-700 bg-ink-900 text-ink-200"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ყველა</SelectItem>
                <SelectItem value="FOOTBALLER">ფეხბურთელი</SelectItem>
                <SelectItem value="CLUB">კლუბი</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

        {/* User list */}
        <div className="flex flex-col gap-3">
          {usersPage.items.length === 0 ? (
            <EmptyState
              title={query ? 'ვერ მოიძებნა' : 'მომხმარებელი არ არის'}
              description={
                query
                  ? 'შეცვალე ძიების სიტყვა ან გასწორდი ფილტრები.'
                  : 'სისტემაში მომხმარებელი ჯერ არ არის.'
              }
            />
          ) : (
            usersPage.items.map((row) => (
              <UserCard
                key={row.id}
                row={row}
                onBan={handleBan}
                onUnban={handleUnban}
                onDelete={(id, label) => setDeleteTarget({ userId: id, label })}
                pending={pending}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {usersPage.pageCount > 1 ? (
          <nav
            aria-label="გვერდები"
            className="flex items-center justify-between border-t border-ink-800 pt-4"
          >
            <span className="text-[12.5px] text-ink-500">
              გვერდი {page} / {usersPage.pageCount} ({usersPage.total} მომხ.)
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
                disabled={page >= usersPage.pageCount}
                className="border-ink-800 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              >
                შემდეგი
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </nav>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="მომხმარებლის წაშლა"
        description={`წაიშლება "${deleteTarget?.label ?? ''}" — ეს მოქმედება შეუქცევადია.`}
        confirmLabel="წაშლა"
        variant="destructive"
        onConfirm={handleDelete}
        pending={pending}
      />
    </AppShell>
  );
}
