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
  CheckCircleIcon,
  DeleteIcon,
  EditIcon,
  GlobeIcon,
  PlusIcon,
  SettingsIcon,
  XCircleIcon,
} from '@/components/icons';
import {
  createLeague,
  updateLeague,
  deleteLeague,
  toggleLeagueActive,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  toggleServiceCategoryActive,
  type LeagueRow,
  type ServiceCategoryRow,
  type RefDataActionState,
} from '@/lib/admin/ref-data/actions';

type Tab = 'leagues' | 'categories';

type RefDataClientProps = {
  currentPath: string;
  userId: string;
  user: { name: string; initials: string; email?: string };
  leagues: LeagueRow[];
  serviceCategories: ServiceCategoryRow[];
  pendingCount: number;
  pendingVerifications: number;
};

// ── Feedback banner ───────────────────────────────────────────────────────────

function FeedbackBanner({
  feedback,
}: {
  feedback: { kind: 'success' | 'error'; message: string } | null;
}) {
  if (!feedback) return null;
  return (
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
  );
}

// ── League form dialog ────────────────────────────────────────────────────────

type LeagueFormState = {
  name: string;
  country: string;
  orderIndex: string;
};

function LeagueDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: (LeagueRow & { editing: true }) | null;
  onSave: (data: LeagueFormState & { id?: string }) => void;
  pending: boolean;
}) {
  const [form, setForm] = React.useState<LeagueFormState>({
    name: '',
    country: '',
    orderIndex: '0',
  });
  const [errors, setErrors] = React.useState<Partial<LeagueFormState>>({});

  React.useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        country: initial?.country ?? '',
        orderIndex: String(initial?.orderIndex ?? 0),
      });
      setErrors({});
    }
  }, [open, initial]);

  const validate = (): boolean => {
    const e: Partial<LeagueFormState> = {};
    if (!form.name.trim()) e.name = 'სახელი სავალდებულოა';
    if (form.country && !/^[a-zA-Z]{2}$/.test(form.country))
      e.country = '2-სიმბოლოიანი კოდი (ISO alpha-2)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...form, id: initial?.id });
  };

  const isEditing = !!initial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'ლიგის რედაქტირება' : 'ლიგის დამატება'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'შეიყვანეთ ლიგის განახლებული მონაცემები.'
              : 'შეიყვანეთ ახალი ლიგის მონაცემები.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="league-name">სახელი *</Label>
            <Input
              id="league-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="მაგ. ეროვნული ლიგა"
              disabled={pending}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="league-country">ქვეყანა (ISO alpha-2)</Label>
            <Input
              id="league-country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
              placeholder="მაგ. GE"
              maxLength={2}
              disabled={pending}
            />
            {errors.country ? <p className="text-xs text-destructive">{errors.country}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="league-order">თანმიმდევრობა</Label>
            <Input
              id="league-order"
              type="number"
              min={0}
              value={form.orderIndex}
              onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))}
              disabled={pending}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              გაუქმება
            </Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? 'ინახება…' : isEditing ? 'შენახვა' : 'დამატება'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Service category form dialog ──────────────────────────────────────────────

type CategoryFormState = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  orderIndex: string;
};

function CategoryDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: (ServiceCategoryRow & { editing: true }) | null;
  onSave: (data: CategoryFormState & { id?: string }) => void;
  pending: boolean;
}) {
  const [form, setForm] = React.useState<CategoryFormState>({
    slug: '',
    name: '',
    icon: '',
    description: '',
    orderIndex: '0',
  });
  const [errors, setErrors] = React.useState<Partial<CategoryFormState>>({});

  React.useEffect(() => {
    if (open) {
      setForm({
        slug: initial?.slug ?? '',
        name: initial?.name ?? '',
        icon: initial?.icon ?? '',
        description: initial?.description ?? '',
        orderIndex: String(initial?.orderIndex ?? 0),
      });
      setErrors({});
    }
  }, [open, initial]);

  const validate = (): boolean => {
    const e: Partial<CategoryFormState> = {};
    if (!form.slug.trim()) e.slug = 'slug სავალდებულოა';
    else if (!/^[a-z0-9_]+$/.test(form.slug)) e.slug = 'მხოლოდ a-z, 0-9, _';
    if (!form.name.trim()) e.name = 'სახელი სავალდებულოა';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...form, id: initial?.id });
  };

  const isEditing = !!initial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'კატეგორიის რედაქტირება' : 'კატეგორიის დამატება'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'შეიყვანეთ კატეგორიის განახლებული მონაცემები.'
              : 'შეიყვანეთ ახალი სერვ. კატეგორიის მონაცემები.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-slug">Slug *</Label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
              placeholder="მაგ. meal_plan"
              disabled={pending || isEditing}
            />
            {isEditing ? (
              <p className="text-xs text-muted-foreground">slug-ის შეცვლა შეიძლება.</p>
            ) : null}
            {errors.slug ? <p className="text-xs text-destructive">{errors.slug}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">სახელი *</Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="მაგ. კვება"
              disabled={pending}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-icon">ემოჯი / ხატი</Label>
            <Input
              id="cat-icon"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              placeholder="მაგ. 🍽"
              maxLength={10}
              disabled={pending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-desc">აღწერა</Label>
            <Textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="სერვისის მოკლე აღწერა…"
              rows={3}
              maxLength={500}
              disabled={pending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-order">თანმიმდევრობა</Label>
            <Input
              id="cat-order"
              type="number"
              min={0}
              value={form.orderIndex}
              onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))}
              disabled={pending}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              გაუქმება
            </Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? 'ინახება…' : isEditing ? 'შენახვა' : 'დამატება'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  label,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label: string;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>წაშლის დადასტურება</DialogTitle>
          <DialogDescription>
            ნამდვილად გსურთ წაშალოთ <strong>{label}</strong>? ეს მოქმედება შეუქცევადია.
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

// ── League row ────────────────────────────────────────────────────────────────

