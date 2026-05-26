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
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            პასუხი ყველაზე გავრცელებულ კითხვებზე.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map(({ value, question, answer }) => (
            <AccordionItem key={value} value={value}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
