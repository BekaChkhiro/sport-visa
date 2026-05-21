# 01 — Landing Page · Hi-Fi Spec

> Pairs with [wireframes/01-landing.md](../wireframes/01-landing.md).

**Route**: `/` · static (SSG) · public.

---

## Frame structure (top → bottom)

| #   | Section         | Container                                    | Vertical rhythm                                           |
| --- | --------------- | -------------------------------------------- | --------------------------------------------------------- |
| 1   | Header          | `max-w-screen-xl`, `h-16`                    | sticky, glass                                             |
| 2   | Hero            | `max-w-[70rem]`, `py-24` lg / `py-12` mobile | bg-background → bg-secondary/30 (subtle pitch-green tint) |
| 3   | How it works    | `max-w-screen-xl`, `py-24`                   | white                                                     |
| 4   | For footballers | `max-w-screen-xl`, `py-24`                   | `bg-muted/40`                                             |
| 5   | For clubs       | `max-w-screen-xl`, `py-24`                   | white                                                     |
| 6   | Stats strip     | `max-w-screen-xl`, `py-12`                   | `bg-primary text-primary-foreground`                      |
| 7   | Footer          | `max-w-screen-xl`, `py-12`                   | `bg-card` border-top                                      |

---

## Header

- `<Logo size="md" showWordmark />` on the left.
- Right slot — desktop: link `შესვლა` (Button `variant=ghost size=sm`) + `რეგისტრაცია` (Button `variant=default size=sm`).
- Right slot — mobile: `<Button variant=ghost size=icon><MenuIcon size={20} /></Button>` triggers `<Sheet>`.

---

## Hero

### Layout

Two-column on `lg:` (text-left 60% / illustration 40%). Single-column stack on mobile, illustration above buttons.

### Copy

| Element         | Class                                  | Text (Georgian)                   |
| --------------- | -------------------------------------- | --------------------------------- |
| `<h1>` headline | `.text-display`                        | "Sport Visa"                      |
| Subhead line 1  | `.text-headline text-muted-foreground` | "ფეხბურთელები კლუბებს ენახებიან." |
| Subhead line 2  | `.text-headline text-muted-foreground` | "კლუბები ფეხბურთელებს პოულობენ."  |

### CTAs

Both `Button size=lg` side-by-side desktop, stacked mobile (`gap-3`).

| CTA                       | Variant   | href                           | Icon                                 |
| ------------------------- | --------- | ------------------------------ | ------------------------------------ |
| `ფეხბურთელად რეგისტრაცია` | default   | `/auth/signup?role=footballer` | `<JerseyIcon size={16} />` (leading) |
| `კლუბად რეგისტრაცია`      | secondary | `/auth/signup?role=club`       | `<ShieldIcon size={16} />` (leading) |

### Hero illustration

- Source: a composed SVG layered from custom icons in `@/components/icons` — `JerseyIcon` (footballer) + `ShieldIcon` (club badge) + decorative `FootballIcon` and `PitchIcon` outlines.
- Rendered inside a `rounded-xl` frame with a subtle `bg-secondary` wash.
- Max-height `400 px` desktop, `240 px` mobile. Maintains aspect ratio.

---

## How it works (3-step explainer)

Three columns desktop (`grid-cols-3 gap-8`), one column mobile (stacked, `gap-12`).

Each step is a flat panel (no card chrome) with vertical alignment:

```
        ┌────────────┐
        │  ▓ 48 px   │   ← icon, text-primary, bg-secondary rounded-full p-3
        └────────────┘
            (gap-6)
        # შექმენი პროფილი    ← .text-title
            (gap-2)
        მოკლე ერთ-ხაზიანი    ← .text-body text-muted-foreground
```

| #   | Icon                | Title              | Description (single line)           |
| --- | ------------------- | ------------------ | ----------------------------------- |
| 1   | `UserPlusIcon`      | შექმენი პროფილი    | სრული პროფ. ფოტოთი + ვიდეო ლინკებით |
| 2   | `SearchIcon`        | იპოვე კლუბი/მოთამ. | ფილტრებით ან directory-ით           |
| 3   | `MessageCircleIcon` | დაუკავშირდი        | Real-time ჩატით                     |

---

## For footballers section

Two-column desktop, image left / text right at 50/50. Mobile stacks (image first).

- Image: in-product screenshot of the footballer profile (placeholder shaded block during design; replaced at delivery with a real screenshot framed inside `rounded-xl shadow-md`).
- Heading: `.text-headline` "ფეხბურთელისთვის".
- Bullet list — each item `flex items-center gap-3`, leading icon `text-primary size={20}`:
  - `<UserIcon />` "პოზიციის, ასაკის, ფიზ. მახ. პროფ."
  - `<ImageIcon />` "ფოტო გალერეა"
  - `<HeartIcon />` "კლუბის გამოწერა"
  - `<MealPlanIcon />` "სერვისის მოთხოვნა"
- CTA: `Button size=lg variant=default` "დაიწყე — უფასოა" → `/auth/signup?role=footballer`.

---

## For clubs section

Mirror of the above (text-left / image-right). Same component, swapped order via `lg:flex-row-reverse`.

- Bullet icons: `<ShieldIcon />`, `<UsersIcon />` (directory), `<SearchIcon />` (filters), `<MessageCircleIcon />`.
- CTA: `Button size=lg variant=default` "კლუბი დარეგისტრირდი" → `/auth/signup?role=club`.

---

## Stats strip

Full-width band, `bg-primary text-primary-foreground`. Three columns desktop, `divide-x divide-primary-foreground/20`. Mobile: stacked, no divider.

| Stat          | Number class                | Label class                                 |
| ------------- | --------------------------- | ------------------------------------------- |
| Three of them | `.text-display` text-center | `.text-overline text-primary-foreground/80` |

| Number   | Label (Georgian) |
| -------- | ---------------- |
| `500+`   | ფეხბურთელი       |
| `80+`    | კლუბი            |
| `1 200+` | Match            |

---

## Footer

- Two rows desktop, four rows mobile.
- Row 1: `<Logo size="sm" />` left, link cluster right (`About`, `Privacy`, `Terms`, `Contact` — each `Button variant=ghost size=sm` with `text-muted-foreground`).
- Row 2: copyright `.text-caption text-muted-foreground` "© 2026 Sport Visa".

---

## Loading & error states

This route is SSG — no client-side loading state needed for the page shell.
Network-dependent slots (none in MVP) would use `<SkeletonStatStrip />` for the
stats band only.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Header CTAs scroll-to-hero on `/`; on other pages they navigate to `/auth/*`. Implemented as `<Link href="#hero">` with smooth scroll only when `pathname === '/'`. |
| B   | Both hero CTAs include `?role=` param. Auth signup page reads it to pre-select role.                                                                                |
| C   | Stats numbers are hardcoded constants in MVP. File-level comment marks the swap point for Phase X.                                                                  |
| D   | Mobile drawer uses shadcn `<Sheet side="right" />`; auth CTAs are bottom-pinned as `Button size=lg w-full`.                                                         |
| E   | Static page — no auth check at the component level. Next.js middleware handles signed-in redirects.                                                                 |

---

## Responsive notes

- Hero: vertical stack < 1024 px; illustration sits **above** copy on mobile.
- "How it works" collapses 3 → 1 column under `md`.
- "For footballers" / "For clubs": images reorder above text on mobile.
- Stats strip becomes 1-column with 24-px vertical gaps.
- Footer: link row wraps; copyright moves to its own line.
