'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// Catches errors thrown by the root layout itself. Must render its own
// <html>/<body> because the layout failed to render.
export default function GlobalError({
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
    <html lang="ka">
      <body className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium opacity-60">500</p>
          <h1 className="text-3xl font-semibold tracking-tight">აპლიკაცია ვერ ჩაიტვირთა</h1>
          <p className="max-w-prose opacity-80">მოულოდნელი შეცდომა. სცადეთ გვერდის გადატვირთვა.</p>
          {error.digest ? (
            <p className="font-mono text-xs opacity-60">შეცდომის ID: {error.digest}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          თავიდან ცდა
        </button>
      </body>
    </html>
  );
}
