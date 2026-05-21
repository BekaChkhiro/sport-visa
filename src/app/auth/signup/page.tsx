import Link from 'next/link';
import type { Metadata } from 'next';

import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'რეგისტრაცია',
};

type SearchParams = Promise<{ role?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialRole = params.role === 'club' ? 'CLUB' : 'FOOTBALLER';
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sport Visa-ში რეგისტრაცია</h1>
        <p className="text-sm text-muted-foreground">
          უკვე გაქვს ანგარიში?{' '}
          <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
            შესვლა
          </Link>
        </p>
      </div>
      <SignupForm initialRole={initialRole} />
    </div>
  );
}
