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
import { createClubPost } from '@/lib/club-profile/actions';
import { cn } from '@/lib/utils';

type User = {
  name: string;
  initials: string;
  image?: string;
  city?: string;
  verificationStatus?: VerificationStatus;
};

type PostComposerClientProps = {
  user: User;
  stats: AppSidebarStats;
  unreadNotifications: number;
};

const MAX_BODY = 5000;
const MAX_TITLE = 200;

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

export function PostComposerClient({ user, stats, unreadNotifications }: PostComposerClientProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [cat, setCat] = React.useState('selection');
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [pending, setPending] = React.useState(false);
  const [published, setPublished] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const canPublish = title.trim().length > 0 && body.trim().length > 0;
  const activeCat = CATEGORIES.find((c) => c.id === cat) ?? CATEGORIES[0]!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !canPublish) return;
    setPending(true);
    setError(null);
    setFieldErrors({});

    const result = await createClubPost({ title, body });

    if (result.status === 'error') {
      setError(result.message);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setPending(false);
      return;
    }

    setPublished(true);
    setTimeout(() => {
      router.push('/dashboard/club');
      router.refresh();
    }, 1400);
  }

  return (
    <AppShell
      role="club"
      currentPath="/posts/new"
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
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-brand-400">
            ახალი სიახლე
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-ink-50">სიახლის შედგენა</h1>
          <p className="mt-1 text-[13.5px] text-ink-400">
            გამოქვეყნებული პოსტი გამოუჩნდებათ ყველა გამომწერ ფეხბურთელს მათ ფიდში.
          </p>
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

            {/* Category */}
            <div className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
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
                  გამოქვეყნება
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  გაუქმება
                </Button>
              </div>
            </form>
          </div>

          {/* ── Settings sidebar ── */}
          <aside className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
            {/* Live preview */}
            <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
              <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  პრევიუ
                </span>
              </div>
              <div className="p-4">
                <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-950/40">
                  <div className="aspect-[16/9] w-full bg-ink-800 flex items-center justify-center">
                    <span className="text-ink-600 text-[12px]">სურათი</span>
                  </div>
                  <div className="p-3.5">
                    <span
                      className={cn(
                        'inline-block rounded-pill border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        TONE_CLS[activeCat.tone],
                      )}
                    >
                      {activeCat.label}
                    </span>
                    <p className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-ink-50">
                      {title.trim() || 'სიახლის სათაური აქ გამოჩნდება'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-400">
                      {body.trim() || 'ტექსტის პრევიუ აქ გამოჩნდება, როცა დაიწყებ წერას.'}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-ink-500">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-400/15 text-accent-300">
                        <ShieldIcon className="size-2.5" />
                      </span>
                      {user.name} · ახლა
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop publish */}
            <div className="hidden lg:block space-y-2">
              <Button
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                disabled={pending || !canPublish}
                className="w-full"
              >
                {pending && <SpinnerIcon className="size-4 animate-spin" />}
                <SendIcon className="size-4" />
                გამოქვეყნება
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

      {/* Published toast */}
      {published && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-card border border-success-400/30 bg-ink-900 px-5 py-3.5 shadow-float">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success-400/15 text-success-300">
            <CheckCircleIcon className="size-5" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ink-50">სიახლე გამოქვეყნდა</p>
            <p className="text-[12px] text-ink-400">გამომწერებს გამოუჩნდებათ ფიდში.</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
