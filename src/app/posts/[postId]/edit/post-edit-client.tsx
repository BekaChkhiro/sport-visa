'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeftIcon,
  SpinnerIcon,
  SendIcon,
  CheckCircleIcon,
  ShieldIcon,
  InfoIcon,
} from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import { updateClubPost } from '@/lib/club-profile/actions';

type User = {
  name: string;
  initials: string;
  image?: string;
  city?: string;
  verificationStatus?: VerificationStatus;
};

type PostEditClientProps = {
  postId: string;
  initialTitle: string;
  initialBody: string;
  user: User;
  stats: AppSidebarStats;
  unreadNotifications: number;
};

const MAX_BODY = 5000;
const MAX_TITLE = 200;

export function PostEditClient({
  postId,
  initialTitle,
  initialBody,
  user,
  stats,
  unreadNotifications,
}: PostEditClientProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initialTitle);
  const [body, setBody] = React.useState(initialBody);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [pending, setPending] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const canPublish = title.trim().length > 0 && body.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    setFieldErrors({});

    const result = await updateClubPost(postId, { title, body });

    if (result.status === 'error') {
      setError(result.message);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setPending(false);
      return;
    }

    router.push('/dashboard/club');
  }

  return (
    <AppShell
      role="club"
      currentPath=""
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <div className="mb-5">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="size-4" />
            უკან
          </Button>
        </div>

        {/* Page header */}
        <div className="mb-7">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-brand-400">სიახლე</p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-ink-50">
            სიახლის რედაქტირება
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── Editor column ── */}
          <div className="min-w-0 space-y-5">
            {/* Author chip */}
            <div className="flex items-center gap-3 rounded-card border border-ink-800 bg-ink-900 px-4 py-3 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-accent-400/15 text-accent-300">
                <ShieldIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-ink-50">{user.name}</p>
                <p className="text-[11.5px] text-ink-500">გამოქვეყნდება კლუბის სახელით</p>
              </div>
              {user.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 rounded-pill border border-success-400/30 bg-success-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-300">
                  <CheckCircleIcon className="size-2.5" />
                  დადასტ.
                </span>
              )}
            </div>

            {/* Title + body editor */}
            <form onSubmit={handleSubmit}>
              <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
                {/* Title area */}
                <div className="border-b border-ink-800 px-5 pt-5">
                  <Label htmlFor="title" className="sr-only">
                    სათაური
                  </Label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                    placeholder="სიახლის სათაური..."
                    maxLength={MAX_TITLE}
                    aria-invalid={!!fieldErrors.title}
                    className="w-full bg-transparent pb-3 text-[22px] font-bold tracking-tight text-ink-50 placeholder:text-ink-600 outline-none"
                  />
                  <div className="flex justify-end pb-2">
                    <span className="font-mono text-[11px] tabular-nums text-ink-600">
                      {title.length}/{MAX_TITLE}
                    </span>
                  </div>
                </div>

                {/* Body textarea */}
                <Label htmlFor="body" className="sr-only">
                  ტექსტი
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
                  placeholder="სიახლის ტექსტი..."
                  maxLength={MAX_BODY}
                  rows={9}
                  aria-invalid={!!fieldErrors.body}
                  className="rounded-none border-0 bg-transparent px-5 py-4 text-[15px] leading-[1.7] resize-none text-ink-100 placeholder:text-ink-600 focus-visible:ring-0"
                />

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-ink-800 px-5 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
                    <InfoIcon className="size-3.5" />
                    ავტომატური მონახაზის შენახვა ჩართულია
                  </span>
                  <span className="font-mono text-[11.5px] tabular-nums text-ink-600">
                    {body.length}/{MAX_BODY}
                  </span>
                </div>
              </div>

              {fieldErrors.title && (
                <p className="mt-1.5 text-[12px] text-danger-300">{fieldErrors.title[0]}</p>
              )}
              {fieldErrors.body && (
                <p className="mt-1.5 text-[12px] text-danger-300">{fieldErrors.body[0]}</p>
              )}
              {error && <p className="mt-1.5 text-[13px] text-danger-300">{error}</p>}

              {/* Mobile actions */}
              <div className="mt-4 flex gap-3 lg:hidden">
                <Button type="submit" disabled={pending || !canPublish} className="flex-1">
                  {pending && <SpinnerIcon className="size-4 animate-spin" />}
                  <SendIcon className="size-4" />
                  შენახვა
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  გაუქმება
                </Button>
              </div>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <aside className="hidden space-y-4 lg:sticky lg:top-[88px] lg:self-start lg:block">
            <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card space-y-3">
              <Button
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                disabled={pending || !canPublish}
                className="w-full"
              >
                {pending && <SpinnerIcon className="size-4 animate-spin" />}
                <SendIcon className="size-4" />
                შენახვა
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                გაუქმება
              </Button>
              {!canPublish && (
                <p className="text-center text-[11.5px] text-ink-500">
                  სათაური და ტექსტი სავალდებულოა
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
