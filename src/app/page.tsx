import type { Metadata } from 'next';
import Link from 'next/link';
import { UserCircle, Search, MessageCircle, Building2, FileText, Bookmark } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatStrip } from '@/components/stat-strip';

export const metadata: Metadata = {
  title: 'Sport Visa — ფეხბურთელები კლუბებს ენახებიან',
  description: 'პლატფორმა, სადაც ფეხბურთელები კლუბებს პოულობენ და კლუბები ფეხბურთელებს.',
};

const HOW_IT_WORKS = [
  {
    icon: UserCircle,
    step: '01',
    title: 'შექმენი პროფილი',
    description: 'ატვირთე ფოტო, მიუთითე პოზიცია, ასაკი და ფიზიკური მახასიათებლები.',
  },
  {
    icon: Search,
    step: '02',
    title: 'იპოვე კლუბი ან მოთამაშე',
    description: 'გაფილტრე კლუბები ქალაქის, ლიგის და სხვა პარამეტრებით.',
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'დაუკავშირდი',
    description: 'გამოაგზავნე სერვისის მოთხოვნა ან გახსენი ჩატი პირდაპირ.',
  },
] as const;

const FOOTBALLER_FEATURES = [
  'პოზიციის, ასაკის, ფიზ. მახასიათებლების პროფილი',
  'ფოტო გალერეა',
  'კლუბის გამოწერა',
  'სერვისის მოთხოვნა',
];

const CLUB_FEATURES = [
  'სტადიონი, ისტორია, შემადგენლობა',
  'ფეხბურთელების directory',
  'ფილტრები + real-time ჩატი',
];

const FEATURES = [
  {
    icon: UserCircle,
    title: 'ფეხბურთელის პროფილი',
    description: 'შექმენი სრული პროფილი: პოზიცია, ასაკი, ფიზიკური მახასიათებლები და ფოტო გალერეა.',
  },
  {
    icon: Building2,
    title: 'კლუბების დირექტორია',
    description: 'დაათვალიერე კლუბები ქალაქის, ლიგის და სხვა პარამეტრების მიხედვით.',
  },
  {
    icon: Search,
    title: 'გაფართოებული ფილტრები',
    description: 'იპოვე სწორი კლუბი ან მოთამაშე — ფილტრაცია პოზიციით, ასაკით, ბიუჯეტით.',
  },
  {
    icon: MessageCircle,
    title: 'Real-time ჩატი',
    description: 'დაუკავშირდი კლუბს ან მოთამაშეს პირდაპირ — სწრაფი და მარტივი.',
  },
  {
    icon: FileText,
    title: 'სერვისის მოთხოვნა',
    description: 'მოითხოვე სკაუტი, გამოცდა ან სხვა სერვისი — ყველაფერი ერთ ფორმაში.',
  },
  {
    icon: Bookmark,
    title: 'შენი სიმოკლე',
    description: 'შეინახე და შეადარე საუკეთესო კლუბები ან მოთამაშეები მოგვიანებისთვის.',
  },
] as const;

const STATS = [
  { value: '500+', label: 'ფეხბურთელი' },
  { value: '80+', label: 'კლუბი' },
  { value: '1 200+', label: 'მატჩი' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 px-4 py-20 text-primary-foreground sm:py-28 lg:py-36">
        {/* Decorative circles */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90%" cy="10%" r="200" fill="white" />
            <circle cx="5%" cy="90%" r="140" fill="white" />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center gap-10 text-center lg:flex-row lg:items-center lg:gap-16 lg:text-left">
          {/* Copy */}
          <div className="flex flex-col gap-6 lg:flex-1">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Sport Visa
            </h1>
            <div className="flex flex-col gap-1.5 text-xl font-medium opacity-90 sm:text-2xl">
              <p>ფეხბურთელები კლუბებს ენახებიან.</p>
              <p>კლუბები ფეხბურთელებს პოულობენ.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" variant="secondary" className="text-base font-semibold" asChild>
                <Link href="/auth/signup?role=footballer">ფეხბურთელად რეგისტრაცია</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/auth/signup?role=club">კლუბად რეგისტრაცია</Link>
              </Button>
            </div>
          </div>

          {/* Illustration placeholder */}
          <div className="w-full max-w-sm flex-shrink-0 lg:flex-1 lg:max-w-md">
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10">
              <span className="text-sm text-primary-foreground/40">
                footballer + club badge illustration
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            როგორ მუშაობს
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {step}
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section className="bg-secondary/30 px-4 py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              ძირითადი ფუნქციები
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              ყველაფერი, რაც გჭირდება — ერთ პლატფორმაზე.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold leading-snug">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR FOOTBALLERS ───────────────────────────────────────── */}
      <section className="bg-secondary/40 px-4 py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Placeholder image */}
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
              <span className="text-sm text-muted-foreground">screenshot</span>
            </div>
            {/* Copy */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">ფეხბურთელისთვის</h2>
              <ul className="flex flex-col gap-3">
                {FOOTBALLER_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                    >
                      ✓
                    </span>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div>
                <Button size="lg" asChild>
                  <Link href="/auth/signup?role=footballer">დაიწყე — უფასოა</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR CLUBS ─────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Copy — reversed on desktop */}
            <div className="order-2 flex flex-col gap-6 lg:order-1">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">კლუბისთვის</h2>
              <ul className="flex flex-col gap-3">
                {CLUB_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                    >
                      ✓
                    </span>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div>
                <Button size="lg" asChild>
                  <Link href="/auth/signup?role=club">კლუბი დარეგისტრირდი</Link>
                </Button>
              </div>
            </div>
            {/* Placeholder image */}
            <div className="order-1 flex aspect-video w-full items-center justify-center rounded-xl bg-muted lg:order-2">
              <span className="text-sm text-muted-foreground">screenshot</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 px-4 py-12">
        <div className="container mx-auto">
          <StatStrip stats={STATS} className="mx-auto max-w-lg" />
        </div>
      </section>
    </div>
  );
}
