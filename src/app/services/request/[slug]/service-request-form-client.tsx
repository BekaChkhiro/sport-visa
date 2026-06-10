'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, CheckCircleIcon } from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';

type Category = { id: string; slug: string; name: string };

type ServiceRequestFormUser = {
  name: string;
  initials: string;
  image?: string;
  email?: string;
  position?: string;
  nationality?: string;
  verificationStatus?: VerificationStatus;
  profileCompletion: number;
};

type ServiceRequestFormClientProps = {
  currentPath: string;
  userId: string;
  userEmail: string;
  user: ServiceRequestFormUser;
  stats: AppSidebarStats;
  unreadNotifications: number;
  category: Category;
};

type SubmitResult = {
  id: string;
  requestCode: string;
  status: string;
  categoryName: string;
};

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'ვეგეტარიანული' },
  { value: 'vegan', label: 'ვეგანური' },
  { value: 'gluten-free', label: 'გლუტენის გარეშე' },
  { value: 'lactose-free', label: 'ლაქტოზის გარეშე' },
];

const PLAN_TYPE_OPTIONS = [
  { value: '3', label: '3 კვება / დღე' },
  { value: '4', label: '4 კვება / დღე' },
  { value: '5', label: '5 კვება / დღე' },
];

const CONTACT_PREF_OPTIONS = [
  { value: 'EMAIL', label: 'ელ. ფოსტა' },
  { value: 'PHONE', label: 'ტელეფონი' },
  { value: 'CHAT', label: 'ჩატი' },
] as const;

function isMealPlan(slug: string) {
  return slug === 'meal-plan';
}

function isOther(slug: string) {
  return slug === 'other';
}

function showDates(slug: string) {
  return !isOther(slug);
}

