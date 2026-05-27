'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SpinnerIcon } from '@/components/icons';
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="size-4" />
            უკან
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">სიახლის რედაქტირება</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">სათაური</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="სიახლის სათაური..."
              maxLength={200}
              aria-invalid={!!fieldErrors.title}
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">ტექსტი</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="სიახლის ტექსტი..."
              maxLength={5000}
              rows={8}
              aria-invalid={!!fieldErrors.body}
            />
            <div className="flex items-center justify-between">
              {fieldErrors.body ? (
                <p className="text-xs text-destructive">{fieldErrors.body[0]}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">{body.length}/5000</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending && <SpinnerIcon className="size-4 animate-spin" />}
              შენახვა
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              გაუქმება
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
