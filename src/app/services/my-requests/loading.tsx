import { Skeleton } from '@/components/ui/skeleton';

export default function MyRequestsLoading() {
  return (
    <div className="space-y-4 px-4 py-6">
      <Skeleton className="h-7 w-56" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
