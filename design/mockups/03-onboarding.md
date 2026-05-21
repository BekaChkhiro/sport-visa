# 03 — Onboarding Wizard · Hi-Fi Spec

> Pairs with [wireframes/03-onboarding.md](../wireframes/03-onboarding.md).

**Route**: `/onboarding` · role-aware (footballer = 4 steps, club = 3 steps) ·
authenticated, profile incomplete.

---

## Page shell

- Header: minimal — `<Logo size="md" />` left, `<span class="text-caption text-muted-foreground">` "Step 2 / 4" right. No nav links.
- Background: `bg-muted/40` (same as auth).
- Card container: centred `max-w-[640px]`, except Step 4 review (`max-w-[800px]`). `bg-card rounded-xl shadow-sm p-6 lg:p-8`.

---

## Progress stepper (shared)

Sits above the card content, full card-width.

### Anatomy

```
●━━━━━━━○━━━━━━━○━━━━━━━○
1        2        3        4
პირადი   სპორტ.   მედია    გადახ.
```

- Dots: `size-3 rounded-full`. Filled `bg-primary`. Future `bg-muted border-2 border-border`.
- Bar between: `h-0.5`. Completed segment `bg-primary`; future segment `bg-border`.
- Step label below dot: `.text-caption`; active is `text-foreground font-medium`, completed `text-muted-foreground`, future `text-muted-foreground`.
- Animated fill: 300 ms ease-in-out on step change.

Component name in Figma: `WizardStepper · steps={1..4} · current=N`.

---

## Footballer · Step 1: Personal info

### Heading

`.text-headline` "შექმენი შენი ფეხბურთელის პროფილი" + `.text-body text-muted-foreground` (eyebrow above: `.text-overline text-primary` "ნაბიჯი 1 / 4").

### Form grid

Desktop: two columns (`grid grid-cols-2 gap-x-6 gap-y-4`). Mobile: single column.

| Field                | Component            | Width | Notes                       |
| -------------------- | -------------------- | ----- | --------------------------- |
| `დაბ. თარიღი ★`      | `<DateInput>`        | 1 col | min age 14, max 60          |
| `ეროვნება ★`         | `<Combobox>`         | 1 col | dataset from ref data       |
| `ქალაქი ★`           | `<Input>`            | 1 col | —                           |
| `ქვეყანა ★`          | `<Combobox>`         | 1 col | dataset from ref data       |
| `ტელეფონი`           | `<Input type=tel>`   | 2 col | optional, GE country prefix |
| `ბიო / მოკლე აღწერა` | `<Textarea>` max 500 | 2 col | char counter below          |

Char counter: `.text-caption text-muted-foreground` right-aligned `42 / 500`. Turns destructive at > 500.

### Footer

Right-aligned `Button size=lg` "გაგრძელება →" with trailing `<ArrowRightIcon size={16} />`.
Disabled until required fields valid.

---

## Footballer · Step 2: Sport info

### Position picker ⚑A

`PositionGrid` component — multi-select chip group, max 2 selections.

- Layout: `grid grid-cols-6 sm:grid-cols-11 gap-2` (one row on desktop, wraps on mobile).
- Each chip uses `PositionChip` from foundation library.
- Tooltip on hover (`<Tooltip>`) shows full Georgian position name: GK → "მეკარე", CB → "ცენტრალური დამცველი", etc.
- Counter beneath: `.text-caption text-muted-foreground` "0 / 2 პოზიცია".
- Error: if > 2 attempted, toast `<AlertCircleIcon /> "მაქს. 2 პოზიცია"`.

### Dominant foot

`<RadioGroup orientation=horizontal>` with three `RadioGroupItem`:

```
(●) მარჯვენა    ( ) მარცხენა    ( ) ორივე
```

Each option has `gap-2`, `size-4` radio dot, label `.text-body`.

### Height / weight

Two-column grid (`grid-cols-2 gap-4`).

