'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircleIcon className="size-3" />
        VER
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
        <ClockIcon className="size-3" />
        PEND
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive">
      <XCircleIcon className="size-3" />
      REJ
    </span>
  );
}

function RoleBadge({ role }: { role: UserRow['role'] }) {
  const label = role === 'FOOTBALLER' ? 'ფეხბ.' : role === 'CLUB' ? 'კლუბი' : 'Admin';
  return (
    <Badge variant="outline" className="text-[10px]">
      {label}
    </Badge>
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
      className={`flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center ${isBlocked ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {initialsOf(row.firstName, row.lastName, row.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate flex items-center gap-1.5">
            {displayName}
            {isBlocked ? (
              <LockIcon className="size-3 text-destructive shrink-0" aria-label="დაბლოკილი" />
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground truncate">{row.email}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <RoleBadge role={row.role} />
            <VerificationBadge status={row.verificationStatus} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:items-end text-xs text-muted-foreground sm:min-w-[90px]">
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          {formatDate(row.createdAt)}
        </span>
        {isBlocked ? (
          <Badge variant="destructive" className="text-[10px]">
            დაბლოკ.
          </Badge>
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">მომხმარებელთა მართვა</h1>
          </div>
          <p className="text-sm text-muted-foreground">მომხმარებლების ნახვა, ბლოკირება და წაშლა.</p>
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
            <Label htmlFor="role-filter" className="text-xs text-muted-foreground">
              როლი
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as RoleFilter)}>
              <SelectTrigger id="role-filter" className="w-[160px]">
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

        {usersPage.pageCount > 1 ? (
          <nav aria-label="გვერდები" className="flex items-center justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground">
              გვერდი {page} / {usersPage.pageCount} ({usersPage.total} მომხ.)
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
                disabled={page >= usersPage.pageCount}
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