function LeagueTableRow({
  row,
  onEdit,
  onDelete,
  onToggle,
  pending,
}: {
  row: LeagueRow;
  onEdit: (row: LeagueRow) => void;
  onDelete: (row: LeagueRow) => void;
  onToggle: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-1 flex-col min-w-0 gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{row.name}</span>
          {row.country ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <GlobeIcon className="size-3" />
              {row.country}
            </span>
          ) : null}
          {!row.isActive ? (
            <Badge variant="secondary" className="text-[10px]">
              გამოთიშული
            </Badge>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">#{row.orderIndex}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={row.isActive ? 'გამოთიშვა' : 'ჩართვა'}
          onClick={() => onToggle(row.id)}
          disabled={pending}
          className="size-8"
        >
          {row.isActive ? (
            <CheckCircleIcon className="size-4 text-emerald-500" />
          ) : (
            <XCircleIcon className="size-4 text-muted-foreground" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="რედაქტირება"
          onClick={() => onEdit(row)}
          disabled={pending}
          className="size-8"
        >
          <EditIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="წაშლა"
          onClick={() => onDelete(row)}
          disabled={pending}
          className="size-8 text-destructive hover:text-destructive"
        >
          <DeleteIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────

function CategoryTableRow({
  row,
  onEdit,
  onDelete,
  onToggle,
  pending,
}: {
  row: ServiceCategoryRow;
  onEdit: (row: ServiceCategoryRow) => void;
  onDelete: (row: ServiceCategoryRow) => void;
  onToggle: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-1 flex-col min-w-0 gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {row.icon ? <span aria-hidden="true">{row.icon}</span> : null}
          <span className="text-sm font-medium truncate">{row.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{row.slug}</span>
          {!row.isActive ? (
            <Badge variant="secondary" className="text-[10px]">
              გამოთიშული
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {row.description ? <span className="truncate">{row.description}</span> : null}
          <span className="shrink-0">{row.requestCount} მოთხ.</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={row.isActive ? 'გამოთიშვა' : 'ჩართვა'}
          onClick={() => onToggle(row.id)}
          disabled={pending}
          className="size-8"
        >
          {row.isActive ? (
            <CheckCircleIcon className="size-4 text-emerald-500" />
          ) : (
            <XCircleIcon className="size-4 text-muted-foreground" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="რედაქტირება"
          onClick={() => onEdit(row)}
          disabled={pending}
          className="size-8"
        >
          <EditIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="წაშლა"
          onClick={() => onDelete(row)}
          disabled={pending}
          className="size-8 text-destructive hover:text-destructive"
        >
          <DeleteIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export function RefDataClient({
  currentPath,
  userId,
  user,
  leagues,
  serviceCategories,
  pendingCount,
  pendingVerifications,
}: RefDataClientProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [tab, setTab] = React.useState<Tab>('leagues');
  const [feedback, setFeedback] = React.useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  // League dialogs
  const [leagueDialogOpen, setLeagueDialogOpen] = React.useState(false);
  const [editingLeague, setEditingLeague] = React.useState<(LeagueRow & { editing: true }) | null>(
    null,
  );
  const [deletingLeague, setDeletingLeague] = React.useState<LeagueRow | null>(null);

  // Category dialogs
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<
    (ServiceCategoryRow & { editing: true }) | null
  >(null);
  const [deletingCategory, setDeletingCategory] = React.useState<ServiceCategoryRow | null>(null);

  const handleSignOut = React.useCallback(() => {
    void signOut({ callbackUrl: '/auth/signin' }).then(() => router.push('/auth/signin'));
  }, [router]);

  const announce = (state: RefDataActionState, fallback: string) => {
    if (state.status === 'success') {
      setFeedback({ kind: 'success', message: state.message ?? fallback });
    } else if (state.status === 'error') {
      setFeedback({ kind: 'error', message: state.message ?? 'ოპერაცია ვერ შესრულდა' });
    }
  };

  // ── League handlers ──────────────────────────────────────────────────────────

  const handleLeagueSave = (data: {
    name: string;
    country: string;
    orderIndex: string;
    id?: string;
  }) => {
    const payload = {
      id: data.id,
      name: data.name,
      country: data.country || null,
      orderIndex: parseInt(data.orderIndex, 10) || 0,
    };
    startTransition(async () => {
      const state = data.id ? await updateLeague(payload) : await createLeague(payload);
      announce(state, data.id ? 'ლიგა განახლდა' : 'ლიგა დაემატა');
      if (state.status === 'success') {
        setLeagueDialogOpen(false);
        setEditingLeague(null);
        router.refresh();
      }
    });
  };

  const handleLeagueDelete = () => {
    if (!deletingLeague) return;
    const id = deletingLeague.id;
    startTransition(async () => {
      const state = await deleteLeague({ id });
      announce(state, 'ლიგა წაიშალა');
      setDeletingLeague(null);
      router.refresh();
    });
  };

  const handleLeagueToggle = (id: string) => {
    startTransition(async () => {
      const state = await toggleLeagueActive({ id });
      announce(state, 'განახლდა');
      router.refresh();
    });
  };

  // ── Category handlers ────────────────────────────────────────────────────────

  const handleCategorySave = (data: {
    slug: string;
    name: string;
    icon: string;
    description: string;
    orderIndex: string;
    id?: string;
  }) => {
    const payload = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      icon: data.icon || null,
      description: data.description || null,
      orderIndex: parseInt(data.orderIndex, 10) || 0,
    };
    startTransition(async () => {
      const state = data.id
        ? await updateServiceCategory(payload)
        : await createServiceCategory(payload);
      announce(state, data.id ? 'კატეგორია განახლდა' : 'კატეგორია დაემატა');
      if (state.status === 'success') {
        setCategoryDialogOpen(false);
        setEditingCategory(null);
        router.refresh();
      }
    });
  };

  const handleCategoryDelete = () => {
    if (!deletingCategory) return;
    const id = deletingCategory.id;
    startTransition(async () => {
      const state = await deleteServiceCategory({ id });
      announce(state, 'კატეგორია წაიშალა');
      setDeletingCategory(null);
      router.refresh();
    });
  };

  const handleCategoryToggle = (id: string) => {
    startTransition(async () => {
      const state = await toggleServiceCategoryActive({ id });
      announce(state, 'განახლდა');
      router.refresh();
    });
  };

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'leagues', label: 'ლიგები', count: leagues.length },
    { value: 'categories', label: 'სერვ. კატ.', count: serviceCategories.length },
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
            <SettingsIcon className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">სცნობარო მონაცემები</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            ლიგები და სერვისის კატეგორიები — dropdown-ებში გამოიყენება აპლიკაციაში.
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
              <Badge variant="secondary" className="text-[10px]">
                {t.count}
              </Badge>
            </button>
          ))}
        </div>

        <FeedbackBanner feedback={feedback} />

        {tab === 'leagues' && (
          <section aria-label="ლიგები" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">ლიგები</h2>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingLeague(null);
                  setLeagueDialogOpen(true);
                }}
                disabled={pending}
              >
                <PlusIcon className="size-3.5" />
                ლიგის დამატება
              </Button>
            </div>

            {leagues.length === 0 ? (
              <EmptyState title="ლიგა არ არის" description="დაამატეთ პირველი ლიგა ზემოთ ღილაკით." />
            ) : (
              <div className="flex flex-col gap-2">
                {leagues.map((row) => (
                  <LeagueTableRow
                    key={row.id}
                    row={row}
                    onEdit={(r) => {
                      setEditingLeague({ ...r, editing: true });
                      setLeagueDialogOpen(true);
                    }}
                    onDelete={(r) => setDeletingLeague(r)}
                    onToggle={handleLeagueToggle}
                    pending={pending}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'categories' && (
          <section aria-label="სერვისის კატეგორიები" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">სერვ. კატეგორიები</h2>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDialogOpen(true);
                }}
                disabled={pending}
              >
                <PlusIcon className="size-3.5" />
                კატეგორიის დამატება
              </Button>
            </div>

            {serviceCategories.length === 0 ? (
              <EmptyState
                title="კატეგორია არ არის"
                description="დაამატეთ პირველი კატეგორია ზემოთ ღილაკით."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {serviceCategories.map((row) => (
                  <CategoryTableRow
                    key={row.id}
                    row={row}
                    onEdit={(r) => {
                      setEditingCategory({ ...r, editing: true });
                      setCategoryDialogOpen(true);
                    }}
                    onDelete={(r) => setDeletingCategory(r)}
                    onToggle={handleCategoryToggle}
                    pending={pending}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* League dialogs */}
      <LeagueDialog
        open={leagueDialogOpen}
        onOpenChange={(v) => {
          setLeagueDialogOpen(v);
          if (!v) setEditingLeague(null);
        }}
        initial={editingLeague}
        onSave={handleLeagueSave}
        pending={pending}
      />
      <ConfirmDeleteDialog
        open={deletingLeague !== null}
        onOpenChange={(v) => {
          if (!v) setDeletingLeague(null);
        }}
        label={deletingLeague?.name ?? ''}
        onConfirm={handleLeagueDelete}
        pending={pending}
      />

      {/* Category dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(v) => {
          setCategoryDialogOpen(v);
          if (!v) setEditingCategory(null);
        }}
        initial={editingCategory}
        onSave={handleCategorySave}
        pending={pending}
      />
      <ConfirmDeleteDialog
        open={deletingCategory !== null}
        onOpenChange={(v) => {
          if (!v) setDeletingCategory(null);
        }}
        label={deletingCategory?.name ?? ''}
        onConfirm={handleCategoryDelete}
        pending={pending}
      />
    </AppShell>
  );
}
