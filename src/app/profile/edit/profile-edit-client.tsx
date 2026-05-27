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
import { cn } from '@/lib/utils';

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
  initialPersonalInfo: PersonalInfo;
  initialSportInfo: SportInfo;
  initialCareerEntries: CareerEntry[];
  initialAgentInfo: AgentInfo;
  initialGalleryPhotos: GalleryPhoto[];
};

export function ProfileEditClient({
  currentPath,
  userId,
  user,
  unreadNotifications,
  sidebarStats,
  initialPersonalInfo,
  initialSportInfo,
  initialCareerEntries,
  initialAgentInfo,
  initialGalleryPhotos,
}: ProfileEditClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

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
      <div className="max-w-2xl space-y-8">
        <h1 className="text-2xl font-semibold">პროფილის რედაქტირება</h1>

        <PersonalInfoSection initialData={initialPersonalInfo} />
        <SportInfoSection initialData={initialSportInfo} />
        <PhotoGallerySection initialPhotos={initialGalleryPhotos} />
        <CareerHistorySection initialEntries={initialCareerEntries} />
        <AgentInfoSection initialData={initialAgentInfo} />
      </div>
    </AppShell>
  );
}

// ── Personal info section ─────────────────────────────────────────────────────

type SectionStatus = 'idle' | 'saving' | 'saved' | 'error';

function PersonalInfoSection({ initialData }: { initialData: PersonalInfo }) {
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
    <section aria-labelledby="personal-info-heading">
      <div className="mb-4">
        <h2
          id="personal-info-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          პირადი ინფორმაცია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
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
              placeholder="მაგალითთი"
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
    <section aria-labelledby="sport-info-heading">
      <div className="mb-4">
        <h2
          id="sport-info-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          სპორტული ინფორმაცია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-1.5">
          <Label>
            პოზიცია ★ <span className="text-muted-foreground font-normal text-xs">(მაქს. 2)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {POSITION_VALUES.map((pos) => {
              const selected = form.positions.includes(pos);
              const disabled = !selected && form.positions.length >= 2;
              return (
                <button
                  key={pos}
                  type="button"
                  title={POSITION_LABELS[pos]}
                  onClick={() => !disabled && togglePosition(pos)}
                  aria-pressed={selected}
                  disabled={disabled}
                  className={cn(
                    'h-9 w-12 rounded border text-xs font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:border-muted-foreground/40 disabled:opacity-40',
                  )}
                >
                  {pos}
                </button>
              );
            })}
          </div>
          {errors.positions ? <p className="text-sm text-destructive">{errors.positions}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label>ძირითადი ფეხი ★</Label>
          <div className="flex gap-3">
            {DOMINANT_FOOT_VALUES.map((foot) => (
              <button
                key={foot}
                type="button"
                onClick={() => set('dominantFoot', foot)}
                aria-pressed={form.dominantFoot === foot}
                className={cn(
                  'flex-1 h-9 rounded border text-sm font-medium transition-colors',
                  form.dominantFoot === foot
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-input hover:border-muted-foreground/40',
                )}
              >
                {DOMINANT_FOOT_LABELS[foot]}
              </button>
            ))}
          </div>
          {errors.dominantFoot ? (
            <p className="text-sm text-destructive">{errors.dominantFoot}</p>
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
    <section aria-labelledby="photo-gallery-heading">
      <div className="mb-4">
        <h2
          id="photo-gallery-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          ფოტო გალერეა
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDraggingId(photo.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(photo.id)}
              onDragEnd={() => setDraggingId(null)}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border border-border cursor-grab',
                draggingId === photo.id && 'opacity-50 border-primary',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`ფოტო ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[10px] leading-none bg-primary/80 text-primary-foreground px-1 py-0.5 rounded">
                  გარეკ.
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center text-xs leading-none transition-colors"
                aria-label="ფოტოს წაშლა"
              >
                ×
              </button>
            </div>
          ))}

          {photos.length < MAX_GALLERY_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center text-2xl text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              aria-label="ფოტოს ატვირთვა"
            >
              {uploading ? '…' : '+'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {photos.length}/{MAX_GALLERY_PHOTOS} ფოტო
          </span>
          {photos.length < MAX_GALLERY_PHOTOS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'ატვირთვა...' : '+ ატვირთვა'}
            </Button>
          )}
        </div>

        {uploadError ? (
          <p role="alert" className="text-sm text-destructive">
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
    </section>
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
    <section aria-labelledby="career-history-heading">
      <div className="mb-4">
        <h2
          id="career-history-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          კარიერის ისტორია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {entries.length === 0 && editingId === null ? (
          <p className="text-sm text-muted-foreground">
            კარიერის ჩანაწერი არ არის. დაამატე პირველი.
          </p>
        ) : null}

        <ul className="space-y-2">
          {entries.map((entry) => (
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
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-sm">
                    <span className="font-medium">{entry.clubName}</span>
                    <span className="text-muted-foreground ml-2">
                      {entry.startYear}–{entry.endYear ?? 'დღ.'}
                    </span>
                    {entry.position ? (
                      <span className="text-muted-foreground ml-2">{entry.position}</span>
                    ) : null}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(entry)}
                      className="h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center text-sm transition-colors"
                      aria-label="რედაქტირება"
                    >
                      ✏
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="h-7 w-7 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center text-sm transition-colors"
                      aria-label="წაშლა"
                    >
                      ×
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
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            + კლუბის / გუნდის დამატება
          </button>
        )}
      </div>
    </section>
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
    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
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
            placeholder="მიმდ. (ცარიელი)"
            min={1950}
            max={new Date().getFullYear()}
            aria-invalid={Boolean(errors.endYear)}
          />
        </Field>

        <Field label="პოზიცია" error={errors.position}>
          <Select value={form.position} onValueChange={(v) => onField('position', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="— სურვ. —" />
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
        <p role="alert" className="text-sm text-destructive">
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
    <section aria-labelledby="agent-info-heading">
      <div className="mb-4">
        <h2
          id="agent-info-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          აგენტის ინფორმაცია
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="აგენტის სახელი" error={errors.agentName} className="sm:col-span-2">
            <Input
              value={form.agentName}
              onChange={(e) => set('agentName', e.target.value)}
              placeholder="გიორგი მაგალითი"
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
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
