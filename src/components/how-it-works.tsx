import { UserCircle, Search, MessageCircle } from 'lucide-react';

const STEPS = [
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

export function HowItWorks() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">როგორ მუშაობს</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            სამი მარტივი ნაბიჯი — პროფილიდან კლუბამდე.
          </p>
        </div>

        {/* Steps grid with connecting arrows on desktop */}
        <div className="relative grid gap-10 sm:grid-cols-3">
          {/* Connecting line (desktop only) */}
          <div
            aria-hidden
            className="absolute left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] top-10 hidden h-px bg-border sm:block"
          />

          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="relative flex flex-col items-center gap-4 text-center">
              {/* Icon circle with step badge */}
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                  <Icon className="h-8 w-8" aria-hidden />
                </div>
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {step}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold leading-snug">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
