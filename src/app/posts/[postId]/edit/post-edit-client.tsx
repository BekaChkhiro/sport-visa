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
import { cn } from '@/lib/utils';

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
const MAX_TITLE = 120;

const CATEGORIES = [
  { id: 'selection', label: 'სელექცია', tone: 'brand' as const },
  { id: 'news', label: 'სიახლე', tone: 'accent' as const },
  { id: 'transfer', label: 'ტრანსფერი', tone: 'iris' as const },
  { id: 'match', label: 'მატჩი', tone: 'flame' as const },
];

const TONE_CLS: Record<string, string> = {
  brand: 'bg-brand-400/15 text-brand-300 border-brand-400/30',
  accent: 'bg-accent-400/15 text-accent-300 border-accent-400/30',
  iris: 'bg-iris-400/15 text-iris-300 border-iris-400/30',
  flame: 'bg-flame-400/15 text-flame-300 border-flame-400/30',
};

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
  const [cat, setCat] = React.useState('selection');
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
      <div className="mx-auto max-w-[1180px]">
        {/* Back link */}
        <div className="mb-5">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="size-4" />
            დაშბორდი
          </Button>
        </div>

        {/* Page header */}
        <div className="mb-6">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-brand-400">
            სიახლე
          </p>
          <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight text-ink-50">
            სიახლის რედაქტირება
          </h1>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
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

            {/* Category */}
            <div className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
                კატეგორია
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    aria-pressed={cat === c.id}
                    className={cn(
                      'rounded-pill border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
                      cat === c.id
                        ? TONE_CLS[c.tone]
                        : 'border-ink-700 bg-ink-950/40 text-ink-400 hover:text-ink-200 hover:border-ink-600',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
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
                    placeholder={'სათაური — მაგ. „ღია სელექცია U21 შემადგენლობისთვის"'}
                    maxLength={MAX_TITLE}
                    aria-invalid={!!fieldErrors.title}
                    className="w-full bg-transparent pb-3 font-display text-[22px] font-bold tracking-tight text-ink-50 placeholder:text-ink-600 outline-none"
                  />
                  <div className="flex justify-end pb-2">
                    <span className="font-mono text-[11px] tabular-nums text-ink-600">
                      {title.length}/{MAX_TITLE}
                    </span>
                  </div>
                </div>

                {/* Formatting toolbar */}
                <div className="flex items-center gap-0.5 border-b border-ink-800 bg-ink-950/30 px-3 py-2">
                  {[
                    { label: 'Bold', path: 'M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z' },
                    { label: 'Italic', path: 'M19 4h-9M14 20H5M15 4 9 20' },
                    { label: 'List', path: 'M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0' },
                  ].map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      aria-label={t.label}
                      className="flex h-8 w-8 items-center justify-center rounded-btn text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={t.path} />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-1 text-[11px] text-ink-600">Markdown მხარდაჭერილია</span>
                </div>

                {/* Body textarea */}
                <Label htmlFor="body" className="sr-only">
                  ტექსტი
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
                  placeholder="დაწერე სიახლის ტექსტი… აღწერე სელექციის პირობები, თარიღები და მოთხოვნები."
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
          <aside className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
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
