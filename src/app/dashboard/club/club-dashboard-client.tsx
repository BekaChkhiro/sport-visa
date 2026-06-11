'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
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
import { ProfileAvatar } from '@/components/profile-avatar';
import {
  ArrowRightIcon,
  AlertCircleIcon,
  CloseIcon,
  PlusIcon,
  MessageCircleIcon,
  StarIcon,
  EyeIcon,
  EditIcon,
  DeleteIcon,
  HeartIcon,
  SpinnerIcon,
  TrendingUpIcon,
  SearchIcon,
  ShieldIcon,
} from '@/components/icons';
import { deleteClubPost } from '@/lib/club-profile/actions';
import { formatKaDate } from '@/lib/format-ka-date';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import { cn } from '@/lib/utils';

type ShortlistedFootballer = {
  id: string;
  firstName: string;
  lastName: string;
  positions: string[];
  height: number | null;
  nationality: string | null;
  avatarUrl?: string;
  shortlistedAt: string;
};

type DashboardPost = {
  id: string;
  title: string;
  likeCount: number;
  createdAt: string;
};

type DashboardChat = {
  id: string;
  otherName: string;
  otherInitials: string;
  otherAvatarUrl?: string;
  lastMessageBody: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type ClubDashboardUser = {
  name: string;
  initials: string;
  image?: string;
  city?: string;
  verificationStatus?: VerificationStatus;
};

type ClubDashboardClientProps = {
  currentPath: string;
  userId: string;
  user: ClubDashboardUser;
  stats: AppSidebarStats;
  unreadNotifications: number;
  recentShortlist: ShortlistedFootballer[];
  recentPosts: DashboardPost[];
  recentChats: DashboardChat[];
};

/** Section label matching the artboard */
function SectionLabel({
  children,
  action,
  id,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 id={id} className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** KPI card — icon square + mono value + delta pill + label */
function KpiCard({
  icon: Icon,
  value,
  delta,
  label,
  primary = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  delta?: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
            primary ? 'bg-brand-400/15 text-brand-300' : 'bg-ink-800 text-ink-400'
          }`}
          aria-hidden="true"
        >
          <Icon className="size-[17px]" />
        </span>
        {delta ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-success-400/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-success-300">
            <TrendingUpIcon className="size-[11px]" aria-hidden="true" />
            {delta}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-[28px] font-bold leading-none tracking-tight text-ink-50 tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[12.5px] text-ink-400">{label}</p>
    </div>
  );
}

/** Verification/status banner */
function VerificationBanner({
  status,
  onDismiss,
}: {
  status: VerificationStatus;
  onDismiss: () => void;
}) {
  const isVerified = status === 'verified';
  const isPending = status === 'pending';

  if (!isVerified && !isPending) return null;

  return (
    <div
      role="status"
      className={cn(
        'relative mb-6 flex items-center gap-4 overflow-hidden rounded-card border p-4 shadow-card',
        isVerified
          ? 'border-success-400/25 bg-gradient-to-br from-success-400/10 via-ink-900 to-ink-900'
          : 'border-warning-400/25 bg-gradient-to-br from-warning-400/10 via-ink-900 to-ink-900',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]',
          isVerified ? 'bg-success-400/15 text-success-300' : 'bg-warning-400/15 text-warning-300',
        )}
      >
        {isVerified ? (
          <ShieldIcon className="size-[22px]" aria-hidden="true" />
        ) : (
          <AlertCircleIcon className="size-[22px]" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        {isVerified ? (
          <>
            <p className="text-[14px] font-semibold text-ink-50">კლუბი დადასტურებულია</p>
            <p className="text-[12.5px] text-ink-400">
              სრული წვდომა ფეხბურთელთა დირექტორიასა და ჩატზე.
            </p>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-ink-50">ვერიფიკაცია განიხილება</p>
            <p className="text-[12.5px] text-ink-400">
              ჩვენი გუნდი შეამოწმებს თქვენს პროფილს 24–48 სთ-ის განმავლობაში.
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="დახურვა"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <CloseIcon className="size-[16px]" />
      </button>
    </div>
  );
}

/** Position chip */
const POS_TONE: Record<string, string> = {
  GK: 'bg-flame-400/15 text-flame-300',
  CB: 'bg-accent-400/15 text-accent-300',
  CM: 'bg-iris-400/15 text-iris-300',
  ST: 'bg-brand-400/15 text-brand-300',
  LB: 'bg-accent-400/15 text-accent-300',
  RB: 'bg-accent-400/15 text-accent-300',
  LW: 'bg-flame-400/15 text-flame-300',
  RW: 'bg-flame-400/15 text-flame-300',
  CAM: 'bg-iris-400/15 text-iris-300',
  CDM: 'bg-iris-400/15 text-iris-300',
};

function PositionBadge({ pos }: { pos: string }) {
  return (
    <span
      className={cn(
        'rounded-pill px-2 py-0.5 text-[10.5px] font-bold',
        POS_TONE[pos] ?? 'bg-ink-800 text-ink-400',
      )}
    >
      {pos}
    </span>
  );
}

/** Shortlist footballer card */
function ShortlistCard({ footballer }: { footballer: ShortlistedFootballer }) {
  const name = `${footballer.firstName} ${footballer.lastName}`.trim();
  const initials = [footballer.firstName[0], footballer.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <article className="group flex flex-wrap items-center gap-4 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card transition-colors hover:border-ink-700">
      <div className="relative">
        <ProfileAvatar src={footballer.avatarUrl} fallback={initials} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-ink-50">{name}</p>
          {footballer.positions[0] ? <PositionBadge pos={footballer.positions[0]} /> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-400">
          {footballer.height ? (
            <span className="inline-flex items-center gap-1">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-ink-500"
                aria-hidden="true"
              >
                <path d="M3 8h18v8H3zM7 8v3M11 8v4M15 8v3M19 8v4" />
              </svg>
              {footballer.height} სმ
            </span>
          ) : null}
          {footballer.nationality ? <span>{footballer.nationality}</span> : null}
        </div>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] text-brand-300">
          <StarIcon className="size-3" aria-hidden="true" />
          შორთლისთში დამატებული
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/directory/${footballer.id}`}>
            <EyeIcon className="size-[15px]" />
            პროფილი
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link href="/chats">
            <MessageCircleIcon className="size-[15px]" />
            ჩატი
          </Link>
        </Button>
      </div>
    </article>
  );
}

/** Active chat row */
function ChatRow({ chat }: { chat: DashboardChat }) {
  const date = formatKaDate(chat.lastMessageAt, { month: 'short' });

  return (
    <Link
      href={`/chat/${chat.id}`}
      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink-800/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 outline-none"
    >
      <div className="relative shrink-0">
        <ProfileAvatar src={chat.otherAvatarUrl} fallback={chat.otherInitials} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13.5px] font-semibold text-ink-50">{chat.otherName}</p>
          <span className="shrink-0 text-[11px] text-ink-500">{date}</span>
        </div>
        <p
          className={cn(
            'mt-0.5 truncate text-[12.5px]',
            chat.unreadCount > 0 ? 'font-medium text-ink-200' : 'text-ink-400',
          )}
        >
          {chat.lastMessageBody ?? 'საუბარი დაიწყო'}
        </p>
      </div>
      {chat.unreadCount > 0 ? (
        <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 px-1 text-[10.5px] font-bold text-ink-950">
          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

/** Confirm-delete dialog for posts */
function DeletePostDialog({
  post,
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  post: DashboardPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>წაშლის დადასტურება</DialogTitle>
          <DialogDescription>
            ეს მოქმედება შეუქცევადია. გსურთ პოსტის წაშლა?
            {post ? (
              <span className="mt-1 block font-medium text-foreground/80">{post.title}</span>
            ) : null}
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

/** Posts management list with optimistic delete */
function PostsList({ posts }: { posts: DashboardPost[] }) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [localPosts, setLocalPosts] = React.useState(posts);
  const [confirmTarget, setConfirmTarget] = React.useState<DashboardPost | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function openDeleteDialog(post: DashboardPost) {
    setConfirmTarget(post);
    setDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!confirmTarget || deletingId) return;
    const post = confirmTarget;
    setDialogOpen(false);
    setDeletingId(post.id);
    setLocalPosts((prev) => prev.filter((p) => p.id !== post.id));
    const result = await deleteClubPost(post.id);
    if (result.status === 'error') {
      setLocalPosts(posts);
    }
    setDeletingId(null);
    setConfirmTarget(null);
  }

  if (localPosts.length === 0) {
    return (
      <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
        <EmptyState
          title="სიახლეები არ არის"
          description="გამოაქვეყნე სიახლე, რომ ფეხბურთელები ინფორმირებული იყვნენ."
          action={
            <Button variant="default" size="sm" asChild>
              <Link href="/posts/new">
                <PlusIcon className="size-4" />
                სიახლის დამატება
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <DeletePostDialog
        post={confirmTarget}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmDelete}
        pending={deletingId !== null}
      />
      <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
        <div className="divide-y divide-ink-800">
          {localPosts.map((post) => (
            <div
              key={post.id}
              className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-800/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-400/15 text-brand-300">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink-100">{post.title}</p>
                <div className="mt-0.5 flex items-center gap-3 text-[11.5px] text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <HeartIcon className="size-3" aria-hidden="true" />
                    {post.likeCount} მოწონება
                  </span>
                  <span>· {formatKaDate(post.createdAt, { month: 'short' })}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button variant="ghost" size="sm" asChild aria-label="რედ.">
                  <Link href={`/posts/${post.id}/edit`}>
                    <EditIcon className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteDialog(post)}
                  disabled={deletingId === post.id}
                  aria-label="წაშ."
                  className="text-danger-300 hover:text-danger-300 hover:bg-danger-400/10"
                >
                  {deletingId === post.id ? (
                    <SpinnerIcon className="size-3.5 animate-spin" />
                  ) : (
                    <DeleteIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/posts/new"
          className="flex w-full items-center justify-center gap-2 border-t border-ink-800 py-3 text-[13px] font-medium text-brand-400 transition-colors hover:bg-brand-400/5 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
        >
          <PlusIcon className="size-4" />
          ახალი პოსტის დამატება
        </Link>
      </div>
    </>
  );
}

export function ClubDashboardClient({
  currentPath,
  userId,
  user,
  stats,
  unreadNotifications,
  recentShortlist,
  recentPosts,
  recentChats,
}: ClubDashboardClientProps) {
  const router = useRouter();
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const kpiStats = [
    {
      icon: EyeIcon,
      value: (stats.views ?? 0).toLocaleString('ka-GE'),
      delta: '+18%',
      label: 'პროფილის ნახვები',
      primary: true,
    },
    {
      icon: StarIcon,
      value: String(stats.shortlistCount ?? 0),
      delta:
        (stats.shortlistCount ?? 0) > 0 ? `+${Math.min(stats.shortlistCount ?? 0, 5)}` : undefined,
      label: 'შორთლისთში',
      primary: false,
    },
    {
      icon: MessageCircleIcon,
      value: String(stats.unreadMessages ?? 0),
      delta: (stats.unreadMessages ?? 0) > 0 ? 'ახალი' : undefined,
      label: 'ახალი ჩატი',
      primary: false,
    },
  ];

  return (
    <AppShell
      role="club"
      currentPath={currentPath}
      userId={userId}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      {/* ── Greeting ── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12.5px] text-ink-500">
            {formatKaDate(new Date(), { weekday: true })}
          </p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold tracking-tight text-ink-50">
            სამუშაო პანელი
          </h1>
        </div>
        <Button variant="outline" size="default" asChild>
          <Link href="/directory">
            <SearchIcon className="size-4" />
            ფეხბურთელის ძიება
          </Link>
        </Button>
      </div>

      {/* ── Verification banner ── */}
      {!bannerDismissed && user.verificationStatus ? (
        <VerificationBanner
          status={user.verificationStatus}
          onDismiss={() => setBannerDismissed(true)}
        />
      ) : null}

      {/* ── KPI strip ── */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpiStats.map((s) => (
          <KpiCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Two-column ── */}
      <div className="grid gap-7 xl:grid-cols-[1fr_336px]">
        {/* ──── Left: shortlist + posts ──── */}
        <div className="space-y-8">
          {/* Shortlist activity */}
          <section aria-labelledby="shortlist-heading">
            <SectionLabel
              id="shortlist-heading"
              action={
                recentShortlist.length > 0 ? (
                  <Link
                    href="/shortlist"
                    className="text-[12px] font-medium text-accent-300 transition-colors hover:text-accent-200 outline-none focus-visible:underline"
                  >
                    დირექტორია →
                  </Link>
                ) : undefined
              }
            >
              ბოლო შორთლისთის აქტივობა
            </SectionLabel>

            {recentShortlist.length > 0 ? (
              <>
                <div className="space-y-3">
                  {recentShortlist.map((f) => (
                    <ShortlistCard key={f.id} footballer={f} />
                  ))}
                </div>
                <Link
                  href="/directory"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-ink-700 py-3 text-[13px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                >
                  დირექტორიის გახსნა
                  <ArrowRightIcon className="size-4" />
                </Link>
              </>
            ) : (
              <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <EmptyState
                  title="შერჩეული ფეხბ. არ არის"
                  description="გამოიყენე Directory, რომ ფეხბურთელები შენ სიაში დაამატო."
                  action={
                    <Button variant="default" size="sm" asChild>
                      <Link href="/directory">Directory-ს გახსნა</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </section>

          {/* News posts management */}
          <section aria-labelledby="news-heading">
            <SectionLabel
              id="news-heading"
              action={
                <Link
                  href="/posts/new"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-400 transition-colors hover:text-brand-300 outline-none focus-visible:underline"
                >
                  <PlusIcon className="size-3.5" />
                  ახალი
                </Link>
              }
            >
              სიახლეების მართვა
            </SectionLabel>

            <PostsList posts={recentPosts} />
          </section>
        </div>

        {/* ──── Right: active chats ──── */}
        <aside className="space-y-7">
          <section aria-labelledby="chats-heading">
            <SectionLabel
              id="chats-heading"
              action={
                <Link
                  href="/chats"
                  className="text-[12px] font-medium text-accent-300 transition-colors hover:text-accent-200 outline-none focus-visible:underline"
                >
                  ყველა
                </Link>
              }
            >
              აქტიური ჩატები
            </SectionLabel>

            {recentChats.length > 0 ? (
              <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <div className="divide-y divide-ink-800">
                  {recentChats.map((chat) => (
                    <ChatRow key={chat.id} chat={chat} />
                  ))}
                </div>
                <Link
                  href="/chats"
                  className="flex w-full items-center justify-center gap-2 border-t border-ink-800 py-3 text-[13px] font-medium text-ink-400 transition-colors hover:bg-ink-800/50 hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
                >
                  ყველა ჩატი
                  <ArrowRightIcon className="size-[15px]" />
                </Link>
              </div>
            ) : (
              <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <EmptyState
                  title="ჩატები არ არის"
                  description="ფეხბურთელთან კომუნიკაციისთვის პირველი ჩატი გახსენი."
                />
              </div>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
