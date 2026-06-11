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
import { Textarea } from '@/components/ui/textarea';
import type { VerificationStatus } from '@/components/verification-badge';
import {
  updatePersonalInfo,
  updateSportInfo,
  addCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
  updateAgentInfo,
  addGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  updateAvatar,
  updateCover,
} from '@/lib/profile/actions';
import {
  COUNTRIES,
  DOMINANT_FOOT_LABELS,
  DOMINANT_FOOT_VALUES,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_VALUES,
  POSITION_LABELS,
  POSITION_VALUES,
} from '@/lib/onboarding/schemas';
import {
  UserIcon,
  PlusIcon,
  CloseIcon,
  CheckCircleIcon,
  CameraIcon,
  UploadIcon,
  DeleteIcon,
  InfoIcon,
  EditIcon,
  ShieldIcon,
  VideoIcon,
  ImageIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { PositionChip } from '@/components/position-chip';

type PersonalInfo = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  bio: string;
};

type SportInfo = {
  positions: string[];
  dominantFoot: string;
  height: string;
  weight: string;
  currentClub: string;
  jerseyNumber: string;
  experienceLevel: string;
  desiredLeague: string;
};

type CareerEntry = {
  id: string;
  clubName: string;
  startYear: number;
  endYear?: number;
  position?: string;
  orderIndex: number;
};

type AgentInfo = {
  agentName: string;
  agentPhone: string;
  agentEmail: string;
};

type GalleryPhoto = {
  id: string;
  mediaKey: string;
  url: string;
  isTemp?: boolean;
};

type StoredMedia = { key: string; url: string } | null;

type ProfileEditClientProps = {
  currentPath: string;
  userId: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    position?: string;
    nationality?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
    profileCompletion?: number;
  };
  unreadNotifications: number;
  sidebarStats?: { views?: number; saves?: number; unreadMessages?: number };
  initialAvatar: StoredMedia;
  initialCover: StoredMedia;
  initialPersonalInfo: PersonalInfo;
  initialSportInfo: SportInfo;
  initialCareerEntries: CareerEntry[];
  initialAgentInfo: AgentInfo;
  initialGalleryPhotos: GalleryPhoto[];
};

// ── Section metadata ──────────────────────────────────────────────────────────

type SectionId = 'basic' | 'sport' | 'gallery' | 'career' | 'agent';

const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'basic', label: 'პირადი ინფ.', hint: 'სახელი, დაბადება, ბიო' },
  { id: 'sport', label: 'სპ. ინფ.', hint: 'პოზიცია, ფეხი, სტატ.' },
  { id: 'gallery', label: 'გალერეა', hint: 'ფოტოები — მაქს. 8' },
  { id: 'career', label: 'კარიერა', hint: 'წინა კლუბები' },
  { id: 'agent', label: 'აგენტი', hint: 'საკონტაქტო ინფო' },
];

// ── Root component ────────────────────────────────────────────────────────────

