# 00 — Style Foundation

The applied design system — the visual primitives every screen reuses.
Anchored to [tokens.md](../tokens.md), [iconography.md](../iconography.md),
and [states.md](../states.md). Each section below is one Figma frame on the
`00 · Style foundation` page.

---

## Typography ramp

`Noto Sans Georgian` (subsets: georgian, latin · weights: 400, 500, 600, 700).
Loaded via `next/font/google`; ships in both glyph sets so Georgian and Latin
words sit on the same baseline.

| Utility class    | Desktop / mobile | Weight | Tracking | Use for                             | Sample            |
| ---------------- | ---------------- | ------ | -------- | ----------------------------------- | ----------------- |
| `.text-display`  | 48 / 36 px       | 700    | -0.02em  | Landing hero, marketing splash      | "Sport Visa"      |
| `.text-headline` | 30 / 24 px       | 600    | -0.01em  | Page titles, section opens          | "ფეხბ. Directory" |
| `.text-title`    | 20 px            | 600    | 0        | Card titles, dialog titles          | "კვება"           |
| `.text-body-lg`  | 18 / 16 px       | 400    | 0        | Lead paragraphs, hero subhead       | "ფეხბ. კლუბებს …" |
| `.text-body`     | 16 / 14 px       | 400    | 0        | Default body copy                   | bio, descriptions |
| `.text-caption`  | 12 px            | 400    | 0        | Helper text, char count, timestamps | "13:45"           |
| `.text-overline` | 12 px UPPERCASE  | 500    | 0.08em   | Section eyebrows, form group labels | "POSITION"        |

Line-height pairings (managed by the utility class — never hand-set):

- display / headline → leading-snug (1.25)
- body-lg / body → leading-relaxed (1.625)
- caption / overline → leading-normal (1.5)

---

## Spacing grid

4-px base unit. Always use Tailwind utilities; never hand-typed pixel values.

| Token | px  | Most common use                       |
| ----- | --- | ------------------------------------- |
| 1     | 4   | Icon-to-text inside a chip            |
| 2     | 8   | Tight stack (form helper under input) |
| 3     | 12  | Form input padding-y                  |
| 4     | 16  | Default `gap` inside a card body      |
| 5     | 20  | Card-to-card vertical rhythm in feeds |
| 6     | 24  | Section-to-section inside a panel     |
| 8     | 32  | Major section break                   |
| 12    | 48  | Hero internal padding (mobile)        |
| 16    | 64  | Hero internal padding (desktop)       |
| 24    | 96  | Marketing-section vertical rhythm     |

Container widths:

- App content max-width: **1280 px** (`max-w-screen-xl`); padded 24 px gutter desktop, 16 px mobile.
- Marketing content max-width: **1120 px** (`max-w-[70rem]`).
- Form card max-width: **480 px** for single-column forms (auth, password reset).
- Onboarding card max-width: **640 px**; **800 px** for the Review step.

---

## Border radius

All from `--radius` family in `globals.css`.

| Use                         | Class          | Value   |
| --------------------------- | -------------- | ------- |
| Inputs, badges, small chips | `rounded-md`   | 7 px    |
| Buttons, default cards      | `rounded-lg`   | 10 px   |
| Hero cards, large panels    | `rounded-xl`   | 14 px   |
| Pills, position chips       | `rounded-full` | 9999 px |
| Avatars                     | `rounded-full` | 9999 px |

---

## Elevation / shadow

Restrained — Sport Visa is a content product, not a feature-heavy SaaS.

| Token | Class       | Where                                                                  |
| ----- | ----------- | ---------------------------------------------------------------------- |
| flat  | (none)      | Cards inside panels                                                    |
| `sm`  | `shadow-sm` | Cards on neutral background (directory grid, feed cards)               |
| `md`  | `shadow-md` | Dropdowns, popovers, message bubbles (incoming side only)              |
| `lg`  | `shadow-lg` | Dialogs, drawers, sticky mobile filter sheet                           |
| —     | `ring-1`    | Focus-visible state — `ring-ring ring-offset-background ring-offset-2` |

No drop-shadows on dark mode panels — replaced with `border` of
`border-border` to keep the layered surface visible.

---

## Buttons

shadcn/ui `<Button>` is the single source of truth. Five variants — each
shown across four states and three sizes on the foundation page.

### Variants

| Variant       | Background       | Foreground                    | Where                               |
| ------------- | ---------------- | ----------------------------- | ----------------------------------- |
| `default`     | `bg-primary`     | `text-primary-foreground`     | Primary CTA — one per screen        |
| `secondary`   | `bg-secondary`   | `text-secondary-foreground`   | Secondary actions                   |
| `outline`     | `border-input`   | `text-foreground`             | Tertiary, "cancel", de-emphasised   |
| `ghost`       | transparent      | `text-foreground`             | Toolbar icon buttons, table actions |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | Reject, delete, sign-out modal      |