| Field       | Component       | Suffix | Range   |
| ----------- | --------------- | ------ | ------- |
| `სიმაღლე ★` | `<NumberInput>` | `სმ`   | 140–220 |
| `წონა ★`    | `<NumberInput>` | `კგ`   | 40–130  |

Suffix sits inside the input on the trailing side, `text-muted-foreground text-caption`.

### Current club / jersey number

Two-column grid.

- `ამჟამინდელი კლუბი` `<Input>` — free text.
- `პოზ. ნომერი` `<NumberInput>` — 1–99.

### Experience level

`<RadioGroup>` three options: "პროფესიონალი" / "ნახევარპროფ." / "სამოყვ.".

### Preferred league/season

`<Input>` — free text, full width.

### Footer

`Button variant=outline size=lg` "← უკან" (left), `Button size=lg` "გაგრძელება →" (right) with `flex justify-between`.

---

## Footballer · Step 3: Media

### Profile photo

Drag-and-drop uploader. Anatomy:

```
┌──────────────────────────────────────────┐
│  ┌─────────────────┐                     │
│  │  ▓ 48px         │  [ფოტოს ატვირთვა]  │
│  │  ↑ drop area   │  JPG / PNG · < 5 MB │
│  │  text-muted    │                     │
│  └─────────────────┘                     │
└──────────────────────────────────────────┘
```

- Drop zone: `size-32 border-2 border-dashed border-input rounded-xl flex items-center justify-center bg-muted/40`.
- Idle icon: `<UploadIcon size={32} className="text-muted-foreground" />`.
- Hover (drag-over): `border-primary bg-primary/5`.
- After upload: preview image `object-cover`, with `<Button variant=destructive size=icon>` `<CloseIcon />` overlay on top-right (8-px inset).

Right of the drop zone: `Button variant=outline` "ფოტოს ატვირთვა" + helper `.text-caption text-muted-foreground` "JPG / PNG · < 5 MB".

### Photo gallery (max 8)

`grid grid-cols-4 gap-2` desktop, `grid-cols-3` mobile. Each tile `aspect-square rounded-md overflow-hidden`:

- Filled: image + hover-only `<CloseIcon size={16} />` button (top-right, `bg-background/80 rounded-full`).
- Empty slot at end of grid: dashed border, centred `<PlusIcon size={20} className="text-muted-foreground" />`, label below "ფოტოს დამატება".
- Counter: `.text-caption text-muted-foreground` "3 / 8".
- Drag-to-reorder enabled with cursor: `cursor-grab active:cursor-grabbing`.

### Video links ⚑B

Max 3 entries. Each entry is a row:

```
{ვიდეოს ლინკი 1}                              [×]
[YouTube preview thumbnail (if valid)]
```

- Input validates YouTube / Vimeo URL on blur — on valid, a `<VideoEmbedPreview>` card appears beneath with the iframe thumbnail.
- `Button variant=ghost size=icon` `<CloseIcon />` removes the entry.
- `Button variant=outline size=sm` "+ ლინ. დამატება" appears below the last entry (hidden if 3 reached).

### Footer

Same as Step 2 (back / forward).

---

## Footballer · Step 4: Review & submit

Card max-width `800 px`. Two-column inside.

### Top strip

```
▓▓▓▓        სახელი გვარი               [პროფილის რედ.]
80×80       CM · 182 სმ · 78 კგ · 26წ
(avatar)    GEO · თბილისი
```

- Avatar: `size-20`.
- Name: `.text-title`.
- Meta line: `.text-body text-muted-foreground` with bullet separators (`·`).
- Edit link: `Button variant=outline size=sm` "პროფილის რედ." → opens previous steps.

### Sections

Each section is a `<Separator />`-divided block:

| Heading                          | Content                                               |
| -------------------------------- | ----------------------------------------------------- |
| `.text-overline` "ბიო"           | the user's bio paragraph (`text-body`)                |
| `.text-overline` "სპორტული ინფ." | key-value rows (label muted, value foreground)        |
| `.text-overline` "მედია"         | thumbnail strip of uploaded photos + video link count |

