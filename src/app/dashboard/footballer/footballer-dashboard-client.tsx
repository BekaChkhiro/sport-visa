'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, PlusIcon } from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';

type SubscribedClub = {
  id: string;
  name: string;
  logoUrl?: string;
};

type FootballerDashboardUser = {
  name: string;
  initials: string;
  image?: string;
  email?: string;
  position?: string;
  nationality?: string;
  verificationStatus?: VerificationStatus;
  profileCompletion: number;
};

type FootballerDashboardClientProps = {
  currentPath: string;
  user: FootballerDashboardUser;
  stats: AppSidebarStats;
  unreadNotifications: number;
  subscribedClubs: SubscribedClub[];
  profileMissingFields: string[];
};

export function FootballerDashboardClient({
  currentPath,
  user,
  stats,
  unreadNotifications,
  subscribedClubs,
  profileMissingFields,
}: FootballerDashboardClientProps) {
  const router = useRouter();
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell
      role="footballer"
      currentPath={currentPath}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={stats}
      onSignOut={handleSignOut}
    >
      <div className="space-y-8 max-w-3xl">
        {!bannerDismissed && user.profileCompletion < 100 ? (
          <ProfileCompletionBanner
            percent={user.profileCompletion}
            missingFields={profileMissingFields}
            onComplete={() => router.push('/onboarding')}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}

        <section aria-labelledby="newsfeed-heading">
          <h2
            id="newsfeed-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            კლუბის სიახლეები
          </h2>
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="სიახლეები არ არის"
              description="გამოწერე კლუბი, რომ მათი სიახლეები გამოჩნდეს."
              action={
                <Button variant="default" size="sm" asChild>
                  <Link href="/clubs">
                    <PlusIcon className="size-4" />
                    კლუბების ძიება
                  </Link>
                </Button>
              }
            />
          </div>
        </section>

        <section aria-labelledby="service-requests-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="service-requests-heading"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              სერვის მოთხოვნები
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/services/request">
                <PlusIcon className="size-4" />
                ახ. მოთხ.
              </Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="მოთხოვნები არ არის"
              description="სერვისის მოთხოვნა ჯერ არ გამოგიგზავნია."
            />
          </div>
        </section>

        {subscribedClubs.length > 0 ? (
          <section aria-labelledby="subscribed-clubs-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="subscribed-clubs-heading"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                გამოწერილი კლუბები
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clubs">
                  ყველა
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {subscribedClubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  {club.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      className="size-6 rounded object-cover"
                    />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                      {club.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="font-medium">{club.name}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
