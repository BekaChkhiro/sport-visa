import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function ProfilePreviewLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-4 rounded-xl border p-5">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}
