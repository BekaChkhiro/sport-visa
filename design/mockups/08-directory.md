# 08 — Footballer Directory · Hi-Fi Spec

> Pairs with [wireframes/08-directory.md](../wireframes/08-directory.md).

**Route**: `/directory` (CLUB role only) · authenticated, verified.

---

## Layout

Two-pane: sticky filters left (320 px), results right.

```
┌──────────────────────────────────────────────────────┐
│  Header (club nav)                                    │
├────────────┬─────────────────────────────────────────┤
│  Filters   │  Results                                 │
│  320 px    │  fluid, max-w-[1024px]                   │
│  sticky    │                                          │
└────────────┴─────────────────────────────────────────┘
```

Mobile: filters move into a `<Sheet side="bottom">` drawer triggered by a fixed top button.

---

## Filters sidebar

`bg-card border-r border-border w-[320px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-5 py-6 space-y-6`.

### Heading + reset

```
# ფილტრები                    [გასუფთავება]
```

`.text-headline` left + `Button variant=ghost size=sm` "გასუფთავება" right (disabled when no active filters).

### Filter groups

Each group uses `.text-overline text-muted-foreground` heading + 12-px gap.

#### POSITION ⚑A

`PositionChip` grid `grid grid-cols-4 gap-2`. Multi-select. Active chips switch to selected state from foundation.

Visible chips (mapped to short codes):
GK · CB · LB · RB · CM · DM · AM · LW · RW · CF · ST.

#### AGE

Pair of `<NumberInput>` `min` / `max` (range 14–60). Labels "min" / "max" inside the field.
Optionally a `<Slider>` range below for visual coarse tuning.

#### HEIGHT (სმ) / WEIGHT (კგ)

Same min / max pattern. Sliders pinned to ranges 140-220 / 40-130.

#### DOMINANT FOOT

`<RadioGroup>` vertical with 4 options including "ყველა" (default).

#### NATIONALITY / CITY

`<Combobox>` each. Lists come from reference data; supports search-as-you-type.

#### EXPERIENCE LEVEL

3 checkboxes (`<Checkbox>`): პროფესიონ. / ნახ. / სამოყვ. — visible only when "სამოყვარულო" data is in the ref list.

### Bottom CTAs

```
[ფ. გასუფთავება]   [გამოყენება ▸]
```

Two buttons stacked at the bottom of the sidebar (sticky inside the scroll container). On desktop both stay visible; "გასუფ." is `variant=outline`, "გამოყენება" is `variant=default`.

URL state: every filter is reflected in `searchParams` (`?pos=CM,ST&age=18-26&foot=R…`) so refresh and share preserve state.

---

## Results pane

### Header bar (sticky inside the pane)

```
# ფეხბ. Directory     [234 შედეგი]            SORT: [სიახლე ▾]    VIEW: [▤] [▦]
```

- Page title `.text-headline` + result count chip (`.text-caption bg-muted rounded-full px-2 py-0.5`).
- Sort `<Select>`. Options: სიახლე / ასაკი ↑↓ / სიმაღლე ↑↓ / გადარჩ.
- View toggle `<ToggleGroup>`: grid (`<GridIcon />`) / list (`<ListIcon />`).

### Grid view (default)

`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` of `FootballerCard`:

```
┌──────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← cover image (aspect-[4/5])
│  ░░░░░░░░░░░░░░░░░░░░░░░░░  │     hover scale-105 transition
│  ░░ ▓ avatar (overlay) ░░░  │     avatar 56-px circle, bottom-left -28px
│  ──────────────────────────  │
│  სახელი გვარი   ● Verified   │  ← .text-title + verification badge
│  CM · 26 წ · GEO              │  ← .text-caption muted
│  182 სმ · 78 კგ               │
│                              │
│  [★ შ. სიაში]  [პროფ. ნახვა]│  ← bottom action row
└──────────────────────────────┘
```

