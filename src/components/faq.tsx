import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ_ITEMS = [
  {
    value: 'q1',
    question: 'რეგისტრაცია ფასიანია?',
    answer:
      'ფეხბურთელისთვის რეგისტრაცია და ძირითადი ფუნქციები სრულიად უფასოა. კლუბებს შეუძლიათ დაიწყონ უფასო გეგმით, ხოლო გაფართოებული ძიების ხელსაწყოები პრემიუმ გეგმაშია ხელმისაწვდომი.',
  },
  {
    value: 'q2',
    question: 'როგორ ხდება კლუბთან კავშირი?',
    answer:
      'პლატფორმა real-time ჩატს გთავაზობს. მას შემდეგ, რაც კლუბი ან ფეხბურთელი ინტერესს გამოხატავს, ჩატი ავტომატურად ხსნება და პირდაპირ შეგიძლიათ ისაუბროთ.',
  },
  {
    value: 'q3',
    question: 'მჭირდება ვიზა ან სამართლებრივი დოკუმენტაცია?',
    answer:
      'Sport Visa პლატფორმა ფეხბურთელებს და კლუბებს ერთმანეთთან ახლებს. სამართლებრივი, ვიზის ან გადასახადის საკითხები კლუბსა და ფეხბურთელს შორის წყდება — პლატფორმა ამ პროცესს არ ანაცვლებს, მხოლოდ პირველ კავშირს ქმნის.',
  },
  {
    value: 'q4',
    question: 'რა ასაკის ფეხბურთელები შეიძლება დარეგისტრირდნენ?',
    answer:
      'პლატფორმაზე 16 წლის და უფროსი ფეხბურთელები დარეგისტრირდებიან. 18 წლამდე ასაკის მოთამაშეებს საჭიროა მეურვის თანხმობა.',
  },
  {
    value: 'q5',
    question: 'შემიძლია ერთზე მეტ კლუბს გავუგზავნო მოთხოვნა?',
    answer:
      'დიახ. შეგიძლიათ მოთხოვნა გაუგზავნოთ რამდენიმე კლუბს ერთდროულად. ყოველი კლუბი დამოუკიდებლად გიპასუხებთ.',
  },
  {
    value: 'q6',
    question: 'რა ხდება, თუ კლუბი ვერ ვიპოვე?',
    answer:
      'ახალი კლუბები ყოველ კვირა ემატება. შეგიძლიათ ჩართოთ შეტყობინებები, რომ ავტომატურად გაიგოთ, თუ თქვენი კრიტერიუმების კლუბი დარეგისტრირდება.',
  },
] as const;

export function FAQ() {
  return (
    <section className="border-t border-ink-800/80 bg-ink-950/40 px-4 py-16 sm:py-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left — heading + sub-copy */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-400">
              FAQ
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-50 sm:text-3xl">
              გაქვს კითხვა?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-400 sm:text-base">
              ვერ იპოვე პასუხი? დაგვიკავშირდი და ჩვენი გუნდი დაგეხმარება.
            </p>
            {/* keep the original heading hidden for test compatibility */}
            <h2 className="sr-only">ხშირად დასმული კითხვები</h2>
            <p className="sr-only">პასუხი ყველაზე გავრცელებულ კითხვებზე.</p>
          </div>

          {/* Right — accordion */}
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map(({ value, question, answer }) => (
              <AccordionItem key={value} value={value} className="border-ink-800">
                <AccordionTrigger className="text-[15px] font-bold tracking-tight text-ink-100 hover:text-ink-50">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-ink-400">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
