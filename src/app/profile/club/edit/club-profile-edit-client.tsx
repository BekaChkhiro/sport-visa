'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VerificationStatus } from '@/components/verification-badge';
import type { AppSidebarStats } from '@/components/app-sidebar';
import { COUNTRIES } from '@/lib/onboarding/schemas';
import {
  updateClubIdentity,
  updateClubLogo,
  updateClubCover,
  updateClubVisibility,
} from '@/lib/club-profile/actions';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type IdentityForm = {
  name: string;
  foundedYear: string;
  country: string;
  city: string;
  league: string;
  stadiumName: string;
  stadiumCapacity: string;
  officialWebsite: string;
};

type MediaState = {
  logoUrl?: string;
  logoKey?: string;
  coverUrl?: string;
  coverKey?: string;
};

type ClubProfileEditClientProps = {
  currentPath: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
  };
  stats: AppSidebarStats;
  initialIdentity: IdentityForm;
  initialMedia: MediaState;
  isVisible: boolean;
};

type SectionStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Root component ────────────────────────────────────────────────────────────

export function ClubProfileEditClient({
  currentPath,
  user,
  stats,
  initialIdentity,
  initialMedia,
  isVisible,
}: ClubProfileEditClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell
      role="club"
      currentPath={currentPath}
      user={user}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="max-w-2xl space-y-8">
        <h1 className="text-2xl font-semibold">კლუბის პროფილის რედაქტირება</h1>

        <IdentitySection initialData={initialIdentity} />
        <MediaSection initialData={initialMedia} />
        <VisibilitySection initialVisible={isVisible} />
      </div>
    </AppShell>
  );
}

// ── Identity section ──────────────────────────────────────────────────────────

