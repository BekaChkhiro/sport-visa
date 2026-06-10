import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Sport Visa-ს წყალობით კლუბი 2 კვირაში ვიპოვე. ადრე თვეები მიდიოდა უშედეგოდ — ახლა ყველაფერი ერთ ადგილას.',
    name: 'გიორგი მამულაშვილი',
    role: 'მარჯვენა ფლანგი · 23 წ.',
    initials: 'გმ',
  },
  {
    quote:
      'ჩვენი კლუბი მოთამაშეებს ვერ ეწეოდა სასურველი ტემპით. Sport Visa-ზე 3 ახალი ნიჭი ვიპოვეთ ამ სეზონში.',
    name: 'ნინო ბერიძე',
    role: 'სპორტ-დირექტორი · FC Rustavi',
    initials: 'ნბ',
  },
  {
    quote:
      'სისტემა ძალიან მარტივია. პროფილი 10 წუთში შევავსე და მეორე დღეს კლუბისგან შეტყობინება მივიღე.',
    name: 'დავით ხარაბაძე',
    role: 'ცენტრალური ნახევარმცველი · 19 წ.',
    initials: 'დხ',
  },
] as const;

export function Testimonials() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto">
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-400">
            TESTIMONIALS
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-50 sm:text-3xl">
            ისინი უკვე Sport Visa-ზეა
          </h2>
          <p className="mt-3 text-sm text-ink-400 sm:text-base">
            ფეხბურთელები და კლუბები, ვინც პლატფორმა უკვე გამოიყენა.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials }) => (
            <figure
              key={name}
              className="relative flex flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 px-7 py-9"
            >
              {/* Ambient glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-brand-400/10 blur-[90px]"
              />
              {/* Giant decorative quote mark */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-8 text-[140px] font-black leading-none text-ink-50/5 select-none"
              >
                &ldquo;
              </span>

              <div className="relative flex flex-1 flex-col">
                {/* Stars */}
                <div className="flex gap-1 text-brand-400" aria-label="5 stars">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-current" aria-hidden />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-5 flex-1 text-[15px] font-bold leading-snug tracking-tight text-ink-50">
                  &ldquo;{quote}&rdquo;
                </blockquote>

                {/* Author */}
                <figcaption className="mt-7 flex items-center gap-3.5">
                  <div
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[15px] font-bold text-ink-950"
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold leading-snug text-ink-50">{name}</span>
                    <span className="text-[12px] text-ink-400">{role}</span>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
