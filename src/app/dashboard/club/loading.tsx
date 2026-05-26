import { Skeleton, SkeletonCard, SkeletonListItem } from '@/components/ui/skeleton';

export default function ClubDashboardLoading() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="rounded-xl border">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonListItem key={i} className="border-b last:border-0 px-4" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
