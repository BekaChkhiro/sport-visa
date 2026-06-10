'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ArrowLeftIcon,
  MealPlanIcon,
  PersonalTrainerIcon,
  TeamDoctorIcon,
  OtherServicesIcon,
} from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import type { LucideProps } from 'lucide-react';

type ServiceCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
};

type ServiceCategoriesUser = {
  name: string;
  initials: string;
  image?: string;
  email?: string;
  position?: string;
  nationality?: string;
  verificationStatus?: VerificationStatus;
  profileCompletion: number;
};

type ServiceCategoriesClientProps = {
  currentPath: string;
  userId: string;
  user: ServiceCategoriesUser;
  stats: AppSidebarStats;
  unreadNotifications: number;
  categories: ServiceCategory[];
};

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  'meal-plan': MealPlanIcon,
  'personal-trainer': PersonalTrainerIcon,
  'team-doctor': TeamDoctorIcon,
  other: OtherServicesIcon,
};

/** Tone per category slug — cycles through brand/accent/iris/flame */
const TONE_MAP: Record<string, string> = {
  'meal-plan': 'brand',
  'personal-trainer': 'accent',
  'team-doctor': 'iris',
  other: 'flame',
};

const CHIP_TONE: Record<string, string> = {
  brand: 'bg-brand-400/15 text-brand-300',
  accent: 'bg-accent-400/15 text-accent-300',
  iris: 'bg-iris-400/15 text-iris-300',
  flame: 'bg-flame-400/15 text-flame-300',
};

const TONES = ['brand', 'accent', 'iris', 'flame'];

function CategoryIcon({ slug, icon }: { slug: string; icon: string | null }) {
  const key = icon ?? slug;
  const Icon = ICON_MAP[key] ?? OtherServicesIcon;
  return <Icon className="size-6" aria-hidden="true" />;
}

function getTone(slug: string, index: number): string {
  return TONE_MAP[slug] ?? TONES[index % TONES.length] ?? 'brand';
}

export function ServiceCategoriesClient({
  currentPath,
  userId,
  user,
  stats,
  unreadNotifications,
  categories,
}: ServiceCategoriesClientProps) {
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
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <Link
            href="/dashboard"
            className="-ml-2 mb-4 inline-flex items-center gap-1.5 rounded-btn px-2 py-1 text-[13px] font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Dashboard-ზე დაბრუნება
          </Link>

          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-50">
            სერვისის მოთხოვნა
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
            ნაბიჯი 1 / 2 — სერვისის ტიპის არჩევა
          </p>
        </div>

        {/* Section label */}
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
          ხელმისაწვდომი სერვისები
        </p>

        {categories.length === 0 ? (
          <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <EmptyState
              title="სერვისები მიუწვდომელია"
              description="ამჟამად სერვისის კატეგორიები არ არის ხელმისაწვდომი. სცადეთ მოგვიანებით."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((cat, i) => {
              const tone = getTone(cat.slug, i);
              const chipClass = CHIP_TONE[tone] ?? CHIP_TONE.brand ?? '';
              return (
                <Link
                  key={cat.id}
                  href={`/services/request/${cat.slug}`}
                  className="group flex items-start gap-4 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card transition-colors hover:border-ink-700"
                >
                  {/* Icon chip */}
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] ${chipClass}`}
                  >
                    <CategoryIcon slug={cat.slug} icon={cat.icon} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-ink-50">{cat.name}</p>
                    {cat.description && (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-400">
                        {cat.description}
                      </p>
                    )}
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-300">
                      არჩევა
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
