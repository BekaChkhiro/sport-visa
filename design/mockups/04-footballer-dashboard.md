# 04 — Footballer Dashboard · Hi-Fi Spec

> Pairs with [wireframes/04-footballer-dashboard.md](../wireframes/04-footballer-dashboard.md).

**Route**: `/dashboard` (FOOTBALLER role) · authenticated, verified.

---

## Layout

Desktop: two-pane.

```
┌──────────────────────────────────────────────────────┐
│  Header (h-16 sticky)                                 │
├────────────┬─────────────────────────────────────────┤
│  Sidebar   │  Main scroll area                        │
│  264 px    │  max-w-[896px], px-6 lg:px-8, py-8        │
└────────────┴─────────────────────────────────────────┘
```

Mobile: sidebar replaced by drawer; main becomes single-column with mobile-specific blocks.

---

## Authenticated header

Per [foundation > Header](00-style-foundation.md#header--navigation):

- Left: `<Logo size="sm" />`.
- Center (desktop): nav links `Dashboard` / `პროფილი` / `კლუბები` / `სერვ.` / `ჩატი`. Active link `text-primary underline underline-offset-8 decoration-2`.
- Right: `<NotificationsBell />` (with badge if unread) + `<UserMenu />` avatar dropdown.
- Mobile: `MenuIcon` triggers drawer; nav links live inside.

`<NotificationsBell>` is `Button variant=ghost size=icon` containing `<BellIcon size={20} />`. Badge: top-right `size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold` with count.

---

## Sidebar

`bg-card border-r border-border w-[264px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto`.

### Profile block

```
▓▓▓▓ (size-16 avatar)
სახელი გვარი (.text-title)
CM · GEO       (.text-caption text-muted-foreground)

Profile score
████████░░ 70%   (Progress component, h-2, primary fill)

[პროფ. რედ.]      (Button variant=outline size=sm w-full)
[CV ჩამოტვ.]      (Button variant=ghost size=sm w-full · disabled · "მალე" badge)
```

### Quick actions group

`.text-overline text-muted-foreground` heading "QUICK", divider, then stacked `Button variant=ghost size=sm justify-start w-full` rows with leading icons:

| Action           | Icon                                      |
| ---------------- | ----------------------------------------- |
| `+ სერვ. მოთხ.`  | `<MealPlanIcon />`                        |
| `კლუბების ძიება` | `<SearchIcon />`                          |
| `ჩატები`         | `<MessageCircleIcon />` (badge if unread) |

### Stats group

`.text-overline` heading "STATS", three small key-value rows:

```
👁 348      ნახვა
❤ 5        გადარჩ.
💬 2        შეტყობ.
```

Icon size 16; numbers `.text-title`; labels `.text-caption text-muted-foreground`.

---

## Main area

### Profile completion banner ⚑A

Renders only when `score < 100`. Component: `<ProfileCompletionBanner>`.

```
┌────────────────────────────────────────────────────┐
│  ░░░ (small illustration · 64×64)                  │
│  # პროფილი 70% შევსებული                            │
│  დააწკაპუნე ქვემოთ — დაგვრჩა { 3 } ველი             │
│                                                    │
│  [პროფ. დასრულება →]   [×]                         │
└────────────────────────────────────────────────────┘
```

- Container: `bg-secondary text-secondary-foreground rounded-xl p-5 flex gap-4`.
- Illustration: stylised checklist icon (custom) or `<FootballIcon size={48} />` until real illustration available.
- CTA: `Button size=sm` "პროფ. დასრულება →" with trailing arrow.
- Dismiss: `Button variant=ghost size=icon` `<CloseIcon />` top-right.

### Club newsfeed

Section heading `.text-headline` "სიახლეები კლუბებიდან", below it `text-muted-foreground` "შენი გამოწერილი კლუბები".

Feed cards stack with `space-y-5`. Each `NewsCard`:

```
┌────────────────────────────────────────────────────┐
│  ▓ logo (size-10)   კლუბ A · 2 სთ. წინ              │
│                                                    │
│  # სათაური                                          │
│  მოკლე ახ. ტექსტი ···                              │
│                                                    │
│  ░░░░░░░░░░░░░░░░░░░░  (media · aspect-video)      │
│                                                    │
│  ❤ 12      💬 3                                    │
└────────────────────────────────────────────────────┘
```

- Card: `bg-card border-border rounded-xl shadow-sm p-5`.
- Header row: avatar `size-10 rounded-md` (clubs are organisations, not people), name `.text-body font-medium`, timestamp `.text-caption text-muted-foreground`.
- Title: `.text-title mt-3`.
- Body: `.text-body text-muted-foreground mt-2 line-clamp-3`.
- Media (optional): `aspect-video rounded-md overflow-hidden mt-4`.
- Engagement bar: `flex gap-4 mt-4 text-caption`, each metric `<Button variant=ghost size=sm>` with leading icon.

Below feed: `Button variant=outline size=sm` "მეტის ჩვენება ↓" centred.

### Empty state — no subscriptions ⚑B

Replace the feed body with `<EmptyState>`:

- Icon: `<FootballIcon size={48} className="text-muted-foreground/50" />`.
- Title: `.text-title` "სიახლეები არ არის".
- Description: "გამოიწერე კლუბი newsfeed-ისთვის."
- CTA: `Button size=sm variant=outline` "კლუბების directory" → `/clubs`.

### Loading state

3 × `<SkeletonCard />` stacked with `space-y-5`.

### Error state

`<ErrorState variant=inline>` with title "სიახლეები ვერ ჩაიტვირთა" + retry button.

---

## Service requests block

Heading `.text-headline mt-12` "სერვ. მოთხოვნები".

Card list (`bg-card border-border rounded-xl shadow-sm divide-y divide-border`):

```
🍽   კვება          [⏳ განხ.]    2026-05-18
💪   ტრენერი        [✓ დადასტ.]  2026-05-15
```

Each row: `flex items-center gap-3 p-4`. Icon size 20 with `text-primary`. Title `.text-body font-medium`. Status pill via `StatusPill` (foundation badge). Date right-aligned `.text-caption text-muted-foreground`.

Below the card: `Button size=sm` "+ ახ. სერვ. მოთხ." → `/services/new`.

### Empty state — no requests

`<EmptyState>`:

- Icon: `<OtherServicesIcon size={48} />`.
- Title: "სერვისი არ მოგითხოვია".
- Description: "ახალი მოთხოვნის გაგზავნა შეგიძლია".
- CTA: `Button size=sm` "+ ახალი სერვისი".

---

## Clubs subscribed strip

Heading `.text-headline mt-12` "გამოწერილი კლუბები".

Horizontal scroll strip on desktop, swipeable carousel on mobile:

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ ▓ A  │ │ ▓ B  │ │ ▓ C  │ │ +    │
│ name │ │ name │ │ name │ │ ძი.  │
└──────┘ └──────┘ └──────┘ └──────┘
```

Each tile `size-24 rounded-xl bg-card border-border flex flex-col items-center justify-center gap-1`.
Logo `size-12 rounded-md`. Name truncated `.text-caption`.
Last "add" tile: dashed border, `<PlusIcon size={24} />` + label "კლუბის ძიება".

---

## Mobile layout

Per wireframe — sidebar collapses into a stacked block at the top:

1. **Profile strip card**: avatar + name + progress bar + edit CTA. `bg-card rounded-xl p-4`.
2. **Quick actions row**: 3 `Button size=lg` chips in a `grid grid-cols-3 gap-2`.
3. **Stats row**: 3-col compact stats in `grid grid-cols-3 gap-2 text-center bg-card rounded-xl p-3`.
4. **Newsfeed**: cards stack at full width with 16-px gutter (`mx-4`).
5. **Service requests** block.
6. **Bottom tab bar** (Phase 7) – not in MVP; mobile users use the drawer menu.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| A   | Completion banner is dismissed when score = 100 or user clicks ×. Server computes score from filled fields.                 |
| B   | Feed items: clubs the footballer subscribed to. Empty state per spec above.                                                 |
| C   | Stats are daily aggregates from a cron task; not real-time. Cached at the edge (`revalidate: 3600`).                        |
| D   | CV download is Phase 4 — button visible but `disabled` with a `<Tooltip>` "მალე ხელმისაწვდომი".                             |
| E   | `[სერვ.]` nav item shows a badge dot when there's a status update on any pending request — read from `notifications` table. |