- Card: `bg-card border-border rounded-xl shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md`.
- Cover: profile cover image; placeholder uses `bg-muted` with centred `<JerseyIcon size={48} />` if no image.
- Avatar overlay: `size-14 ring-4 ring-card rounded-full -mt-7 ml-4 z-10`.
- Verification badge inline next to name (small variant).
- Bottom action row: `flex gap-2 p-4`. Shortlist button toggles state — outline becomes filled when active (`<StarIcon className="fill-primary" />`).

### List view (alternative)

`bg-card border-border rounded-xl divide-y` table-ish layout:

```
┌─ row ────────────────────────────────────────────────────────────────┐
│ ▓  სახ. გვ.    | CM | 26 წ | 182 სმ | GEO  | [★] [პროფ.]            │
└──────────────────────────────────────────────────────────────────────┘
```

- Row `flex items-center gap-4 p-4`.
- Avatar `size-12`. Name `.text-body font-medium`.
- Position chip + dot-separated meta `.text-caption text-muted-foreground`.
- Actions right-aligned: shortlist icon button + `Button size=sm variant=outline` "პროფ.".

### Pagination

Below the grid:

```
[← წინა]    1   2   3   ...   [შემ. →]
```

Centred `<Pagination>` from shadcn. Active page `bg-primary text-primary-foreground rounded-md`. Disabled prev/next at boundaries.

URL state: `?page=N` keeps history navigable.

---

## States

### Loading

6 × `<FootballerCardSkeleton />` (3-col grid). Or 5 × `<SkeletonListItem />` for list view. Filters sidebar shows compact skeletons too (`<SkeletonText lines={3} />` per group).

### Empty (no results)

`<EmptyState>` inside the results pane:

- Icon: `<SearchIcon size={48} className="text-muted-foreground/50" />`.
- Title: "ფეხბურთელი ვერ მოიძებნა".
- Description: "ფილტრები შეცვალე ან ძიება განახლე".
- CTA: `Button size=sm variant=outline` "ფილტრების გასუფთავება".

### Error

`<ErrorState variant=inline>` with title "ძიება ვერ შესრულდა" + retry CTA.

---

## Mobile

### Top bar

```
┌────────────────────────────────────────┐
│ # Directory                            │
│ [🔍 ფეხბ. ძებნა]                       │
│ [⚙ ფილტრი (3)]   234 შედ.  [სიახლე ▾] │
└────────────────────────────────────────┘
```

- Search input `<Input>` full-width with leading `<SearchIcon size={16} />`.
- Filter trigger button: `Button variant=outline size=sm` with leading `<SlidersIcon />` and a `<Badge>` if active count > 0.
- Sort `<Select size=sm>` inline.

### Filter drawer

shadcn `<Sheet side="bottom">` with `min-h-[60vh] max-h-[90vh] rounded-t-xl`. Header has `# ფილტრები` left, `<CloseIcon>` right. Content scrolls. Sticky footer with [გასუფ.] + [გამოყენება] buttons (`size=lg` full-width).

### Card grid

Single column. Card uses `aspect-[3/4]` cover instead of 4/5 for better fit on portrait phones.

### Pagination

Simplified — only `← წინა` / `შემდეგი →` buttons with a "გვ. 2 / 12" counter centred between.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------- |
| A   | Position filter is a multi-select chip group. Active chips visually inverted (`PositionChip` selected state).     |
| B   | `★` shortlist toggle is optimistic — fires server action `toggleShortlist(footballerId)`. Toast on success/error. |
| C   | Grid columns: 3 (lg) / 2 (md) / 1 (sm).                                                                           |
| D   | Sort options: სიახლე (newest profile update), ასაკი ↑↓, სიმაღლე ↑↓.                                               |
| E   | Mobile filter button shows badge count of active filters; opens bottom-sheet drawer.                              |
| F   | Directory is CLUB-only. Other roles get a 403 page (server-side guard).                                           |
| G   | Empty state copy + reset CTA per spec above.                                                                      |
