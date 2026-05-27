import { Skeleton } from '@/components/ui/skeleton';

export default function ClubDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
