import Link from 'next/link';
import type { Metadata } from 'next';

import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'პაროლის აღდგენა',
};

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