### Verification notice ⚑C

`<Alert variant=warning>` with `<PendingBadgeIcon />`:

- Title: "შენი პროფილი გადახედვას დაექვემდებარება".
- Body: "ადმინი დაადასტურებს 24-48 საათში. დადასტურებამდე ბრაუზდი, მაგრამ კლუბები ვერ დაგიკავშირდებიან."

### Footer

`Button variant=outline size=lg` "← უკან" + `Button size=lg` "პროფ. გააქტიურება" with leading `<CheckCircleIcon size={16} />`.

---

## Club · Step 1: Club identity

Two-column form grid.

| Field              | Component                 | Width |
| ------------------ | ------------------------- | ----- |
| `კლუბის სახელი ★`  | `<Input>`                 | 2 col |
| `დაარს. წელი ★`    | `<NumberInput>` 1850–2026 | 1 col |
| `ქვეყანა ★`        | `<Combobox>`              | 1 col |
| `ქალაქი ★`         | `<Input>`                 | 1 col |
| `ლიგა / დივიზიონი` | `<Combobox>`              | 1 col |
| `სტადიონი`         | `<Input>`                 | 1 col |
| `ტევადობა (ადგ.)`  | `<NumberInput>`           | 1 col |
| `ოფ. ვებგვერდი`    | `<Input type=url>`        | 2 col |
| `კლუბის აღწერა`    | `<Textarea>` max 1000     | 2 col |

---

## Club · Step 2: Media

### Logo (required for verification)

Same uploader pattern as footballer profile photo, but:

- Square aspect, `size-32`.
- Accepts PNG/SVG with transparent background.
- Helper: "PNG / SVG · transparent background recommended".
- Validation: warns if upload appears non-square (resize prompt).

### Cover / stadium photo

Wide aspect ratio (`aspect-[16/6]`), full-card-width.

- Idle drop zone with `<CameraIcon size={32} className="text-muted-foreground" />` + label "სტადიონის / გუნდის ფოტო".
- Helper: "JPG / PNG · < 10 MB · რეკ. 1920 × 720".

---

## Club · Step 3: Review & submit

Same pattern as footballer review. Verification notice copy:

> ✋ ადმინი განიხილავს კლუბის რეგისტრაციას. გთხოვ წარადგინო კლუბის სარეგისტრაციო ან წერილობით დადასტ. დოკ. ელ.ფოსტაზე **admin@sportvisa.ge**.

CTA: "კლუბის გააქტიურება" with `<ShieldIcon size={16} />` leading.

---

## State coverage

### Loading

- Step transition: full-card `<Skeleton className="h-12 w-3/4" />` for heading + `<SkeletonText lines={5} />` placeholder while fields hydrate.
- Submit-in-flight: primary button shows `SpinnerIcon` + disabled; back button also disabled.

### Errors

- Field-level: inline `.text-caption text-destructive` with `<AlertCircleIcon size={12} />` leading.
- Step-level (server reject): `<Alert variant=destructive>` above the stepper with retry guidance.

### Empty (no data yet)

Wizard inherently is the empty state — no separate empty rendering.

---

## Mobile specifics

- Wizard card `mx-4` (16-px gutter). Padding drops to `p-5`.
- Position picker wraps to multi-row grid (`grid-cols-4 sm:grid-cols-6 lg:grid-cols-11`).
- Footer buttons stack to full-width `flex-col-reverse gap-3` so "გაგრძელება" is above "უკან" by reading order (primary above secondary).
- Field grid collapses to single column.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| A   | Position chips use `PositionChip` from foundation library. Tooltip wraps each chip. Max 2 enforced client + server. |
| B   | Video URLs are validated client-side via regex; embed preview via responsive iframe.                                |
| C   | Verification is manual for MVP. Users can browse but can't be contacted by clubs until verified.                    |
| D   | "Complete later" nudge appears on dashboard when optional fields are blank — handled in screen 04 dashboard banner. |
