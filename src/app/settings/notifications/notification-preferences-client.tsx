'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Switch } from '@/components/ui/switch';
import { BellIcon, MailIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

type Prefs = {
  emailInstant: boolean;
  emailDigest: boolean;
};

type NotificationPreferencesClientProps = {
  shellRole: AppSidebarRole;
  shellUser: AppSidebarUser & { email?: string };
  userId: string;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
  initialPrefs: Prefs;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// ─── PreferenceRow ────────────────────────────────────────────────────────────

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
    <div className="flex items-start justify-between gap-4 rounded-field border border-ink-800 bg-ink-950/40 px-3.5 py-2.5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-ink-400">{icon}</span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-ink-100 leading-snug">{title}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">{description}</p>
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

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationPreferencesClient({
  shellRole,
  shellUser,
  userId,
  sidebarStats,
  adminBadges,
  unreadNotifications,
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
      role={shellRole}
      currentPath="/settings/notifications"
      userId={userId}
      user={shellUser}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      adminBadges={adminBadges}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Page heading */}
        <div>
          <p className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-brand-400">
            პარამეტრები
          </p>
          <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight text-ink-50">
            შეტყობინებების პარამეტრები
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-400">
            მართე, თუ როდის და როგორ მიგივა შეტყობინებები ელ. ფოსტაზე.
          </p>
        </div>

        {/* Email preferences card */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          <div className="border-b border-ink-800 px-5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
              ელ. ფოსტის შეტყობინებები
            </p>
          </div>
          <div className="space-y-2 p-4">
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

        {/* Save state feedback */}
        {saveState !== 'idle' && (
          <p
            className={cn(
              'text-[13px]',
              saveState === 'saving' && 'text-ink-400',
              saveState === 'saved' && 'text-success-300',
              saveState === 'error' && 'text-danger-300',
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
