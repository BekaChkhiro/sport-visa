import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ProfileEditClient: page title → sidebar-nav + main panel with
// a form card and prev/next footer.

export default function ProfileEditLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-[900px]">
        {/* Page header */}
        <div className="mb-7 space-y-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3.5 w-80" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar nav */}
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-2.5 shadow-card">
            <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
              <Skeleton className="h-2.5 w-14" />
            </div>
            <div className="space-y-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2.5 py-2.5">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-[9px]" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main panel */}
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-ink-800 px-6 py-5">
              <Skeleton className="h-10 w-10 shrink-0 rounded-[11px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            {/* Form body */}
            <div className="px-6 py-6 space-y-5">
              {/* Avatar row */}
              <div className="flex items-center gap-5 rounded-card border border-ink-800 bg-ink-950/40 p-4">
                <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-24 rounded-btn" />
              </div>

              {/* Cover row */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-28 w-full rounded-card" />
              </div>

              {/* Form fields grid */}
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-field" />
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-24 w-full rounded-field" />
              </div>

              {/* Save button */}
              <div className="flex justify-end border-t border-ink-800 pt-4">
                <Skeleton className="h-9 w-24 rounded-btn" />
              </div>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between border-t border-ink-800 px-6 py-4">
              <Skeleton className="h-8 w-16 rounded-btn" />
              <Skeleton className="h-8 w-20 rounded-btn" />
            </div>
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
