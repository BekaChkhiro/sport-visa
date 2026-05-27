'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
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

function CategoryIcon({ slug, icon }: { slug: string; icon: string | null }) {
  const key = icon ?? slug;
  const Icon = ICON_MAP[key] ?? OtherServicesIcon;
  return <Icon className="size-8 text-primary" aria-hidden="true" />;
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
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
              Dashboard-ზე დაბრუნება
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">სერვისის მოთხოვნა</h1>
          <p className="mt-1 text-sm text-muted-foreground">ნაბიჯი 1 / 2 — სერვისის ტიპის არჩევა</p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="სერვისები მიუწვდომელია"
              description="ამჟამად სერვისის კატეგორიები არ არის ხელმისაწვდომი. სცადეთ მოგვიანებით."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <CategoryIcon slug={cat.slug} icon={cat.icon} />
                </div>

                <h2 className="mb-1 text-base font-semibold leading-snug">{cat.name}</h2>

                {cat.description && (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                )}

                <div className="mt-auto">
                  <Button variant="default" size="sm" asChild className="w-full">
                    <Link href={`/services/request/${cat.slug}`}>არჩევა</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
