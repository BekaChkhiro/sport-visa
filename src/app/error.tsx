'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm font-medium">500</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">რაღაც შეცდომა მოხდა</h1>
        <p className="text-muted-foreground max-w-prose">
          გვერდის ჩატვირთვისას შეცდომა მოხდა. ცადეთ თავიდან ან დაბრუნდით მთავარ გვერდზე.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground/70 font-mono text-xs">შეცდომის ID: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>თავიდან ცდა</Button>
        <Button variant="outline" asChild>
          <Link href="/">მთავარ გვერდზე</Link>
        </Button>
      </div>
    </div>
  );
}
