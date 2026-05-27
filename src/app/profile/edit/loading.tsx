import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ProfileEditClient: page title, then avatar + cover sections, then
// stacked form section cards.

function FormSectionSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <section>
      <Skeleton className="mb-4 h-3 w-44" />
      <div className="space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </section>
  );
}

export default function ProfileEditLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-2xl space-y-8">
        <Skeleton className="h-8 w-64" />

        {/* Avatar */}
        <section className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="size-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </section>

        {/* Cover */}
        <section className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </section>

        <FormSectionSkeleton fields={6} />
        <FormSectionSkeleton fields={6} />
        <FormSectionSkeleton fields={2} />
      </div>
    </AppShellSkeleton>
  );
}