export function ProfileEditClient({
  currentPath,
  userId,
  user,
  unreadNotifications,
  sidebarStats,
  initialAvatar,
  initialCover,
  initialPersonalInfo,
  initialSportInfo,
  initialCareerEntries,
  initialAgentInfo,
  initialGalleryPhotos,
}: ProfileEditClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState<SectionId>('basic');

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const curIdx = SECTIONS.findIndex((s) => s.id === activeSection);
  const cur = SECTIONS[curIdx]!;

  return (
    <AppShell
      role="footballer"
      currentPath={currentPath}
      userId={userId}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-[900px]">
        {/* Page header */}
        <div className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">პროფილი</p>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink-50">
            პროფილის რედაქტირება
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-400">
            სრული პროფილი 3x მეტ ნახვას იღებს სკაუტებისგან — შეავსე ყველა სექცია.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* ── Section nav (sticky sidebar) ────────────────────────────── */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-2.5 shadow-card">
              <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">
                  სექციები
                </span>
              </div>
              <div className="space-y-0.5">
                {SECTIONS.map((s) => {
                  const active = s.id === activeSection;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSection(s.id)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-btn px-2.5 py-2.5 text-left transition-colors',
                        active ? 'bg-ink-800' : 'hover:bg-ink-800/50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-colors',
                          active
                            ? 'bg-brand-400/15 text-brand-300'
                            : 'bg-ink-800 text-ink-400 group-hover:text-ink-200',
                        )}
                      >
                        <SectionIcon id={s.id} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-[13.5px] font-medium',
                            active ? 'text-ink-50' : 'text-ink-200',
                          )}
                        >
                          {s.label}
                        </span>
                        <span className="block truncate text-[11px] text-ink-500">{s.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Active section form panel ────────────────────────────────── */}
          <main className="min-w-0">
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              {/* Panel header */}
              <div className="flex items-center gap-3 border-b border-ink-800 px-6 py-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-brand-400/15 text-brand-300">
                  <SectionIcon id={activeSection} size={19} />
                </span>
                <div>
                  <h2 className="font-display text-[17px] font-bold tracking-tight text-ink-50">
                    {cur.label}
                  </h2>
                  <p className="text-[12.5px] text-ink-500">{cur.hint}</p>
                </div>
                <span className="ml-auto font-mono text-[12px] tabular-nums text-ink-600">
                  {curIdx + 1} / {SECTIONS.length}
                </span>
              </div>

              {/* Section body */}
              <div className="px-6 py-6">
                {activeSection === 'basic' && (
                  <PersonalInfoSection
                    initialAvatar={initialAvatar}
                    initialCover={initialCover}
                    initialData={initialPersonalInfo}
                  />
                )}
                {activeSection === 'sport' && <SportInfoSection initialData={initialSportInfo} />}
                {activeSection === 'gallery' && (
                  <PhotoGallerySection initialPhotos={initialGalleryPhotos} />
                )}
                {activeSection === 'career' && (
                  <CareerHistorySection initialEntries={initialCareerEntries} />
                )}
                {activeSection === 'agent' && <AgentInfoSection initialData={initialAgentInfo} />}
              </div>

              {/* Panel footer — prev/next */}
              <div className="flex items-center justify-between border-t border-ink-800 px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={curIdx === 0}
                  onClick={() => setActiveSection(SECTIONS[curIdx - 1]!.id)}
                >
                  ← წინა
                </Button>
                {curIdx < SECTIONS.length - 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection(SECTIONS[curIdx + 1]!.id)}
                  >
                    შემდეგი →
                  </Button>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}

// ── Section icon helper ───────────────────────────────────────────────────────

function SectionIcon({ id, size = 16 }: { id: SectionId; size?: number }) {
  const cls = `size-${size <= 16 ? '4' : '5'}`;
  switch (id) {
    case 'basic':
      return <UserIcon className={cls} />;
    case 'sport':
      return <ShieldIcon className={cls} />;
    case 'gallery':
      return <ImageIcon className={cls} />;
    case 'career':
      return <VideoIcon className={cls} />;
    case 'agent':
      return <UserIcon className={cls} />;
  }
}

// ── Shared section save footer ────────────────────────────────────────────────

type SectionStatus = 'idle' | 'saving' | 'saved' | 'error';

function SaveRow({
  status,
  onSave,
  label = 'შენახვა',
}: {
  status: SectionStatus;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-ink-800 pt-4">
      {status === 'saved' ? (
        <p className="flex items-center gap-1.5 text-[13px] text-success-300">
          <CheckCircleIcon className="size-4" />
          შენახულია
        </p>
      ) : null}
      <Button onClick={onSave} disabled={status === 'saving'}>
        {status === 'saving' ? 'შენახვა...' : label}
      </Button>
    </div>
  );
}

// ── Personal info section (avatar + cover + form) ─────────────────────────────

const AVATAR_ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const SINGLE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

function PersonalInfoSection({
  initialAvatar,
  initialCover,
  initialData,
}: {
  initialAvatar: StoredMedia;
  initialCover: StoredMedia;
  initialData: PersonalInfo;
}) {
  return (
    <div className="space-y-6">
      <AvatarRow initial={initialAvatar} />
      <CoverRow initial={initialCover} />
      <PersonalFormFields initialData={initialData} />
    </div>
  );
}

