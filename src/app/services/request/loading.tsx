import { Skeleton } from '@/components/ui/skeleton';

export default function ServiceRequestLoading() {
  return (
    <div className="space-y-6 px-4 py-6">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-5">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