function IdentitySection({ initialData }: { initialData: IdentityForm }) {
  const [form, setForm] = React.useState<IdentityForm>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<SectionStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  function set(field: keyof IdentityForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');
    setErrors({});

    const result = await updateClubIdentity({
      name: form.name,
      foundedYear: form.foundedYear || undefined,
      country: form.country || undefined,
      city: form.city || undefined,
      league: form.league || undefined,
      stadiumName: form.stadiumName || undefined,
      stadiumCapacity: form.stadiumCapacity || undefined,
      officialWebsite: form.officialWebsite || undefined,
    });

    if (result.status === 'success') {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.message);
      if (result.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.[0]) flat[k] = msgs[0];
        }
        setErrors(flat);
      }
    }
  }

  return (
    <section aria-labelledby="identity-heading">
      <div className="mb-4">
        <h2
          id="identity-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          ვინაობა
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="კლუბის სახელი ★" error={errors.name} className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="FC Dinamo"
              aria-invalid={Boolean(errors.name)}
            />
          </Field>

          <Field label="დაარსების წელი" error={errors.foundedYear}>
            <Input
              type="number"
              value={form.foundedYear}
              onChange={(e) => set('foundedYear', e.target.value)}
              placeholder="1925"
              min={1800}
              max={new Date().getFullYear()}
            />
          </Field>

          <Field label="ქვეყანა" error={errors.country}>
            <Select value={form.country} onValueChange={(v) => set('country', v)}>
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.country)}>
                <SelectValue placeholder="აირჩიე..." />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="ქალაქი" error={errors.city}>
            <Input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="თბილისი"
              aria-invalid={Boolean(errors.city)}
            />
          </Field>

          <Field label="ლიგა / დივიზია" error={errors.league}>
            <Input
              value={form.league}
              onChange={(e) => set('league', e.target.value)}
              placeholder="Erovnuli Liga"
            />
          </Field>

          <Field label="სტადიონის სახელი" error={errors.stadiumName}>
            <Input
              value={form.stadiumName}
              onChange={(e) => set('stadiumName', e.target.value)}
              placeholder="Boris Paichadze Dinamo Arena"
            />
          </Field>

          <Field label="ტევადობა (ადგ.)" error={errors.stadiumCapacity}>
            <Input
              type="number"
              value={form.stadiumCapacity}
              onChange={(e) => set('stadiumCapacity', e.target.value)}
              placeholder="55000"
              min={0}
            />
          </Field>

          <Field label="ოფიციალური ვებგვ." error={errors.officialWebsite} className="sm:col-span-2">
            <Input
              type="url"
              value={form.officialWebsite}
              onChange={(e) => set('officialWebsite', e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
        </div>

        {errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          {status === 'saved' ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ შენახულია</p>
          ) : null}
          <Button
            onClick={handleSave}
            disabled={status === 'saving'}
            className={cn(status === 'error' && 'border-destructive')}
          >
            {status === 'saving' ? 'შენახვა...' : 'შენახვა'}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Media section ─────────────────────────────────────────────────────────────

const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const COVER_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function MediaSection({ initialData }: { initialData: MediaState }) {
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(initialData.logoUrl);
  const [coverUrl, setCoverUrl] = React.useState<string | undefined>(initialData.coverUrl);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [logoError, setLogoError] = React.useState('');
  const [coverError, setCoverError] = React.useState('');

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  async function uploadFile(
    file: File,
    kind: 'CLUB_LOGO' | 'CLUB_BANNER',
    maxBytes: number,
    setError: (msg: string) => void,
    setUploading: (v: boolean) => void,
    onSuccess: (url: string, key: string) => void,
  ) {
    if (file.size > maxBytes) {
      setError(`ფაილი ${Math.round(maxBytes / 1024 / 1024)} MB-ზე მეტია`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, contentType: file.type, contentLength: file.size }),
      });
      if (!presignRes.ok) {
        const err = (await presignRes.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message ?? 'ატვირთვის შეცდომა');
      }
      const { key, uploadUrl, requiredHeaders } = (await presignRes.json()) as {
        key: string;
        uploadUrl: string;
        requiredHeaders: Record<string, string>;
      };

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: requiredHeaders,
        body: file,
      });
      if (!putRes.ok) throw new Error('ატვირთვა ვერ მოხდა');

      const confirmRes = await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, kind }),
      });
      if (!confirmRes.ok) {
        const err = (await confirmRes.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message ?? 'დადასტურების შეცდომა');
      }
      const { url } = (await confirmRes.json()) as { url: string };

      const saveAction = kind === 'CLUB_LOGO' ? updateClubLogo(key) : updateClubCover(key);
      const result = await saveAction;
      if (result.status === 'error') throw new Error(result.message);

      onSuccess(url, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ატვირთვის შეცდომა');
    } finally {
      setUploading(false);
    }
  }

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    await uploadFile(file, 'CLUB_LOGO', LOGO_MAX_BYTES, setLogoError, setLogoUploading, (url) => {
      setLogoUrl(url);
    });
  }

  async function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    await uploadFile(
      file,
      'CLUB_BANNER',
      COVER_MAX_BYTES,
      setCoverError,
      setCoverUploading,
      (url) => {
        setCoverUrl(url);
      },
    );
  }

  return (
    <section aria-labelledby="media-heading">
      <div className="mb-4">
        <h2
          id="media-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          მედია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        {/* Logo */}
        <div className="space-y-3">
          <Label>ლოგო (სავალდებულო)</Label>
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="კლუბის ლოგო" className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl text-muted-foreground/40">▓</span>
              )}
            </div>
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
              >
                {logoUploading ? 'ატვირთვა...' : 'ლოგოს შეცვლა'}
              </Button>
              <p className="text-xs text-muted-foreground">PNG / SVG · მაქს. 2 MB · კვ. ფ.</p>
            </div>
          </div>
          {logoError ? (
            <p role="alert" className="text-sm text-destructive">
              {logoError}
            </p>
          ) : null}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg"
            className="hidden"
            onChange={handleLogoSelect}
          />
        </div>

        {/* Cover */}
        <div className="space-y-3">
          <Label>სტადიონის / გუნდის ფოტო</Label>
          <div
            onClick={() => coverInputRef.current?.click()}
            className={cn(
              'relative w-full aspect-[3/1] overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity',
              coverUploading && 'opacity-50 cursor-default',
            )}
          >
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="გარეკანი" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                <span className="text-3xl">░</span>
                <span className="text-xs">ფოტოს ატვირთვა</span>
              </div>
            )}
            {coverUrl ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                <span className="text-white text-sm font-medium">შეცვლა</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">JPG / PNG · მაქს. 10 MB</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
            >
              {coverUploading ? 'ატვირთვა...' : coverUrl ? 'ფოტოს შეცვლა' : 'ფოტოს ატვირთვა'}
            </Button>
          </div>
          {coverError ? (
            <p role="alert" className="text-sm text-destructive">
              {coverError}
            </p>
          ) : null}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverSelect}
          />
        </div>
      </div>
    </section>
  );
}

// ── Visibility section ────────────────────────────────────────────────────────

function VisibilitySection({ initialVisible }: { initialVisible: boolean }) {
  const [visible, setVisible] = React.useState(initialVisible);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function toggle() {
    setSaving(true);
    setError('');
    const next = !visible;
    const result = await updateClubVisibility(next);
    setSaving(false);
    if (result.status === 'success') {
      setVisible(next);
    } else {
      setError(result.message);
    }
  }

  return (
    <section aria-labelledby="visibility-heading">
      <div className="mb-4">
        <h2
          id="visibility-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          ხილვადობა
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">კლუბი ხილულია Directory-ში</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              გამორთვისას კლუბი მოიხსნება Directory-ს სიიდან, მაგრამ პირდაპირი ლინკი ხელმისაწვდომი
              დარჩება.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            onClick={toggle}
            disabled={saving}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
              visible ? 'bg-primary' : 'bg-input',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                visible ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