### Sizes

| Size      | Height | Padding-X              | Font      | Min touch target |
| --------- | ------ | ---------------------- | --------- | ---------------- |
| `sm`      | 36 px  | 12 px                  | text-sm   | desktop only     |
| `default` | 40 px  | 16 px                  | text-sm   | desktop only     |
| `lg`      | 44 px  | 24 px                  | text-base | mobile-friendly  |
| `icon`    | 40 px  | 0 (16-px icon centred) | —         | desktop          |
| `icon-lg` | 44 px  | 0                      | —         | mobile           |

### States

| State         | Visual change                                                                              |
| ------------- | ------------------------------------------------------------------------------------------ |
| Default       | base styling                                                                               |
| Hover         | bg shifts to `--accent` (or `bg-primary/90` for default)                                   |
| Active        | scale-95 + bg `--accent`                                                                   |
| Focus-visible | `ring-2 ring-ring ring-offset-2`                                                           |
| Disabled      | `opacity-50 cursor-not-allowed` — no hover                                                 |
| Loading       | `<SpinnerIcon size={16} className="animate-spin" />` replaces leading icon; label persists |

---

## Inputs

shadcn/ui `<Input>`, `<Textarea>`, `<Select>` — same border + radius treatment.

### Anatomy

```
┌──────────────────────────────────────────────┐
│ Label (text-overline · 12px · uppercase)     │
│ ┌────────────────────────────────────────┐  │
│ │  Value or placeholder  (text-body)      │  │
│ └────────────────────────────────────────┘  │
│ Helper text (text-caption · muted-foreground)│
└──────────────────────────────────────────────┘
```

### Sizing

- Height: `h-10` (40 px) desktop / `h-11` (44 px) mobile (`size=lg` on mobile).
- Border: `border-input`, radius `rounded-md`.
- Padding: `px-3` (12 px); textarea adds `py-2`.
- Font: `text-body` (16 / 14 px) — never below 16 px on mobile so iOS does not zoom on focus.

### States

| State           | Border                                           | Background      | Indicator                                                                                        |
| --------------- | ------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------ |
| Default / empty | `border-input`                                   | `bg-background` | placeholder = `text-muted-foreground`                                                            |
| Focus           | `border-ring` + `ring-2 ring-ring ring-offset-2` | —               | —                                                                                                |
| Valid           | `border-success`                                 | —               | trailing `<CheckCircleIcon size={16} className="text-success" />`                                |
| Invalid         | `border-destructive`                             | —               | trailing `<AlertCircleIcon size={16} className="text-destructive" />` + helper turns destructive |
| Disabled        | `border-input` opacity-50                        | `bg-muted`      | cursor-not-allowed                                                                               |

### Required marker (★)

Red `*` after the label using `text-destructive`; never inline with the placeholder.

---

## Cards / panels

| Variant             | Container classes                                       | Where                             |
| ------------------- | ------------------------------------------------------- | --------------------------------- |
| Default card        | `bg-card border-border rounded-xl shadow-sm p-6`        | Dashboard widgets, content blocks |
| Compact card        | `bg-card border-border rounded-lg p-4`                  | Directory grid items, chat list   |
| Panel (flat inside) | `bg-card border-border rounded-xl p-6` (no shadow)      | Profile-edit section blocks       |
| Banner              | `bg-secondary text-secondary-foreground rounded-lg p-4` | Profile completion, verification  |

Card titles always use `.text-title`; description below uses `.text-body` muted.
Card actions sit in the bottom-right (`flex justify-end gap-2 mt-6`).

---

## Badges, chips, pills

### Verification badge

Two-part component: icon + label, both `text-success` / `text-warning` /
`text-destructive` depending on state.

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-caption font-medium text-success">
  <VerifiedBadgeIcon size={12} />
  Verified