function AvatarRow({ initial }: { initial: StoredMedia }) {
  const [image, setImage] = React.useState<StoredMedia>(initial);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!AVATAR_ALLOWED.includes(file.type)) {
      setError('ნებადართულია მხოლოდ JPEG, PNG ან WEBP');
      return;
    }
    if (file.size > SINGLE_IMAGE_MAX_BYTES) {
      setError(`ფაილი ძალიან დიდია (მაქს. ${SINGLE_IMAGE_MAX_BYTES / 1024 / 1024} MB)`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'AVATAR',
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!presignRes.ok) throw new Error('Presign failed');
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
      if (!putRes.ok) throw new Error('Upload failed');

      const confirmRes = await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, kind: 'AVATAR' }),
      });
      if (!confirmRes.ok) throw new Error('Confirm failed');
      const { url } = (await confirmRes.json()) as { url: string };

      const result = await updateAvatar(key);
      if (result.status === 'error') throw new Error(result.message);

      setImage({ key, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ატვირთვა ვერ მოხდა');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!image) return;
    setUploading(true);
    const result = await updateAvatar(null);
    if (result.status === 'error') {
      setError(result.message);
    } else {
      setImage(null);
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-card border border-ink-800 bg-ink-950/40 p-4">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-ink-700 bg-ink-800">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt="ავატარი" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="size-8 text-ink-500" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="ფოტოს შეცვლა"
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-400 text-ink-950 ring-2 ring-ink-900 transition-colors hover:bg-brand-300 disabled:opacity-50"
        >
          <CameraIcon className="size-3.5" />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-ink-100">პროფილის ფოტო</p>
        <p className="mt-0.5 text-[12px] text-ink-500">JPG ან PNG, მაქს. 10MB. რეკ. 400×400.</p>
        {error ? (
          <p role="alert" className="mt-1 text-[12px] text-danger-300">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <UploadIcon className="size-3.5" />
          {uploading ? 'მუშ...' : image ? 'შეცვლა' : 'ატვირთვა'}
        </Button>
        {image ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            aria-label="ფოტოს წაშლა"
            className="flex h-9 w-9 items-center justify-center rounded-btn text-ink-500 transition-colors hover:bg-danger-400/10 hover:text-danger-300 disabled:opacity-50"
          >
            <DeleteIcon className="size-4" />
          </button>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_ALLOWED.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

function CoverRow({ initial }: { initial: StoredMedia }) {
  const [image, setImage] = React.useState<StoredMedia>(initial);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > SINGLE_IMAGE_MAX_BYTES) {
      setError(`ფაილი ძალიან დიდია (მაქს. ${SINGLE_IMAGE_MAX_BYTES / 1024 / 1024} MB)`);
      return;
    }
    setUploading(true);
    setError('');

    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'OTHER', contentType: file.type, contentLength: file.size }),
      });
      if (!presignRes.ok) throw new Error('Presign failed');
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
      if (!putRes.ok) throw new Error('Upload failed');

      const confirmRes = await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, kind: 'OTHER' }),
      });
      if (!confirmRes.ok) throw new Error('Confirm failed');
      const { url } = (await confirmRes.json()) as { url: string };

      const result = await updateCover(key);
      if (result.status === 'error') throw new Error(result.message);

      setImage({ key, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ატვირთვა ვერ მოხდა');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[12px] font-medium text-ink-300">გარეკანი (ბანერი)</Label>
      <div
        className={cn(
          'relative h-28 w-full overflow-hidden rounded-card border border-ink-700 bg-ink-800',
          uploading && 'opacity-50',
        )}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt="გარეკანი" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-ink-600">
            ბანერი არ არის
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-ink-500">JPG / PNG · მაქს. 10 MB · 1600×400</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <UploadIcon className="size-3.5" />
          {uploading ? 'მუშ...' : image ? 'შეცვლა' : 'ატვირთვა'}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-[12px] text-danger-300">
          {error}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

function PersonalFormFields({ initialData }: { initialData: PersonalInfo }) {
  const [form, setForm] = React.useState<PersonalInfo>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<SectionStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  function set(field: keyof PersonalInfo, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');
    setErrors({});

    const result = await updatePersonalInfo(form);

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="სახელი ★" error={errors.firstName}>
          <Input
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            placeholder="გიორგი"
            aria-invalid={Boolean(errors.firstName)}
          />
        </Field>

        <Field label="გვარი ★" error={errors.lastName}>
          <Input
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            placeholder="მაგ."
            aria-invalid={Boolean(errors.lastName)}
          />
        </Field>

        <Field label="დაბადების თარიღი ★" error={errors.dateOfBirth}>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            aria-invalid={Boolean(errors.dateOfBirth)}
          />
        </Field>

        <Field label="ეროვნება ★" error={errors.nationality}>
          <Select value={form.nationality} onValueChange={(v) => set('nationality', v)}>
            <SelectTrigger className="w-full" aria-invalid={Boolean(errors.nationality)}>
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

        <Field label="ქალაქი ★" error={errors.city}>
          <Input
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="თბილისი"
            aria-invalid={Boolean(errors.city)}
          />
        </Field>

        <Field label="ქვეყანა ★" error={errors.country}>
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

        <Field label="ტელეფონი" error={errors.phone} className="sm:col-span-2">
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+995 5XX XXX XXX"
          />
        </Field>
      </div>

      <Field label={`ბიო (${form.bio.length}/500)`} error={errors.bio}>
        <Textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="მოკლე აღწერა შენს შესახებ..."
          maxLength={500}
          rows={4}
        />
      </Field>

      {errorMessage ? (
        <p role="alert" className="text-sm text-danger-300">
          {errorMessage}
        </p>
      ) : null}

      <SaveRow status={status} onSave={handleSave} />
    </div>
  );
}

// ── Sport info section ────────────────────────────────────────────────────────

function SportInfoSection({ initialData }: { initialData: SportInfo }) {
  const [form, setForm] = React.useState<SportInfo>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<SectionStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  function set(field: keyof SportInfo, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function togglePosition(pos: string) {
    const current = form.positions;
    if (current.includes(pos)) {
      set(
        'positions',
        current.filter((p) => p !== pos),
      );
    } else if (current.length < 2) {
      set('positions', [...current, pos]);
    }
  }

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');
    setErrors({});

    const result = await updateSportInfo({
      positions: form.positions,
      dominantFoot: form.dominantFoot,
      height: form.height,
      weight: form.weight,
      currentClub: form.currentClub || undefined,
      jerseyNumber: form.jerseyNumber || undefined,
      experienceLevel: form.experienceLevel || undefined,
      desiredLeague: form.desiredLeague || undefined,
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
    <div className="space-y-5">
      {/* Positions */}
      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-ink-300">
          პოზიცია ★ <span className="font-normal text-ink-600">(მაქს. 2)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {POSITION_VALUES.map((pos) => {
            const selected = form.positions.includes(pos);
            const disabled = !selected && form.positions.length >= 2;
            return (
              <PositionChip
                key={pos}
                position={pos}
                selected={selected}
                disabled={disabled}
                onClick={() => !disabled && togglePosition(pos)}
              />
            );
          })}
        </div>
        {errors.positions ? (
          <p className="text-[12px] text-danger-300">{errors.positions}</p>
        ) : null}
      </div>

      {/* Dominant foot */}
      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-ink-300">ძირითადი ფეხი ★</Label>
        <div className="inline-flex rounded-field border border-ink-700 bg-ink-950 p-1">
          {DOMINANT_FOOT_VALUES.map((foot) => (
            <button
              key={foot}
              type="button"
              onClick={() => set('dominantFoot', foot)}
              aria-pressed={form.dominantFoot === foot}
              className={cn(
                'rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors',
                form.dominantFoot === foot
                  ? 'bg-brand-400 text-ink-950'
                  : 'text-ink-300 hover:text-ink-100',
              )}
            >
              {DOMINANT_FOOT_LABELS[foot]}
            </button>
          ))}
        </div>
        {errors.dominantFoot ? (
          <p className="text-[12px] text-danger-300">{errors.dominantFoot}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="სიმაღლე (სმ) ★" error={errors.height}>
          <Input
            type="number"
            value={form.height}
            onChange={(e) => set('height', e.target.value)}
            placeholder="175"
            min={100}
            max={250}
            aria-invalid={Boolean(errors.height)}
          />
        </Field>

        <Field label="წონა (კგ) ★" error={errors.weight}>
          <Input
            type="number"
            value={form.weight}
            onChange={(e) => set('weight', e.target.value)}
            placeholder="70"
            min={30}
            max={200}
            aria-invalid={Boolean(errors.weight)}
          />
        </Field>

        <Field label="ამჟ. კლუბი" error={errors.currentClub}>
          <Input
            value={form.currentClub}
            onChange={(e) => set('currentClub', e.target.value)}
            placeholder="FC Dinamo"
          />
        </Field>

        <Field label="მაისურის ნომ." error={errors.jerseyNumber}>
          <Input
            type="number"
            value={form.jerseyNumber}
            onChange={(e) => set('jerseyNumber', e.target.value)}
            placeholder="10"
            min={1}
            max={99}
          />
        </Field>
      </div>

      <Field label="გამოცდილება" error={errors.experienceLevel}>
        <Select value={form.experienceLevel} onValueChange={(v) => set('experienceLevel', v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="აირჩიე..." />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVEL_VALUES.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {EXPERIENCE_LEVEL_LABELS[lvl]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="სასურ. ლიგა / სეზონი" error={errors.desiredLeague}>
        <Input
          value={form.desiredLeague}
          onChange={(e) => set('desiredLeague', e.target.value)}
          placeholder="Georgian Erovnuli Liga"
        />
      </Field>

      {errorMessage ? (
        <p role="alert" className="text-sm text-danger-300">
          {errorMessage}
        </p>
      ) : null}

      <SaveRow status={status} onSave={handleSave} />
    </div>
  );
}

// ── Photo gallery section ─────────────────────────────────────────────────────

const MAX_GALLERY_PHOTOS = 8;

function PhotoGallerySection({ initialPhotos }: { initialPhotos: GalleryPhoto[] }) {
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>(initialPhotos);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (photos.length >= MAX_GALLERY_PHOTOS) {
      setUploadError(`მაქსიმუმ ${MAX_GALLERY_PHOTOS} ფოტო შეიძლება`);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'GALLERY', contentType: file.type, contentLength: file.size }),
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
        body: JSON.stringify({ key, kind: 'GALLERY' }),
      });
      if (!confirmRes.ok) {
        const err = (await confirmRes.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message ?? 'დადასტურების შეცდომა');
      }
      const { url } = (await confirmRes.json()) as { url: string };

      const result = await addGalleryItem(key);
      if (result.status === 'error') throw new Error(result.message);

      setPhotos((prev) => [...prev, { id: result.id, mediaKey: key, url }]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'ატვირთვის შეცდომა');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo: GalleryPhoto) {
    const result = await deleteGalleryItem(photo.id);
    if (result.status === 'success') {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;

    const fromIdx = photos.findIndex((p) => p.id === draggingId);
    const toIdx = photos.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const next = [...photos];
    const [moved] = next.splice(fromIdx, 1);
    if (!moved) return;
    next.splice(toIdx, 0, moved);
    setPhotos(next);
    setDraggingId(null);
    void reorderGalleryItems(next.map((p) => p.id));
  }

  return (
    <div className="space-y-4">
      {/* Info bar */}
      <div className="flex items-center gap-2 rounded-card border border-info-400/25 bg-info-400/8 px-3.5 py-2.5 text-[12.5px] text-info-200">
        <InfoIcon className="size-4 shrink-0" />
        ატვირთული {photos.length} / {MAX_GALLERY_PHOTOS} ფოტო. პირველი ფოტო გამოჩნდება როგორც
        მთავარი.
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => setDraggingId(photo.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(photo.id)}
            onDragEnd={() => setDraggingId(null)}
            className={cn(
              'group relative aspect-[4/3] cursor-grab overflow-hidden rounded-card border border-ink-800',
              draggingId === photo.id && 'opacity-50 border-brand-400/40',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={`ფოტო ${idx + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {idx === 0 && (
              <span className="absolute left-2 top-2 rounded-pill bg-brand-400 px-2 py-0.5 text-[10px] font-bold text-ink-950">
                მთავარი
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              aria-label="ფოტოს წაშლა"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/70 text-ink-200 opacity-0 backdrop-blur transition-opacity hover:bg-danger-500 hover:text-white group-hover:opacity-100"
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX_GALLERY_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="ფოტოს ატვირთვა"
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-ink-700 text-ink-500 transition-colors hover:border-brand-400/40 hover:text-brand-300 disabled:opacity-50"
          >
            <PlusIcon className="size-5" />
            <span className="text-[12px] font-medium">
              {uploading ? 'იტვ...' : 'ფოტოს დამატება'}
            </span>
          </button>
        )}
      </div>

      {uploadError ? (
        <p role="alert" className="text-[12px] text-danger-300">
          {uploadError}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

// ── Career history section ────────────────────────────────────────────────────

type CareerEntryForm = {
  clubName: string;
  startYear: string;
  endYear: string;
  position: string;
};

const EMPTY_CAREER_FORM: CareerEntryForm = {
  clubName: '',
  startYear: '',
  endYear: '',
  position: '',
};

function CareerHistorySection({ initialEntries }: { initialEntries: CareerEntry[] }) {
  const [entries, setEntries] = React.useState<CareerEntry[]>(initialEntries);
  const [editingId, setEditingId] = React.useState<string | 'new' | null>(null);
  const [form, setForm] = React.useState<CareerEntryForm>(EMPTY_CAREER_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  function openAdd() {
    setForm(EMPTY_CAREER_FORM);
    setErrors({});
    setErrorMessage('');
    setEditingId('new');
  }

  function openEdit(entry: CareerEntry) {
    setForm({
      clubName: entry.clubName,
      startYear: String(entry.startYear),
      endYear: entry.endYear != null ? String(entry.endYear) : '',
      position: entry.position ?? '',
    });
    setErrors({});
    setErrorMessage('');
    setEditingId(entry.id);
  }

  function cancel() {
    setEditingId(null);
    setForm(EMPTY_CAREER_FORM);
    setErrors({});
    setErrorMessage('');
  }

  function setField(field: keyof CareerEntryForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSave() {
    setSaving(true);
    setErrorMessage('');
    setErrors({});

    const payload = {
      clubName: form.clubName,
      startYear: form.startYear,
      endYear: form.endYear || undefined,
      position: form.position || undefined,
      orderIndex:
        editingId === 'new'
          ? entries.length
          : (entries.find((e) => e.id === editingId)?.orderIndex ?? 0),
    };

    const result =
      editingId === 'new'
        ? await addCareerEntry(payload)
        : await updateCareerEntry(editingId!, payload);

    setSaving(false);

    if (result.status === 'success') {
      if (editingId === 'new') {
        const tempEntry: CareerEntry = {
          id: `temp-${Date.now()}`,
          clubName: form.clubName,
          startYear: Number(form.startYear),
          endYear: form.endYear ? Number(form.endYear) : undefined,
          position: form.position || undefined,
          orderIndex: entries.length,
        };
        setEntries((prev) => [...prev, tempEntry]);
      } else {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingId
              ? {
                  ...e,
                  clubName: form.clubName,
                  startYear: Number(form.startYear),
                  endYear: form.endYear ? Number(form.endYear) : undefined,
                  position: form.position || undefined,
                }
              : e,
          ),
        );
      }
      cancel();
    } else {
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

  async function handleDelete(id: string) {
    const result = await deleteCareerEntry(id);
    if (result.status === 'success') {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) cancel();
    }
  }

  return (
    <div className="space-y-3">
      {entries.length === 0 && editingId === null ? (
        <p className="text-[13px] text-ink-500">კარიერის ჩანაწერი არ არის. დაამატე პირველი.</p>
      ) : null}

      <ul className="space-y-2">
        {entries.map((entry, idx) => (
          <li key={entry.id}>
            {editingId === entry.id ? (
              <CareerEntryFormRow
                form={form}
                errors={errors}
                errorMessage={errorMessage}
                saving={saving}
                onField={setField}
                onSave={handleSave}
                onCancel={cancel}
              />
            ) : (
              <div className="flex items-center gap-3 rounded-card border border-ink-800 bg-ink-950/40 px-4 py-3 transition-colors hover:border-ink-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-800 font-mono text-[11px] text-ink-400">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink-100">{entry.clubName}</p>
                  <p className="text-[11.5px] text-ink-500">
                    {entry.startYear}–{entry.endYear ?? 'დღ.'}
                    {entry.position ? ` · ${entry.position}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(entry)}
                    className="flex h-8 w-8 items-center justify-center rounded-btn text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-100"
                    aria-label="რედაქტირება"
                  >
                    <EditIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-btn text-ink-500 transition-colors hover:bg-danger-400/10 hover:text-danger-300"
                    aria-label="წაშლა"
                  >
                    <DeleteIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {editingId === 'new' ? (
        <CareerEntryFormRow
          form={form}
          errors={errors}
          errorMessage={errorMessage}
          saving={saving}
          onField={setField}
          onSave={handleSave}
          onCancel={cancel}
        />
      ) : (
        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-ink-700 py-3.5 text-[13px] font-medium text-ink-400 transition-colors hover:border-brand-400/40 hover:text-brand-300"
        >
          <PlusIcon className="size-4" />
          კლუბის / გუნდის დამატება
        </button>
      )}
    </div>
  );
}

function CareerEntryFormRow({
  form,
  errors,
  errorMessage,
  saving,
  onField,
  onSave,
  onCancel,
}: {
  form: CareerEntryForm;
  errors: Record<string, string>;
  errorMessage: string;
  saving: boolean;
  onField: (field: keyof CareerEntryForm, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="კლუბი / გუნდი ★" error={errors.clubName} className="sm:col-span-2">
          <Input
            value={form.clubName}
            onChange={(e) => onField('clubName', e.target.value)}
            placeholder="FC Dinamo Tbilisi"
            aria-invalid={Boolean(errors.clubName)}
          />
        </Field>

        <Field label="დაწყება (წ.) ★" error={errors.startYear}>
          <Input
            type="number"
            value={form.startYear}
            onChange={(e) => onField('startYear', e.target.value)}
            placeholder="2020"
            min={1950}
            max={new Date().getFullYear()}
            aria-invalid={Boolean(errors.startYear)}
          />
        </Field>

        <Field label="დასრულება (წ.)" error={errors.endYear}>
          <Input
            type="number"
            value={form.endYear}
            onChange={(e) => onField('endYear', e.target.value)}
            placeholder="მიმდ. (ცარ.)"
            min={1950}
            max={new Date().getFullYear()}
            aria-invalid={Boolean(errors.endYear)}
          />
        </Field>

        <Field label="პოზიცია" error={errors.position}>
          <Select value={form.position} onValueChange={(v) => onField('position', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="— სურ. —" />
            </SelectTrigger>
            <SelectContent>
              {POSITION_VALUES.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos} — {POSITION_LABELS[pos]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-[12px] text-danger-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          გაუქმება
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? 'შენახვა...' : 'შენახვა'}
        </Button>
      </div>
    </div>
  );
}

// ── Agent info section ────────────────────────────────────────────────────────

function AgentInfoSection({ initialData }: { initialData: AgentInfo }) {
  const [form, setForm] = React.useState<AgentInfo>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<SectionStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  function set(field: keyof AgentInfo, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSave() {
    setStatus('saving');
    setErrorMessage('');
    setErrors({});

    const result = await updateAgentInfo(form);

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="აგენტის სახელი" error={errors.agentName} className="sm:col-span-2">
          <Input
            value={form.agentName}
            onChange={(e) => set('agentName', e.target.value)}
            placeholder="გიორგი მაგ."
          />
        </Field>

        <Field label="აგენტის ტელეფონი" error={errors.agentPhone}>
          <Input
            type="tel"
            value={form.agentPhone}
            onChange={(e) => set('agentPhone', e.target.value)}
            placeholder="+995 5XX XXX XXX"
          />
        </Field>

        <Field label="აგენტის ელ.ფოსტა" error={errors.agentEmail}>
          <Input
            type="email"
            value={form.agentEmail}
            onChange={(e) => set('agentEmail', e.target.value)}
            placeholder="agent@example.com"
            aria-invalid={Boolean(errors.agentEmail)}
          />
        </Field>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-sm text-danger-300">
          {errorMessage}
        </p>
      ) : null}

      <SaveRow status={status} onSave={handleSave} />
    </div>
  );
}

// ── Shared field wrapper ──────────────────────────────────────────────────────

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
      <Label className="text-[12px] font-medium text-ink-300">{label}</Label>
      {children}
      {error ? <p className="text-[12px] text-danger-300">{error}</p> : null}
    </div>
  );
}
