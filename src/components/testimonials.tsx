import { Quote } from 'lucide-react';

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
    <section className="bg-secondary/30 px-4 py-16 sm:py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            ისინი უკვე Sport Visa-ზეა
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            ფეხბურთელები და კლუბები, ვინც პლატფორმა უკვე გამოიყენა.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials }) => (
            <figure
              key={name}
              className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6"
            >
              <Quote className="h-5 w-5 flex-shrink-0 text-primary/60" aria-hidden />
              <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-snug">{name}</span>
                  <span className="text-xs text-muted-foreground">{role}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
