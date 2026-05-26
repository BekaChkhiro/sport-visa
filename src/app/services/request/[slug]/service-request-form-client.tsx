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
import { ArrowLeftIcon } from '@/components/icons';
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
        <div className="flex max-w-md flex-col items-center justify-center py-12 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              className="size-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight">მოთხოვნა გაიგზავნა!</h1>

          <div className="mb-6 w-full rounded-xl border border-border bg-card p-5 text-left">
            <p className="mb-1 text-base font-semibold">{result.categoryName}</p>
            <p className="mb-1 text-sm text-muted-foreground">
              ID: <span className="font-mono">{result.requestCode}</span>
            </p>
            <p className="mb-4 text-sm text-muted-foreground">სტატუსი: ⏳ განხილვაში</p>
            <p className="text-sm text-muted-foreground">
              ადმინი განიხილავს მოთხოვნას 24–48 საათში.
              <br />
              პასუხი მოვა ელ. ფოსტაზე:{' '}
              <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
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
      <div className="max-w-2xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/services/request">
              <ArrowLeftIcon className="size-4" />
              სერვისის ტიპის შეცვლა
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">{category.name} — დეტალები</h1>
          <p className="mt-1 text-sm text-muted-foreground">ნაბიჯი 2 / 2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            {/* Subject field — only for "other" category */}
            {isOther(category.slug) && (
              <div className="space-y-2">
                <Label htmlFor="subject">
                  თემა <span className="text-destructive">★</span>
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
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  პერიოდი <span className="text-destructive">★</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs text-muted-foreground">
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
                    <Label htmlFor="endDate" className="text-xs text-muted-foreground">
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
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  კვების ტიპი <span className="text-destructive">★</span>
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
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary restrictions — only for meal-plan */}
            {isMealPlan(category.slug) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">დიეტური შეზღუდვები</p>
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
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes / special requests */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {isOther(category.slug)
                  ? 'დეტალები'
                  : 'დამატებითი შენიშვნები / სპეციალური მოთხოვნები'}{' '}
                <span className="text-xs text-muted-foreground">(მაქს. 500)</span>
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
              <p className="text-right text-xs text-muted-foreground">{notes.length}/500</p>
            </div>

            {/* Contact preference */}
            <div className="space-y-2">
              <p className="text-sm font-medium">საკონტაქტო პრეფერენცია</p>
              <div className="flex flex-wrap gap-4">
                {CONTACT_PREF_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="contactPref"
                      value={opt.value}
                      checked={contactPref === opt.value}
                      onChange={() => setContactPref(opt.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                ℹ მოთხოვნა განიხილება ადმინისტრატორის მიერ და მოგეწოდებათ პასუხი 48 საათში.
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-between gap-4">
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
