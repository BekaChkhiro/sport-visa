import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'კონფიდენციალურობის პოლიტიკა — Sport Visa',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-ink-50 sm:text-[38px]">
          კონფიდენციალურობის პოლიტიკა
        </h1>
        <p className="mt-2 text-[13px] text-ink-500">ბოლო განახლება: 2026 წლის ივნისი</p>
      </header>

      <div className="space-y-10 text-[15px] leading-[1.75] text-ink-400">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">
            1. რა მონაცემებს ვაგროვებთ
          </h2>
          <p>Sport Visa-ს პლატფორმით სარგებლობისას ჩვენ ვაგროვებთ შემდეგ სახის ინფორმაციას:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-ink-200">ანგარიშის მონაცემები</span> — სახელი,
              გვარი, ელ-ფოსტა, პაროლის ჰეში, ანგარიშის ტიპი;
            </li>
            <li>
              <span className="font-medium text-ink-200">პროფილის ინფორმაცია</span> — ფოტო, პოზიცია,
              ასაკი, სიმაღლე, მოქალაქეობა, ქალაქი, საკონტაქტო მონაცემები (ფეხბ.-თვის); კლუბის
              სახელი, ქვეყანა, ლიგა, სტადიონი (კლუბებისთვის);
            </li>
            <li>
              <span className="font-medium text-ink-200">სასარგებლო ინფორმაცია</span> —
              შეტყობინებები, ჩატის ისტორია, შორთლისთი, სიახლეები;
            </li>
            <li>
              <span className="font-medium text-ink-200">ტექნიკური მონაცემები</span> — IP-მისამართი,
              ბრაუზერი, მოწყობილობის ტიპი, ვიზიტების ლოგები.
            </li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">
            2. როგორ ვიყენებთ მონაცემებს
          </h2>
          <p>შეგროვებული მონაცემები გამოიყენება:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>ანგარიშის შექმნის, ავთენტიფიკაციისა და სეკურიტეტის უზრუნველყოფისთვის;</li>
            <li>ფეხბ. პროფილების კლუბებისთვის და კლუბების პროფილების ფეხბ.-თვის საჩვენებლად;</li>
            <li>ჩატისა და შეტყობინების სისტემის გამართვისთვის;</li>
            <li>
              ელ-ფოსტის გაგზავნისთვის (ვერიფიკაცია, პაროლის აღდგენა, სერვის-მოთხოვნის სტატუსი,
              ყოველკვირეული დაიჯესტი);
            </li>
            <li>პლატფორმის გაუმჯობესებისა და ახალი ფუნქციების შემუშავებისთვის;</li>
            <li>კანონმდებლობით გათვალისწინებული ვალდებულებების შესასრულებლად.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">
            3. ვის ვუზიარებთ მონაცემებს
          </h2>
          <p>
            <span className="font-medium text-ink-200">კლუბები ხედავენ ფეხბ. საჯარო პროფილს</span> —
            სახელს, პოზიციას, ასაკს, სიმაღლეს, მოქალაქეობას, ფოტოს და ვერიფიკაციის სტატუსს. ფეხბ.
            ელ-ფოსტა და ტელეფონი ხილვადია მხოლოდ პირდაპირი ჩატის ინიციირების შემთხვევაში.
          </p>
          <p className="mt-3">
            <span className="font-medium text-ink-200">ფეხბ. ხედავენ კლუბის საჯარო პროფილს</span> —
            კლუბის სახელს, ქვეყანას, ლიგას, სტადიონს, სიახლეებს.
          </p>
          <p className="mt-3">
            ჩვენ ვიყენებთ სანდო მომწოდებლებს (ინფრასტრუქტურა, ელ-ფოსტა, ფაილების შენახვა), რომლებიც
            ვალდებულნი არიან დაიცვან მონაცემთა კონფიდენციალობა. პირადი მონაცემები არ იყიდება და არ
            გადაიცემა მარკეტინგული მიზნით.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">4. Cookies და სესიები</h2>
          <p>
            Sport Visa იყენებს cookie-ებს სეანსის მართვისთვის (ავთენტიფიკაცია), ანალიტიკისთვის
            (ანონიმური ვიზიტების სტატისტიკა) და UI-პრეფერენციებისთვის (ხედის რეჟიმი). ანალიტიკური
            cookie-ები შეიძლება გათიშოთ ბრაუზერის პარამეტრებიდან, თუმცა ეს შეიძლება შეაფერხოს
            ანგარიშში შესვლას.
          </p>
          <p className="mt-3">
            სეანსის cookie-ები ინახება ბრაუზერის დახურვამდე; მდგრადი cookie-ები — 30 დღემდე, თუ
            „გამახსოვრება" ოფცია ჩართულია.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">
            5. მონაცემთა შენახვა და წაშლა
          </h2>
          <p>
            ანგარიშის აქტიობის განმავლობაში მონაცემები ინახება სრულად. ანგარიშის გაუქმებიდან 30 დღის
            ვადაში პირადი მონაცემები წაიშლება სისტემებიდან, გარდა:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>ფინანსური ჩანაწერებისა, რომლებიც ინახება კანონმდებლობის შესაბამისად (5 წელი);</li>
            <li>ანონიმიზებული ლოგებისა, რომლებიც გამოიყენება სეკურიტეტის ანალიზისთვის.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">6. შენი უფლებები</h2>
          <p>საქართველოს კანონმდებლობის შესაბამისად გეკუთვნის:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-ink-200">წვდომის უფლება</span> — მოითხოვო შენი
              შენახული მონაცემების ასლი;
            </li>
            <li>
              <span className="font-medium text-ink-200">გასწორების უფლება</span> — შეცვალო არასწორი
              ან მოძველებული ინფორმაცია პროფილში;
            </li>
            <li>
              <span className="font-medium text-ink-200">წაშლის უფლება</span> — მოითხოვო ანგარიშისა
              და მონაცემების სრული წაშლა;
            </li>
            <li>
              <span className="font-medium text-ink-200">გადაცემის უფლება</span> — მიიღო პირადი
              მონაცემები ჩამოსატვირთ ფორმატში;
            </li>
            <li>
              <span className="font-medium text-ink-200">წინააღმდეგობის უფლება</span> — უარი თქვა
              მონაცემების გარკვეული მიზნით დამუშავებაზე.
            </li>
          </ul>
          <p className="mt-3">
            უფლებების განსახორციელებლად მოგვწერეთ{' '}
            <a
              href="mailto:privacy@sportvisa.ge"
              className="text-brand-400 underline underline-offset-2 transition-colors hover:text-brand-300"
            >
              privacy@sportvisa.ge
            </a>
            . მოთხოვნას ვაპასუხებთ 30 კალენდარული დღის ვადაში.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink-100">7. კონტაქტი</h2>
          <p>
            პოლიტიკასთან დაკავშირებული შეკითხვებისთვის:{' '}
            <a
              href="mailto:privacy@sportvisa.ge"
              className="text-brand-400 underline underline-offset-2 transition-colors hover:text-brand-300"
            >
              privacy@sportvisa.ge
            </a>
          </p>
          <p className="mt-3">Sport Visa შპს · თბილისი, საქართველო</p>
        </section>
      </div>
    </div>
  );
}
