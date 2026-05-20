import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">გვერდი ვერ მოიძებნა</h1>
        <p className="text-muted-foreground max-w-prose">
          მისამართი არსებობს, მაგრამ ამ მისამართზე გვერდი არ გვაქვს.
        </p>
      </div>
      <Button asChild>
        <Link href="/">მთავარ გვერდზე</Link>
      </Button>
    </div>
  );
}
