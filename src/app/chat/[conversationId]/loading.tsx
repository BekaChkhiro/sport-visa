import { Skeleton } from '@/components/ui/skeleton';

export default function ChatThreadLoading() {
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-3 px-4 py-6">
      <div className="flex items-center gap-3 border-b pb-3">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex-1 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={i % 2 === 0 ? 'flex justify-start' : 'flex justify-end'}>
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