export function ServiceRequestFormClient({
  currentPath,
  userId,
  userEmail,
  user,
  stats,
  unreadNotifications,
  category,
}: ServiceRequestFormClientProps) {
  const router = useRouter();

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [contactPref, setContactPref] = React.useState<'EMAIL' | 'PHONE' | 'CHAT'>('EMAIL');
  const [planType, setPlanType] = React.useState('3');
  const [dietary, setDietary] = React.useState<string[]>([]);
  const [subject, setSubject] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SubmitResult | null>(null);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  function toggleDietary(value: string) {
    setDietary((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const metadata: Record<string, unknown> = {};
    if (isMealPlan(category.slug)) {
      metadata.planType = planType;
      if (dietary.length > 0) metadata.dietary = dietary;
    }
    if (isOther(category.slug) && subject.trim()) {
      metadata.subject = subject.trim();
    }

    try {
      const res = await fetch('/api/services/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          notes: notes.trim() || undefined,
          contactPref,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        throw new Error(data.error?.message ?? 'სერვერის შეცდომა');
      }

      const data = (await res.json()) as SubmitResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'დაფიქსირდა შეცდომა. სცადეთ თავიდან.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <AppShell
        role="footballer"
        currentPath={currentPath}
        userId={userId}
        user={user}
        unreadNotifications={unreadNotifications}
        sidebarStats={stats}
        onSignOut={handleSignOut}
      >
        {/* Success state */}
        <div className="flex max-w-md flex-col items-center py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-400/15 text-success-300">
            <CheckCircleIcon className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-[22px] font-bold text-ink-50">
            მოთხოვნა გაიგზავნა!
          </h1>

          <div className="mt-6 w-full rounded-card border border-ink-800 bg-ink-900 p-5 text-left shadow-card">
            <p className="text-[14px] font-semibold text-ink-100">{result.categoryName}</p>
            <p className="mt-1 font-mono text-[12px] text-ink-500">
              ID: <span className="font-mono">{result.requestCode}</span>
            </p>
            <p className="mt-1 text-[12.5px] text-ink-400">სტატუსი: ⏳ განხილვაში</p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-400">
              ადმინი განიხილავს მოთხოვნას 24–48 საათში.
              <br />
              პასუხი მოვა ელ. ფოსტაზე: <span className="font-medium text-ink-200">{userEmail}</span>
            </p>
          </div>

          <div className="mt-5 flex w-full flex-col gap-2.5">
            <Button variant="default" asChild className="w-full">
              <Link href="/dashboard">Dashboard-ზე დაბრუნება</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/services/my-requests">ჩემი მოთხოვნები</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/services/request">სხვა სერვისის მოთხოვნა</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="footballer"
      currentPath={currentPath}
      userId={userId}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/services/request">
              <ArrowLeftIcon className="size-4" />
              სერვისის ტიპის შეცვლა
            </Link>
          </Button>

          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink-50">
            {category.name} — დეტალები
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
            ნაბიჯი 2 / 2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-card border border-ink-800 bg-ink-900 p-6 shadow-card space-y-5">
            {/* Subject field — only for "other" category */}
            {isOther(category.slug) && (
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-[12px] font-medium text-ink-300">
                  თემა <span className="text-danger-400">★</span>
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="მოთხოვნის მოკლე სათაური"
                  required
                  maxLength={200}
                />
              </div>
            )}

            {/* Duration / Period — not shown for "other" */}
            {showDates(category.slug) && (
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-ink-300">
                  პერიოდი <span className="text-danger-400">★</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-[11px] text-ink-500">
                      დაწყების თარიღი
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-[11px] text-ink-500">
                      დამთავრების თარიღი
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Plan type — only for meal-plan */}
            {isMealPlan(category.slug) && (
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-ink-300">
                  კვების ტიპი <span className="text-danger-400">★</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {PLAN_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="planType"
                        value={opt.value}
                        checked={planType === opt.value}
                        onChange={() => setPlanType(opt.value)}
                        className="accent-primary"
                      />
                      <span className="text-[13px] text-ink-200">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary restrictions — only for meal-plan */}
            {isMealPlan(category.slug) && (
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-ink-300">
                  დიეტური შეზღუდვები{' '}
                  <span className="font-normal text-ink-600">· არასავალდებულო</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {DIETARY_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        value={opt.value}
                        checked={dietary.includes(opt.value)}
                        onChange={() => toggleDietary(opt.value)}
                        className="accent-primary"
                      />
                      <span className="text-[13px] text-ink-200">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes / special requests */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[12px] font-medium text-ink-300">
                {isOther(category.slug)
                  ? 'დეტალები'
                  : 'დამატებითი შენიშვნები / სპეციალური მოთხოვნები'}{' '}
                <span className="font-normal text-ink-600 text-[11px]">(მაქს. 500)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder={
                  isOther(category.slug)
                    ? 'აღწერეთ თქვენი მოთხოვნა...'
                    : 'ნებისმიერი დამატებითი ინფორმაცია...'
                }
              />
              <p className="text-right text-[11px] text-ink-600">{notes.length}/500</p>
            </div>

            {/* Contact preference */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-ink-300">საკონტაქტო პრეფერენცია</p>
              <div
                className="inline-flex rounded-field border border-ink-700 bg-ink-950 p-1"
                role="group"
                aria-label="საკონტაქტო პრეფერენცია"
              >
                {CONTACT_PREF_OPTIONS.map((opt) => (
                  <label key={opt.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value={opt.value}
                      checked={contactPref === opt.value}
                      onChange={() => setContactPref(opt.value)}
                    />
                    <span
                      className={`block rounded-[8px] px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                        contactPref === opt.value
                          ? 'bg-brand-400 text-ink-950'
                          : 'text-ink-300 hover:text-ink-100'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="flex gap-2.5 rounded-card border border-ink-800 bg-ink-950/50 px-3.5 py-2.5">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0 text-accent-400"
                aria-hidden="true"
              >
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
              </svg>
              <p className="text-[12.5px] leading-relaxed text-ink-300">
                ℹ მოთხოვნა განიხილება ადმინისტრატორის მიერ და მოგეწოდებათ პასუხი 48 საათში.
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-danger-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" asChild>
              <Link href="/services/request">
                <ArrowLeftIcon className="size-4" />
                უკან
              </Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
