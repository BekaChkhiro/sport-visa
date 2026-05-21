import Link from 'next/link';
import type { Metadata } from 'next';

import { SigninForm } from './signin-form';

export const metadata: Metadata = {
  title: 'შესვლა',
};

export default function SigninPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">შესვლა</h1>
        <p className="text-sm text-muted-foreground">
          ანგარიში არ გაქვს?{' '}
          <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
            რეგისტრაცია
          </Link>
        </p>
      </div>
      <SigninForm />
    </div>
  );
}
