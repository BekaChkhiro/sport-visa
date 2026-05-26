import { Skeleton, SkeletonCard, SkeletonListItem } from '@/components/ui/skeleton';

export default function FootballerDashboardLoading() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-6">
      <Skeleton className="h-20 w-full rounded-xl" />

      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="rounded-xl border">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListItem key={i} className="border-b last:border-0 px-4" />
          ))}
        </div>
      </div>
    </div>
  );
}
