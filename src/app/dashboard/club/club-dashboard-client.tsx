'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile-avatar';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseIcon,
  PlusIcon,
  MessageCircleIcon,
  StarIcon,
  EditIcon,
  DeleteIcon,
  HeartIcon,
  SpinnerIcon,
} from '@/components/icons';
import { deleteClubPost } from '@/lib/club-profile/actions';
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
        'relative flex items-start gap-3 rounded-lg border p-4',
        isVerified
          ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100'
          : 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
      )}
    >
      {isVerified ? (
        <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="flex-1 text-sm">
        {isVerified ? (
          <p className="font-medium">კლუბი დადასტურებულია</p>
        ) : (
          <>
            <p className="font-medium">ვერიფიკაცია განიხილება</p>
            <p className="mt-0.5 opacity-80">
              ჩვენი გუნდი შეამოწმებს თქვენს პროფილს 24–48 სთ-ის განმავლობაში.
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="დახურვა"
        className="inline-flex size-6 shrink-0 items-center justify-center rounded outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CloseIcon className="size-3.5" />
      </button>
    </div>
  );
}

function ShortlistCard({ footballer }: { footballer: ShortlistedFootballer }) {
  const name = `${footballer.firstName} ${footballer.lastName}`.trim();
  const initials = [footballer.firstName[0], footballer.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();
  const meta = [footballer.positions[0], footballer.nationality].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <ProfileAvatar src={footballer.avatarUrl} fallback={initials} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/directory/${footballer.id}`}>პროფილი</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chats">
            <MessageCircleIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ChatCard({ chat }: { chat: DashboardChat }) {
  return (
    <Link
      href={`/chat/${chat.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <ProfileAvatar src={chat.otherAvatarUrl} fallback={chat.otherInitials} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{chat.otherName}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(chat.lastMessageAt).toLocaleDateString('ka-GE')}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {chat.lastMessageBody ?? 'საუბარი დაიწყო'}
        </p>
      </div>
      {chat.unreadCount > 0 ? (
        <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

function PostsList({ posts }: { posts: DashboardPost[] }) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [localPosts, setLocalPosts] = React.useState(posts);

  async function handleDelete(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    setLocalPosts((prev) => prev.filter((p) => p.id !== id));
    const result = await deleteClubPost(id);
    if (result.status === 'error') {
      setLocalPosts(posts);
    }
    setDeletingId(null);
  }

  if (localPosts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
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
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {localPosts.map((post) => (
        <div key={post.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{post.title}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <HeartIcon className="size-3" aria-hidden="true" />
                {post.likeCount}
              </span>
              <span>·</span>
              <span>{new Date(post.createdAt).toLocaleDateString('ka-GE')}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/posts/${post.id}/edit`} aria-label="რედ.">
                <EditIcon className="size-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(post.id)}
              disabled={deletingId === post.id}
              aria-label="წაშ."
              className="text-destructive hover:text-destructive"
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
      <div className="space-y-8">
        {!bannerDismissed && user.verificationStatus ? (
          <VerificationBanner
            status={user.verificationStatus}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}

        <section aria-labelledby="shortlist-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="shortlist-heading"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              ბოლო შერჩეული ფეხბურთელები
            </h2>
            {recentShortlist.length > 0 ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/shortlist">
                  ყველა
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>

          {recentShortlist.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentShortlist.map((f) => (
                <ShortlistCard key={f.id} footballer={f} />
              ))}
              <Button variant="outline" size="sm" className="self-start" asChild>
                <Link href="/directory">
                  <StarIcon className="size-4" />
                  Directory-ის გახსნა
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
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

        <section aria-labelledby="chats-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="chats-heading"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              აქტიური ჩატები
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/chats">
                ყველა
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
          {recentChats.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                title="ჩატები არ არის"
                description="ფეხბურთელთან კომუნიკაციისთვის პირველი ჩატი გახსენი."
              />
            </div>
          )}
        </section>

        <section aria-labelledby="news-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="news-heading"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              სიახლეები
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/posts/new">
                <PlusIcon className="size-4" />
                ახ. პოსტი
              </Link>
            </Button>
          </div>
          {recentPosts.length > 0 ? (
            <PostsList posts={recentPosts} />
          ) : (
            <div className="rounded-xl border border-border bg-card">
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
          )}
        </section>
      </div>
    </AppShell>
  );
}
