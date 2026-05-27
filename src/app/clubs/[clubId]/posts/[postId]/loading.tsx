import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function ClubPostLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Skeleton className="h-8 w-44" />
      <div className="space-y-4 rounded-xl border p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-7 w-3/4" />
        <SkeletonText lines={6} />
      </div>
    </div>
  );
}