</span>
```

Pending uses `bg-warning/10 text-warning` + `PendingBadgeIcon`.
Rejected uses `bg-destructive/10 text-destructive` + `XCircleIcon`.

### Position chip (`PositionChip`)

```
┌──────┐
│  CM  │  ← text-overline · 12 px · uppercase
└──────┘
```

- Unselected: `bg-secondary text-secondary-foreground border-transparent`
- Selected: `bg-primary text-primary-foreground border-primary`
- Hover (unselected): `bg-accent`
- Backdrop on profile pages: `PositionTagIcon` from `@/components/icons` as a decorative pill outline at 24 px.

### Status pill (request status)

| Status   | Icon               | Class                                |
| -------- | ------------------ | ------------------------------------ |
| Pending  | `PendingBadgeIcon` | `bg-warning/10 text-warning`         |
| Approved | `CheckCircleIcon`  | `bg-success/10 text-success`         |
| Rejected | `XCircleIcon`      | `bg-destructive/10 text-destructive` |

---

## Avatars

shadcn/ui `<Avatar>`. Sizes used across the product:

| Context                          | Size   | Class     |
| -------------------------------- | ------ | --------- |
| Chat bubble, inline mentions     | 24 px  | `size-6`  |
| Comment, small list row          | 32 px  | `size-8`  |
| Card item, sidebar profile       | 40 px  | `size-10` |
| Header user menu                 | 36 px  | `size-9`  |
| Profile hero (small)             | 80 px  | `size-20` |
| Profile hero (footballer detail) | 128 px | `size-32` |

Fallback initials use `bg-muted text-muted-foreground font-semibold`.
Logos in club avatars use `rounded-md` (clubs are not people).

---

## Iconography (placement)

Sizing follows [iconography.md](../iconography.md):

| Context                  | Size  |
| ------------------------ | ----- |
| Inside caption text      | 14 px |
| Inside a button          | 16 px |
| Default decorative       | 20 px |
| Section heading prefix   | 24 px |
| Empty / error state hero | 48 px |

Inside buttons the icon sits **left of the label** with `gap-2` (8 px),
except `SendIcon` and arrow forward icons which sit **right**.

---

## Header / navigation

### Public header (landing, auth)

- Height: `h-14` (56 px) mobile / `h-16` (64 px) desktop.
- Background: `bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60`.
- Border-bottom: `border-b border-border`.
- Logo: `<Logo size="md" showWordmark />` — left-aligned.
- Right slot: links + CTA buttons (`shesvla`, `regist.`).

### Authenticated header (dashboard, profile)

Same heights and background. Centre nav slot for primary links
(`Dashboard`, `Profile`, `Directory`/`Clubs`, `Services`, `Chat`).
Right slot: notifications bell (`BellIcon`) + avatar menu.

Active link state: `text-primary` + `underline underline-offset-8 decoration-2 decoration-primary`.

### Mobile slide-in drawer

Triggered by `MenuIcon` (24 px). Slides from the right at 320 px wide.
Uses shadcn `<Sheet>` component. Logo + close icon at top; nav links
stacked at `text-title` size with 16-px vertical padding each;
auth/profile CTAs pinned to the bottom.

---

## Sidebar (authenticated dashboards / profile-edit)

- Width: 264 px on desktop, hidden on mobile (replaced by drawer).
- Background: `bg-card border-r border-border`.
- Content rhythm: 24 px outer padding, 16 px between groups, 8 px between rows.
- Section heading: `text-overline text-muted-foreground` with a divider beneath.
- Active row: `bg-accent text-accent-foreground rounded-md` with a 2-px primary indicator bar on the left edge.

---

## Empty / Loading / Error states

Re-exported from [states.md](../states.md). The mockup library page
includes a single instance of each variant so a designer can drop the
right one onto any screen:

- `EmptyState · directory`, `EmptyState · newsfeed`, `EmptyState · chat`,
  `EmptyState · shortlist`, `EmptyState · services`, `EmptyState · notifications`.
- `SkeletonCard`, `SkeletonListItem`, `SkeletonStatStrip`,
  `Skeleton · banner`.
- `ErrorState · inline`, `ErrorState · page`.

When a screen needs a state combination, do **not** redraw it — instance the
foundation component and override the title/description/CTA.

---

## Motion

Used sparingly to reinforce hierarchy, never decorative.

| Token             | Value                               | Where                              |
| ----------------- | ----------------------------------- | ---------------------------------- |
| Snap (instant)    | 0 ms                                | Selection toggles, checkboxes      |
| Subtle (fast)     | 150 ms ease-out                     | Button hover/active, dropdown      |
| Standard          | 200 ms ease-in-out                  | Sheet / dialog open                |
| Deliberate (slow) | 300 ms cubic-bezier(0.4, 0, 0.2, 1) | Page transition, tab switch        |
| Pulse (loop)      | 2 s ease-in-out                     | Skeleton loaders (`animate-pulse`) |
| Spin (loop)       | 1 s linear                          | `SpinnerIcon` (`animate-spin`)     |

Respect `prefers-reduced-motion: reduce` — animation duration drops to 0,
only opacity/colour transitions remain.

---

## Dark mode

Every primitive on this page is duplicated in `.dark` mode on the Figma
foundation page. Designers verify contrast (WCAG AA, ≥ 4.5:1 for body
text) at sign-off. Tokens swap automatically — never hand-paint dark mode.

---

## What to do when a primitive is missing

1. Check `src/components/ui/` — shadcn may already ship it.
2. Check `@/components/icons` — most domain shapes are there.
3. If genuinely missing, propose it in this folder _first_ (new section
   in this file), then add the React component, then create the Figma
   component on the foundation page. Per-screen specs reference the
   library; never embed one-off solutions.
