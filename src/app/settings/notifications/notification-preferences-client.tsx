'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Switch } from '@/components/ui/switch';
import { BellIcon, MailIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type Prefs = {
  emailInstant: boolean;
  emailDigest: boolean;
};

type NotificationPreferencesClientProps = {
  currentPath: string;
  userId: string;
  role: 'footballer' | 'club';
  user: {
    name: string;
    initials: string;
    image?: string;
  };
  initialPrefs: Prefs;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={title}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

export function NotificationPreferencesClient({
  currentPath,
  userId,
  role,
  user,
  initialPrefs,
}: NotificationPreferencesClientProps) {
  const router = useRouter();
  const [prefs, setPrefs] = React.useState<Prefs>(initialPrefs);
  const [saveState, setSaveState] = React.useState<SaveState>('idle');

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  async function savePrefs(next: Prefs) {
    setSaveState('saving');
    try {
      const res = await fetch('/api/settings/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  function toggle(field: keyof Prefs) {
    const next = { ...prefs, [field]: !prefs[field] };
    setPrefs(next);
    void savePrefs(next);
  }

  const isSaving = saveState === 'saving';

  return (
    <AppShell
      role={role}
      currentPath={currentPath}
      userId={userId}
      user={user}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold">შეტყობინებების პარამეტრები</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            მართე, თუ როდის და როგორ მიგივა შეტყობინებები ელ. ფოსტაზე.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              ელ. ფოსტის შეტყობინებები
            </p>
          </div>
          <div className="divide-y divide-border px-5">
            <PreferenceRow
              icon={<MailIcon className="size-4" aria-hidden="true" />}
              title="მყისიერი შეტყობინება"
              description="ახალი შეტყობინების (ვერიფ., გზავნილი და სხვ.) დროს გამოგიგზავნოთ ელ. ფოსტა."
              checked={prefs.emailInstant}
              disabled={isSaving}
              onChange={() => toggle('emailInstant')}
            />
            <PreferenceRow
              icon={<BellIcon className="size-4" aria-hidden="true" />}
              title="დღიური გამოჯამება"
              description="ყოველდღიური resume ბოლო 24 საათის განმავლობაში გამოქვეყნებული კლუბის სიახლეების."
              checked={prefs.emailDigest}
              disabled={isSaving}
              onChange={() => toggle('emailDigest')}
            />
          </div>
        </div>

        {saveState !== 'idle' && (
          <p
            className={cn(
              'text-sm',
              saveState === 'saving' && 'text-muted-foreground',
              saveState === 'saved' && 'text-green-600',
              saveState === 'error' && 'text-destructive',
            )}
          >
            {saveState === 'saving' && 'ინახება…'}
            {saveState === 'saved' && 'შენახულია'}
            {saveState === 'error' && 'შენახვა ვერ მოხერხდა, სცადეთ თავიდან'}
          </p>
        )}
      </div>
    </AppShell>
  );
}
