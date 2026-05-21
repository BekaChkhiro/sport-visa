import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">ვერიფიკაციის რიგი და მართვა</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          title="ვერიფიკაციის რიგი"
          description="განხილვის მოლოდინში მყოფი ფეხბურთელები და კლუბები."
          href="#"
          cta="განხილვა"
        />
        <AdminCard
          title="მომხმარებლების მართვა"
          description="ყველა მომხმარებლის სია, სტატუსი და როლები."
          href="#"
          cta="ნახვა"
        />
        <AdminCard
          title="სერვისის მოთხოვნები"
          description="მომხმარებელთა მომლოდინე მოთხოვნები."
          href="#"
          cta="ნახვა"
        />
      </div>
    </div>
  );
}

function AdminCard({
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
