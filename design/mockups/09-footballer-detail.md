# 09 — Footballer Detail (Club View) · Hi-Fi Spec

> Pairs with [wireframes/09-footballer-detail.md](../wireframes/09-footballer-detail.md).

**Route**: `/directory/[footballerId]` (CLUB role only) · authenticated.

---

## Layout

Single-column scroll page, content max-width `max-w-[1024px] mx-auto px-6 lg:px-8`.

```
Header (club nav)
[← Directory-ში დაბრუნება]   ← Button variant=ghost size=sm with <ArrowLeftIcon />
HERO
INFO GRID
BIO
CAREER
PHOTO GALLERY
VIDEOS
[Sticky action footer — mobile only]
```

---

## Hero block

```
┌────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← cover image · aspect-[21/9]
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   bg gradient overlay bottom-to-top from foreground/40
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓▓  სახელი გვარი             ✓ Verified      [★ შ. სია]  │
│  size-32  CM · 26 წ · GEO                          [💬 ჩატი]   │
│  (overlaps cover by -64px)  👁 348 ნახვა                       │
└────────────────────────────────────────────────────────────────┘
```

- Cover container: `aspect-[21/9] rounded-xl overflow-hidden bg-muted`. Image `object-cover`. If no image: placeholder gradient + centred `<JerseyIcon size={96} />`.
- Avatar: `size-32 rounded-full ring-4 ring-background -mt-16 ml-6` overlapping the cover.
- Name: `.text-headline`. Meta `.text-body text-muted-foreground`.
- Verification badge: inline next to the name (large variant — see foundation).
- View count: `.text-caption text-muted-foreground` with leading `<EyeIcon size={14} />`.
- Action buttons: top-right of the hero text row, two stacked vertically on mobile, side-by-side desktop.
  - Shortlist: `Button size=lg variant=outline` with `<StarIcon size={16} />` leading. Active state fills the star and switches to `variant=secondary`.
  - Chat: `Button size=lg` "ჩატის დაწყება" with `<MessageCircleIcon size={16} />`.

---

## Info grid

Two cards side-by-side desktop (`grid grid-cols-1 lg:grid-cols-2 gap-4`).

### Sport info card

`bg-card border-border rounded-xl p-6`.

```
.text-overline "SPORT INFO"
─────────────────────────────────
პოზიცია          CM (ცენ. ნახევარდაცველი)
დომ. ფეხი        მარჯვენა
გამოცდილება      ნახ. პროფ.
სეზონი           2026/27 თავ.
ამჟ. კლუბი       FC Dila
```

Each row: `flex justify-between py-2 border-b border-border last:border-0`. Label `text-muted-foreground`, value `text-foreground`.

Position value renders with a `PositionChip` next to the full Georgian name.

### Physical card

Same shape:

```
.text-overline "PHYSICAL"
─────────────────────────────────
სიმაღლე          182 სმ
წონა             78 კგ
ასაკი            26
ეროვნება         GEO
ქალაქი           თბილისი
```

Use `tabular-nums` on numeric values for vertical alignment.

---

## Bio block

`.text-headline mt-10` "ბიოგრაფია".

Body container: `bg-card border-border rounded-xl p-6 text-body prose prose-sm dark:prose-invert`. Renders the bio (plain text in MVP). If empty, hide section.

---

## Career history block

`.text-headline mt-10` "კარიერა".

Timeline list:

```
●─── FC Dinamo Tbilisi    2022 – 2024    CM
│
●─── FC Locomotive        2020 – 2022    CM
│
●─── FC Dila Gori         2018 – 2020    AM
```

- Container: `bg-card border-border rounded-xl p-6`.
- Each entry: `flex items-center gap-4 py-3 relative`.
- Vertical guideline: `before:absolute before:left-2.5 before:top-0 before:bottom-0 before:w-px before:bg-border` on the parent.
- Dot: `size-2 rounded-full bg-primary z-10`.
- Club name: `.text-body font-medium flex-1`.
- Years: `.text-caption text-muted-foreground tabular-nums`.
- Position: `PositionChip`.

