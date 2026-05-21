import Link from 'next/link';
import type { Metadata } from 'next';

import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'ახალი პაროლი',
};

type SearchParams = Promise<{ token?: string; email?: string }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">ახალი პაროლი</h1>
        </div>
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          ლინკი არასწორია. გთხოვ, გაიმეოროე პაროლის აღდგენა.
        </div>
        <p className="text-center text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            ← პაროლის აღდგენა
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">ახალი პაროლი</h1>
        <p className="text-sm text-muted-foreground">შეიყვანე ახალი პაროლი შენი ანგარიშისთვის.</p>
      </div>
      <ResetPasswordForm token={token} email={email} />
      <p className="text-center text-sm">
        <Link
          href="/auth/signin"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          ← შესვლაზე დაბრუნება
        </Link>
      </p>
    </div>
  );
}
