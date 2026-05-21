import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function FootballerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'FOOTBALLER') {
    redirect('/dashboard');
  }

  const name = session.user.name ?? session.user.email ?? 'ფეხბურთელო';

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-semibold">გამარჯობა, {name}</h1>
        <p className="text-muted-foreground text-sm">ფეხბურთელის Dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="პროფილის სტატუსი"
          description="პროფილი შევსებულია ნაწილობრივ. დაასრულე მისი შევსება."
          href="/onboarding"
          cta="პროფილის შევსება"
        />
        <DashboardCard
          title="განაცხადები"
          description="შენი სამსახურის განაცხადების სტატუსი."
          href="#"
          cta="ნახვა"
        />
        <DashboardCard
          title="შეტყობინებები"
          description="ახალი შეტყობინებები კლუბებისგან."
          href="#"
          cta="ნახვა"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <h2 className="font-medium">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <a
        href={href}
        className="inline-block text-sm text-primary hover:underline underline-offset-4"
      >
        {cta} →
      </a>
    </div>
  );
}
