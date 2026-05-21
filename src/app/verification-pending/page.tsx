import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';

import { ResendButton } from './resend-button';

export const metadata: Metadata = {
  title: 'ელ. ფოსტის დადასტურება',
};

export default async function VerificationPendingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Already verified — middleware will route /dashboard to the right role page.
  if (session.user.emailVerified) {
    redirect('/dashboard');
  }

  const email = session.user.email ?? '';

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">შეამოწმე ელ. ფოსტა</h1>
          <p className="text-muted-foreground text-sm">სარეგისტრაციო ლინკი გაიგზავნა მისამართზე</p>
          {email ? <p className="font-medium">{email}</p> : null}
        </div>

        <div className="rounded-md border bg-card p-6 text-sm text-card-foreground space-y-3">
          <p>
            გთხოვ, შეამოწმე ელ. ფოსტა და დააჭირე ლინკს დასადასტურებლად. ლინკი მოქმედია 24 საათის
            განმავლობაში.
          </p>
          <p className="text-muted-foreground text-xs">
            წერილი ვერ იპოვე? შეამოწმე სპამის საქაღალდე.
          </p>
        </div>

        <ResendButton />
      </div>
    </div>
  );
}
