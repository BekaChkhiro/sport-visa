import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileEditLoading() {
  return (
    <div className="max-w-2xl space-y-8 px-4 py-6">
      <Skeleton className="h-8 w-64" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-5">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ))}
    </div>
  );
}
