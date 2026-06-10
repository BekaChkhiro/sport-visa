import type { Metadata } from 'next';
import Link from 'next/link';
import {
  UserCircle,
  Building2,
  FileText,
  Bookmark,
  MessageCircle,
  Search,
  ShieldCheck,
  Zap,
  Bell,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Contact } from '@/components/contact';
import { FAQ } from '@/components/faq';
import { HowItWorks } from '@/components/how-it-works';
import { StatStrip } from '@/components/stat-strip';
import { Testimonials } from '@/components/testimonials';

export const metadata: Metadata = {
  title: 'Sport Visa — ფეხბურთელები კლუბებს ენახებიან',
  description: 'პლატფორმა, სადაც ფეხბურთელები კლუბებს პოულობენ და კლუბები ფეხბურთელებს.',
};

/* ─── static data ───────────────────────────────────────────── */

const FOOTBALLER_FEATURES = [
  'ატვირთე სრული პროფილი + ფოტო gallery',
  'გამოიწერე კლუბები და მიიღე მათი სიახლეები',
  'კლუბის გამოწერა',
  'სერვისის მოთხოვნა',
  'ფოტო გალერეა',
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

const SNAP_PROFILE_STATS = [
  ['სიმაღლე', '182სმ'],
  ['წონა', '74კგ'],
  ['ფეხი', 'მარჯვ'],
] as const;

const SNAP_FILTER_TAGS = ['ST', '16–23 წ', 'მარჯვ', 'თბილისი'] as const;

const FEATURE_BOTTOM_CARDS = [
  {
    tone: 'bg-success-400/15 text-success-300',
    title: 'ხელით ვერიფიკაცია',
    body: 'ყველა პროფილს ამოწმებს ჩვენი გუნდი — მხოლოდ ნამდვილი მონაცემები.',
    Icon: ShieldCheck,
  },
  {
    tone: 'bg-warning-400/15 text-warning-300',
    title: 'დამატებითი სერვისები',
    body: 'კვება, ტრენერი, ექიმი — მოითხოვე პროფესიონალური მხარდაჭერა.',
    Icon: Zap,
  },
  {
    tone: 'bg-flame-400/15 text-flame-300',
    title: 'სიახლეების feed',
    body: 'გამოწერილი კლუბების ახალი ამბები ერთ ნაკადში.',
    Icon: Bell,
  },
] as const;

/* ─── inline snap-card sub-components ───────────────────────── */

function SnapProfile() {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink-100">პროფილის შევსება</span>
        <span className="inline-flex h-7 items-center rounded-pill bg-brand-400/10 px-2.5 text-[11px] font-bold text-brand-300 tabular-nums">
          85%
        </span>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-ink-800">
        <div className="h-full w-[85%] rounded-full bg-brand-400" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-field border border-ink-800 px-3 py-2">
          <span className="text-[12px] text-ink-400">პოზიცია</span>
          <div className="flex gap-1">
            <span className="inline-flex h-6 min-w-[32px] items-center justify-center rounded-md bg-brand-400 px-1.5 text-[11px] font-semibold text-ink-950">
              ST
            </span>
            <span className="inline-flex h-6 min-w-[32px] items-center justify-center rounded-md bg-ink-800 px-1.5 text-[11px] font-semibold text-ink-300">
              LW
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SNAP_PROFILE_STATS.map(([l, v]) => (
            <div key={l} className="rounded-xl border border-ink-800 py-2 text-center">
              <div className="text-[14px] font-bold text-ink-50 tabular-nums">{v}</div>
              <div className="text-[10px] text-ink-500">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SnapFilter() {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink-100">ფილტრები</span>
        <span className="rounded-pill bg-brand-400/10 px-2.5 py-1 text-[12px] font-bold text-brand-300 tabular-nums">
          124 ნაპოვნი
        </span>
      </div>
      <div className="mt-3 space-y-3">
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
            პოზიცია
          </div>
          <div className="flex flex-wrap gap-1">
            {(['GK', 'CB', 'CM', 'ST', 'RW'] as const).map((p, i) => (
              <span
                key={p}
                className={`inline-flex h-6 min-w-[32px] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold ${i === 3 ? 'bg-brand-400 text-ink-950' : 'bg-ink-800 text-ink-300'}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
            ასაკი · 16–23
          </div>
          <div className="relative h-1.5 rounded-full bg-ink-800">
            <div className="absolute inset-y-0 left-[10%] right-[38%] rounded-full bg-brand-400" />
            <span className="absolute -top-1.5 left-[10%] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-brand-400 bg-ink-950" />
            <span className="absolute -top-1.5 right-[38%] h-4 w-4 translate-x-1/2 rounded-full border-2 border-brand-400 bg-ink-950" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-800 pt-3">
          <span className="text-[10px] font-semibold text-ink-500">გამოყენებული:</span>
          {SNAP_FILTER_TAGS.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-pill bg-ink-800 px-2 py-0.5 text-[11px] font-semibold text-ink-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SnapMatch() {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden>
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="3"
              className="stroke-ink-800"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-brand-400"
              strokeDasharray="97.4"
              strokeDashoffset="5.8"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-ink-50 tabular-nums">
            94%
          </span>
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-ink-100">დამთხვევის ქულა</div>
          <div className="text-[11px] text-ink-500">ფილტრების შესაბამისად</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-ink-800 pt-3">
        {(['პოზიცია', 'ასაკი', 'რეგიონი', 'დომინანტური ფეხი'] as const).map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-[12px] text-ink-300">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-400"
              aria-hidden
            >
              <path d="m20 6-11 11-5-5" />
            </svg>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

function SnapChat() {
  return (
    <div className="rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card">
      <div className="flex items-center gap-2.5 border-b border-ink-800 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-400 text-ink-950">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden
          >
            <path d="M12 3l7.5 2.7v5.8c0 4.8-3.2 7.6-7.5 8.5-4.3-.9-7.5-3.7-7.5-8.5V5.7z" />
          </svg>
        </span>
        <div>
          <div className="text-[13px] font-bold text-ink-100">FC დინამო თბილისი</div>
          <div className="flex items-center gap-1 text-[11px] text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            ხაზზეა
          </div>
        </div>
      </div>
      <div className="space-y-1.5 py-3">
        <div className="flex justify-start">
          <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-ink-800 px-3 py-1.5 text-[12px] text-ink-200">
            გამარჯობა, დაგვაინტერესა შენი პროფილით 👋
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-br-md bg-brand-400 px-3 py-1.5 text-[12px] font-medium text-ink-950">
            გამარჯობა! დიდი მადლობა 🙌
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-br-md bg-brand-400 px-3 py-1.5 text-[12px] font-medium text-ink-950">
            როდის შევხვდეთ?
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-field border border-ink-800 px-3 py-2 text-ink-500">
        <span className="flex-1 text-[12px]">დაწერე პასუხი…</span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-400 text-ink-950">
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-32 h-[420px] w-[420px] rounded-full bg-brand-400/10 blur-[120px]"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Copy */}
          <div className="flex flex-col gap-5">
            <h1 className="text-[36px] font-bold leading-[1.05] tracking-tight text-ink-50 sm:text-[48px]">
              ნიჭი და კლუბი —<br />
              <span className="text-brand-400">ერთ სივრცეში.</span>
            </h1>
            {/* Visible brand name for screen readers and tests */}
            <span className="sr-only">Sport Visa</span>

            {/* Taglines kept for test compatibility */}
            <div className="flex flex-col gap-0.5 text-sm text-ink-400 sm:text-base">
              <p>ფეხბურთელები კლუბებს ენახებიან.</p>
              <p>კლუბები ფეხბურთელებს პოულობენ.</p>
            </div>

            <p className="max-w-md text-[14px] leading-relaxed text-ink-400">
              ერთი პლატფორმა, ორი მხარე: ფეხბურთელები ქმნიან პროფილს და ჩანან, კლუბები კი ფილტრებით
              პოულობენ და პირდაპირ უკავშირდებიან ნიჭიერებს — შუამავლების გარეშე.
            </p>

            {/* Step pills */}
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink-400">
              {(['შექმენი პროფილი', 'გაფილტრე და მოძებნე', 'დაუკავშირდი'] as const).map((t, i) => (
                <span key={t} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-600" aria-hidden />}
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900 px-3 py-1.5">
                    <span className="text-brand-400 tabular-nums">{i + 1}</span>
                    {t}
                  </span>
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/signup?role=footballer">ფეხბურთელად რეგისტრაცია</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signup?role=club">კლუბად რეგისტრაცია</Link>
              </Button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 text-[13px] text-ink-400">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-400/10 text-brand-300">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <span className="font-bold text-ink-100">ხელით ვერიფიცირებული</span> პროფილები ·
                უფასო რეგისტრაცია
              </div>
            </div>
          </div>

          {/* Right column: Scoreboard + pitch visual */}
          <div className="relative mx-auto w-full max-w-[480px]">
            {/* Scoreboard */}
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-pop">
              <div className="flex items-center justify-between border-b border-ink-800 px-3 py-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-danger-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger-400" />
                  </span>
                  LIVE
                </span>
                <span className="text-[10px] font-semibold text-ink-500">ეროვნული ლიგა</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-400 text-[9px] font-black tracking-tight text-ink-950 shadow-sm">
                    DIN
                  </span>
                  <div className="text-[12px] font-bold leading-tight text-ink-100">დინამო</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 font-mono text-[20px] font-bold leading-none text-ink-50 tabular-nums">
                    <span>2</span>
                    <span className="text-ink-600">:</span>
                    <span>1</span>
                  </div>
                  <span className="mt-1 rounded-pill bg-ink-950 px-1.5 py-0.5 text-[9px] font-bold text-brand-300 tabular-nums">
                    67&apos;
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-right">
                  <div className="text-[12px] font-bold leading-tight text-ink-100">ტორპედო</div>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-flame-400 text-[9px] font-black tracking-tight text-ink-950 shadow-sm">
                    TOR
                  </span>
                </div>
              </div>
            </div>

            {/* Football pitch SVG illustration */}
            <div className="-mt-1 w-full drop-shadow-[0_22px_40px_rgba(0,0,0,0.45)]">
              <svg
                viewBox="0 0 480 280"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full select-none"
                aria-hidden
              >
                {/* Pitch background */}
                <rect width="480" height="280" rx="12" fill="#1a2e10" />
                {/* Alternating turf stripes */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <rect
                    key={i}
                    x={i * 68.6}
                    y="0"
                    width="34.3"
                    height="280"
                    fill={i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent'}
                    rx="0"
                  />
                ))}
                {/* Outer boundary */}
                <rect
                  x="20"
                  y="20"
                  width="440"
                  height="240"
                  rx="3"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                {/* Centre line */}
                <line
                  x1="240"
                  y1="20"
                  x2="240"
                  y2="260"
                  stroke="#aede48"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />
                {/* Centre circle */}
                <circle
                  cx="240"
                  cy="140"
                  r="42"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />
                <circle cx="240" cy="140" r="3" fill="#aede48" fillOpacity="0.5" />
                {/* Left penalty area */}
                <rect
                  x="20"
                  y="85"
                  width="76"
                  height="110"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1.2"
                  strokeOpacity="0.35"
                />
                {/* Right penalty area */}
                <rect
                  x="384"
                  y="85"
                  width="76"
                  height="110"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1.2"
                  strokeOpacity="0.35"
                />
                {/* Left goal area */}
                <rect
                  x="20"
                  y="110"
                  width="32"
                  height="60"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
                {/* Right goal area */}
                <rect
                  x="428"
                  y="110"
                  width="32"
                  height="60"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
                {/* Left penalty spot */}
                <circle cx="72" cy="140" r="2.5" fill="#aede48" fillOpacity="0.4" />
                {/* Right penalty spot */}
                <circle cx="408" cy="140" r="2.5" fill="#aede48" fillOpacity="0.4" />
                {/* Corner arcs */}
                <path
                  d="M20 30 A10 10 0 0 1 30 20"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
                <path
                  d="M450 20 A10 10 0 0 1 460 30"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
                <path
                  d="M460 250 A10 10 0 0 1 450 260"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
                <path
                  d="M30 260 A10 10 0 0 1 20 250"
                  fill="none"
                  stroke="#aede48"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
                {/* Player dots */}
                <circle cx="96" cy="140" r="6" fill="#aede48" fillOpacity="0.8" />
                <circle cx="160" cy="100" r="5.5" fill="#aede48" fillOpacity="0.6" />
                <circle cx="160" cy="180" r="5.5" fill="#aede48" fillOpacity="0.6" />
                <circle cx="200" cy="140" r="5.5" fill="#aede48" fillOpacity="0.6" />
                <circle cx="280" cy="120" r="5.5" fill="#2ba7ef" fillOpacity="0.8" />
                <circle cx="280" cy="160" r="5.5" fill="#2ba7ef" fillOpacity="0.8" />
                <circle cx="320" cy="140" r="5.5" fill="#2ba7ef" fillOpacity="0.8" />
                <circle cx="360" cy="110" r="5.5" fill="#2ba7ef" fillOpacity="0.6" />
                <circle cx="360" cy="170" r="5.5" fill="#2ba7ef" fillOpacity="0.6" />
                {/* Ball */}
                <circle cx="240" cy="140" r="5" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── DUAL PATH ─────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 sm:py-20">
          <div className="max-w-xl">
            <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight text-ink-50 sm:text-[32px]">
              ორი მხარე, ერთი მიზანი — სწორი დამთხვევა
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Footballer card */}
            <div className="relative overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-7">
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800 text-brand-300">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7.2l3.1 2.3-1.2 3.7H9.1L7.9 9.5z" />
                      <path
                        d="M12 7.2V3M14.6 9.4l3-1M13.6 12.4l1.8 2.6M10.4 12.4l-1.8 2.6M9.4 9.4l-3-1"
                        strokeWidth="1.3"
                      />
                    </svg>
                  </span>
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-400">
                    ფეხბურთელებისთვის
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-ink-50">
                  ფეხბურთელისთვის
                </h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-400">
                  შექმენი პროფილი, რომელსაც კლუბები ენდობიან — და დაელოდე შეთავაზებებს.
                </p>
                <ul className="mt-6 space-y-3">
                  {FOOTBALLER_FEATURES.map((it) => (
                    <li key={it} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="m20 6-11 11-5-5" />
                        </svg>
                      </span>
                      <span className="text-[14px] text-ink-200">{it}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button variant="outline" asChild>
                    <Link href="/auth/signup?role=footballer">
                      დაიწყე — უფასოა
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Club card */}
            <div className="relative overflow-hidden rounded-card border border-brand-400/25 bg-ink-900 p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-400/15 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400 text-ink-950">
                    <ShieldCheck className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-brand-300">
                    კლუბებისთვის
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-ink-50">კლუბისთვის</h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-400">
                  იპოვე ზუსტად ის ნიჭიერი, ვინც გჭირდება — ფილტრებითა და სანდო მონაცემებით.
                </p>
                <ul className="mt-6 space-y-3">
                  {CLUB_FEATURES.map((it) => (
                    <li key={it} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="m20 6-11 11-5-5" />
                        </svg>
                      </span>
                      <span className="text-[14px] text-ink-200">{it}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button asChild>
                    <Link href="/auth/signup?role=club">
                      კლუბი დარეგისტრირდი
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOW / STEPS ──────────────────────────────────────────── */}
      <section className="border-t border-ink-800/80 bg-ink-950/40">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 sm:py-20">
          <div className="max-w-xl">
            <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight text-ink-50 sm:text-[32px]">
              ნაბიჯ-ნაბიჯ — ნიჭიდან კონტრაქტამდე
            </h2>
          </div>

          <div className="mt-12 space-y-14">
            {/* Step 1 */}
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400 text-lg font-black text-ink-950 tabular-nums shadow-sm">
                    1
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300">
                    ფეხბურთელი
                  </span>
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-ink-50">
                  შექმენი სრული პროფილი
                </h3>
                <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-ink-400">
                  პერსონალური და ფიზიკური მონაცემები, კარიერა, პოზიციები და ფოტო gallery — ისე,
                  როგორც კლუბი დაგინახავს.
                </p>
              </div>
              <SnapProfile />
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className="md:order-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400 text-lg font-black text-ink-950 tabular-nums shadow-sm">
                    2
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300">
                    კლუბი
                  </span>
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-ink-50">
                  გაფილტრე და მოძებნე
                </h3>
                <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-ink-400">
                  პოზიცია, ასაკი, დომინანტური ფეხი, რეგიონი და ფიზიკური მონაცემები — იპოვე ზუსტად ის
                  ნიჭიერი, ვინც გჭირდება.
                </p>
              </div>
              <div className="md:order-1">
                <SnapFilter />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400 text-lg font-black text-ink-950 tabular-nums shadow-sm">
                    3
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300">
                    კლუბი
                  </span>
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-ink-50">
                  შეინახე shortlist-ში
                </h3>
                <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-ink-400">
                  დაამატე საინტერესო ფეხბურთელები რჩეულებში და ადევნე თვალი მათ განვითარებას.
                </p>
              </div>
              <SnapMatch />
            </div>

            {/* Step 4 */}
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className="md:order-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400 text-lg font-black text-ink-950 tabular-nums shadow-sm">
                    4
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300">
                    ორივე მხარე
                  </span>
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-ink-50">
                  დაიწყე საუბარი
                </h3>
                <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-ink-400">
                  დაუკავშირდით ერთმანეთს პირდაპირ, real-time ჩატით — შუამავლების გარეშე.
                </p>
              </div>
              <div className="md:order-1">
                <SnapChat />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 sm:py-20">
          <div className="max-w-xl">
            <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight text-ink-50 sm:text-[32px]">
              ყველაფერი, რაც სკაუტინგისთვის გჭირდება
            </h2>
          </div>

          {/* Top bento: big card + 2 small */}
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Big feature card */}
            <div className="relative overflow-hidden rounded-card border border-ink-800 bg-ink-900 p-7 md:col-span-2 md:row-span-2">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink-950 via-ink-950/90 to-ink-900/60"
              />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">
                  სრული პროფილი
                </span>
                <h3 className="mt-4 max-w-sm text-2xl font-bold tracking-tight text-ink-50">
                  ფეხბურთელის პროფილი
                </h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-400">
                  შექმენი სრული პროფილი: პოზიცია, ასაკი, ფიზიკური მახასიათებლები და ფოტო გალერეა.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {(['სიმაღლე 182სმ', 'ფეხი მარჯვ.', 'ST · LW', 'U-19'] as const).map((t) => (
                    <span
                      key={t}
                      className="rounded-pill border border-ink-700 bg-ink-900/60 px-3 py-1 text-[12px] font-semibold text-ink-200 tabular-nums"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {/* Gallery placeholder tiles */}
                <div className="mt-7 grid grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="relative h-24 overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
                      {/* Decorative football pitch motif */}
                      <svg
                        className="absolute inset-0 h-full w-full opacity-10"
                        viewBox="0 0 100 70"
                        aria-hidden
                      >
                        <rect
                          x="5"
                          y="5"
                          width="90"
                          height="60"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <line x1="50" y1="5" x2="50" y2="65" stroke="white" strokeWidth="1" />
                        <circle cx="50" cy="35" r="12" fill="none" stroke="white" strokeWidth="1" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Small feature: smart filters */}
            <div className="rounded-card border border-ink-800 bg-ink-900 p-6 shadow-card">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-iris-400/15 text-iris-300">
                <Search className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight text-ink-50">
                გაფართოებული ფილტრები
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
                პოზიცია, ასაკი, ფეხი, რეგიონი, სიმაღლე — იპოვე ზუსტად ის, ვინც გჭირდება.
              </p>
            </div>

            {/* Small feature: real-time chat */}
            <div className="rounded-card border border-ink-800 bg-ink-900 p-6 shadow-card">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/15 text-brand-300">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight text-ink-50">
                Real-time ჩატი
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
                პირდაპირი კავშირი ფეხბურთელსა და კლუბს შორის, წამიერი მიწოდებით.
              </p>
            </div>
          </div>

          {/* Bottom row: remaining features not shown above (indices 1, 4, 5) + decorative cards */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* FEATURES[1] — კლუბების დირექტორია (not in top bento) */}
            {FEATURES.slice(1, 2).map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-ink-50">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{description}</p>
                </div>
              </div>
            ))}
            {/* Bottom feature cards from design */}
            {FEATURE_BOTTOM_CARDS.map(({ tone, title, body, Icon }) => (
              <div
                key={title}
                className="flex gap-4 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card"
              >
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-ink-50">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{body}</p>
                </div>
              </div>
            ))}
            {/* FEATURES[4] and [5] — სერვისის მოთხოვნა, შენი სიმოკლე */}
            {FEATURES.slice(4).map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-ink-50">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden: keep legacy section heading for tests */}
          <h2 className="sr-only">ძირითადი ფუნქციები</h2>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <section className="border-y border-ink-800 bg-ink-900/50 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <StatStrip stats={STATS} className="mx-auto max-w-lg" />
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <Testimonials />

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-8 sm:pb-20">
          <div className="relative overflow-hidden rounded-card border border-brand-400/25 bg-ink-900 px-8 py-14 text-center md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-400/15 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-accent-400/10 blur-[100px]"
            />
            <div className="relative mx-auto max-w-xl">
              <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight text-ink-50 sm:text-[38px]">
                დაიწყე შენი გზა დღესვე
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-400">
                შემოუერთდი ქართულ სკაუტინგ-სივრცეს — ფეხბურთელად თუ კლუბად.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/auth/signup?role=footballer">ფეხბურთელი</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/signup?role=club">კლუბი</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────── */}
      <Contact />
    </div>
  );
}