Empty state: hide the entire section.

---

## Photo gallery block

`.text-headline mt-10` "ფოტო გალერეა".

Anatomy:

```
┌─ container ────────────────────────────────────────┐
│  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐             │
│  │░░░░││░░░░││░░░░││░░░░││░░░░││░░░░│             │
│  └────┘└────┘└────┘└────┘└────┘└────┘             │
│                                                    │
│  [← ]   1 / 6   [ →]                              │
└────────────────────────────────────────────────────┘
```

- Grid `grid grid-cols-3 md:grid-cols-6 gap-2`.
- Each tile `aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90`.
- Click opens shadcn `<Dialog>` lightbox at full size with `← / →` keyboard nav, `Esc` close.
- Counter `.text-caption text-muted-foreground` centred below.
- Empty state: hide section.

---

## Videos block

`.text-headline mt-10` "ვიდეოები".

Grid `grid grid-cols-1 lg:grid-cols-2 gap-4`. Each video:

```
┌─ aspect-video rounded-md overflow-hidden ────┐
│  ░ <iframe> youtube embed ░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────┘
```

Lazy-loaded iframes (`loading="lazy"`). Only YouTube/Vimeo allowed; URL is sanitised server-side and converted to embed URL.

Empty state: hide section.

---

## Sticky mobile action footer ⚑H

On mobile only, fixed bar at bottom:

```
┌────────────────────────────────────────┐
│  [★ Shortlist-ში]   [💬 ჩატის დაწყება] │
└────────────────────────────────────────┘
```

- Container: `fixed inset-x-0 bottom-0 bg-card/95 backdrop-blur border-t border-border p-3 grid grid-cols-2 gap-2 lg:hidden`.
- Both buttons `size=lg`, primary chat button has emphasis (`variant=default`); shortlist `variant=outline`.
- Page bottom padding: `pb-24 lg:pb-0` so content isn't hidden behind the bar.

---

## States

| State                              | Treatment                                                                                                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading                            | Hero `<Skeleton aspect-[21/9] />` + `<Skeleton className="size-32" />` overlap + `<SkeletonText lines={2} />` for meta. Info grid → 2 × `<SkeletonCard />`. Career / gallery / videos → section skeletons. |
| Empty (sections)                   | Each optional section hides if no data (career, gallery, videos, bio).                                                                                                                                     |
| Error                              | Page-level `<ErrorState variant=page />` with title "პროფილი ვერ ჩაიტვირთა" + retry.                                                                                                                       |
| Footballer not found               | 404 — handled by `notFound()` in Next.js.                                                                                                                                                                  |
| Hidden footballer (visibility OFF) | 404 (same code path; access policy enforced server-side).                                                                                                                                                  |
| Phone hidden ⚑D                    | Phone field shown as `······` until the footballer is in the club's shortlist, then revealed inline with a `<LockIcon size={12} />` tooltip explaining the rule.                                           |

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------- |
| A   | Shortlist toggle uses optimistic UI, server action `toggleShortlist`. Toast on success.                        |
| B   | Chat button calls `getOrCreateConversation(clubId, footballerId)` server action then `redirect('/chat/[id]')`. |
| C   | Profile view counter increments per CLUB session per day (dedup via `viewedAt` + sessionId hash).              |
| D   | Phone hidden by default; revealed only when footballer is shortlisted by this club.                            |
| E   | Gallery uses `<Dialog>` lightbox; keyboard-navigable (arrows + Esc).                                           |
| F   | Video iframes restricted to YouTube/Vimeo. URL parser converts watch URLs → embed URLs.                        |
| G   | SSR per request — profile data is fresh on every load (`dynamic = 'force-dynamic'`).                           |
| H   | Mobile sticky action footer per spec above. Hidden on `lg:`.                                                   |
