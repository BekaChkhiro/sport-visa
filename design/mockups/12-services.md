# 12 — Services Request Form · Hi-Fi Spec

> Pairs with [wireframes/12-services.md](../wireframes/12-services.md).

**Route**: `/services/new` (FOOTBALLER role) · authenticated, verified.

---

## Page shell

- Header: footballer nav.
- Background: `bg-muted/40` (form-focused).
- Back link: `<Button variant=ghost size=sm>` "← Dashboard-ზე დაბრუნება" — top of page, above the heading.
- Content: centred `max-w-[720px] mx-auto px-6 py-8`.

---

## Page heading

```
.text-headline "სერვისის მოთხოვნა"
.text-overline text-primary "STEP 1 / 2"  (or 2 / 2)
```

Stepper renders as a thin 2-segment progress bar below the eyebrow.

---

## Step 1 — service type selection

### Grid

Desktop: `grid grid-cols-2 gap-4`. Mobile: `grid-cols-1 gap-3`.

Each card is a `ServiceTypeCard`:

```
┌────────────────────────────────────────┐
│  ┌───┐                                 │
│  │ ▓ │ ← icon · bg-secondary rounded-lg │
│  └───┘   size 48 · text-primary         │
│                                         │
│  # კვება                                │
│  · კვ. გეგმა                            │
│  · ჯანს. კვება                          │
│  · სად. მიწოდება                        │
│                                         │
│  ───────────────────────  [არჩევა →]   │
└────────────────────────────────────────┘
```

- Container: `bg-card border-border rounded-xl p-6 flex flex-col gap-4 transition hover:border-primary/40 hover:shadow-md`.
- Icon wrapper: `bg-secondary rounded-lg p-3 inline-flex` containing the icon.
- Title: `.text-title`.
- Bullet list: `.text-body text-muted-foreground` rows with `<CheckIcon size={14} className="text-success mr-2" />` leading.
- CTA: bottom-right `Button size=sm` "არჩევა →" with trailing `<ArrowRightIcon size={14} />`.

### Service types

| Card            | Icon                                | Bullets                                 |
| --------------- | ----------------------------------- | --------------------------------------- |
| კვება           | `<MealPlanIcon size={24} />`        | კვ. გეგმა · ჯანს. კვება · სად. მიწოდება |
| პერსონ. ტრენერი | `<PersonalTrainerIcon size={24} />` | ინდ. გეგმა · ს/კ სესიები                |
| გუნდის ექიმი    | `<TeamDoctorIcon size={24} />`      | სამედ. შემოწმება · ტრავ. მართვა         |
| სხვა სერვისი    | `<OtherServicesIcon size={24} />`   | კომპლექსური · ინდ. მოთხოვნა             |

Selecting a card moves to Step 2 (URL: `/services/new?type={serviceType}`).

---

## Step 2 — details form

### Back link

`<Button variant=ghost size=sm>` "← სერვ. ტიპის ცვლ." (returns to Step 1).

### Heading

```
.text-headline "კვება — დეტ."                  STEP 2 / 2
```

Title interpolates the chosen service name. Right-aligned step label `.text-overline text-primary`.

### Form fields (in order)

Container: `bg-card border-border rounded-xl p-6 lg:p-8 space-y-6`.

#### Duration

```
.text-overline "DURATION / PERIOD"
{დაწყ. თარიღი ★}    {დამთავრების თარიღი ★}
```

Two-column grid. `<DateInput>` each. Validation: start ≤ end; both within next 12 months.

#### Plan type ★ (only for "კვება")

`<RadioGroup orientation=horizontal>` with three options:

```
(●) 3 კვ./დ.    ( ) 4 კვ./დ.    ( ) 5 კვ./დ.
```

Conditional: for `personal-trainer` swap with a session-count select; for `team-doctor` swap with a frequency select; for `other` omit entirely.

#### Dietary restrictions (only for "კვება")

Multi-select checkboxes in a `grid grid-cols-2 gap-2`:

`[ ] ვეგ.   [ ] ვეგან.   [ ] გლუტ. თ.   [ ] ლაქტ. თ.`

#### Notes textarea

```
.text-overline "დამატებითი შენიშვნა / სპ. მოთხოვნა"
{Textarea max 500}
[counter: 0 / 500]
```

`<Textarea rows={4}>`. Char counter `.text-caption text-muted-foreground` right-aligned. Destructive at > 500.

#### Contact preference

`<RadioGroup>` vertical with three options:

- `(●) ელ. ფოსტა` (default)
- `( ) ტელეფონი`
- `( ) ჩატი` (in-app)

Pre-fills from user settings.

#### Info note ⚑A

`<Alert variant=info>` with `<InfoIcon size={16} />`:

> ℹ მოთხოვნა განიხილავს ადმინი და მოგიკ. 48 საათში.

### Footer

`Button variant=outline size=lg` "← უკან" left + `Button size=lg` "მოთხოვნის გაგზავნა" right.

---

## Confirmation screen (after submit)

`<Card>` centred on the page. Width `max-w-[480px]`.

```
       ┌─────────┐
       │  ✓ 48   │  ← CheckCircleIcon text-success
       └─────────┘

       .text-headline "მოთხოვნა გაიგზავნა!"

       # კვება
       ID: SR-2026-0042
       სტ.: ⏳ განხილვაში

       .text-body text-muted-foreground
       "ადმინი განიხილავს 24-48 სთ-ში.
       პასუხი მოვა ელ.ფ-ზე: footballer@email.ge"

       ────────────────────────────────
       [Dashboard-ზე დაბრუნება]
       [სხვა სერვ. მოთხ.]
```

- Container: `bg-card border-border rounded-xl shadow-sm p-8 text-center space-y-4`.
- Title: `.text-headline text-success`.
- Service type + ID row: `.text-title` + `.text-caption tabular-nums`.
- Status pill (foundation `StatusPill` with `pending` variant).
- CTAs: `<div className="flex flex-col gap-2 pt-4">`. Primary "Dashboard-ზე" (`Button size=lg`); secondary "სხვა სერვ. მოთხ." (`Button variant=outline size=lg`).

---

## States

| State            | Treatment                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Step 1 loading   | 4 × `<SkeletonCard className="h-48" />` in the grid                                      |
| Step 2 loading   | `<SkeletonCard />` for the form panel                                                    |
| Submitting       | Primary button `<SpinnerIcon />` + disabled; back button disabled                        |
| Submit error     | Inline `<Alert variant=destructive>` above the form: "გაგზავნა ვერ მოხდა — ცადე თავიდან" |
| Validation error | Field-level inline `.text-caption text-destructive` + `<AlertCircleIcon size={12} />`    |
| Confirmation     | Replaces the form entirely with the confirmation card (no page reload)                   |

---

## Mobile

- Step 1 cards stack to a single column with `gap-3`. CTAs go full-width `Button size=lg`.
- Step 2 footer becomes `flex-col-reverse gap-3`; primary button on top, secondary "← უკან" below.
- Date inputs use native browser date picker for best UX (no third-party calendar in MVP).

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------- |
| A   | Service requests go to admin (not directly to clubs). Admin resolves them in Phase 9.                                  |
| B   | "სხვა სერვისი" free-text still has the same notes textarea + contact preference structure; conditional fields omitted. |
| C   | Date inputs are native browser pickers; no third-party calendar in MVP.                                                |
| D   | Submit triggers a Resend email to `admin@sportvisa.ge` + a confirmation email to the footballer.                       |
| E   | Dashboard service-request list (screen 04) reflects status updates pushed when admin marks resolved.                   |
| F   | Mobile stacks the service cards vertically.                                                                            |
