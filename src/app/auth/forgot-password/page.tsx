import Link from 'next/link';
import type { Metadata } from 'next';

import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'პაროლის აღდგენა',
};

// Placeholder for the password reset email flow that lands in T3.4.
// The form here always returns a generic "if the address exists you'll get
// an email" message so the page works end-to-end (no enumeration) even
// before Resend wiring is in place.
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">პაროლის აღდგენა</h1>
        <p className="text-sm text-muted-foreground">
          შეიყვანე შენი ელ. ფოსტა და გამოგიგზავნით აღდგენის ლინკს.
        </p>
      </div>
      <ForgotPasswordForm />
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
