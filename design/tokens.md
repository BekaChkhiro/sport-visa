# Sport Visa — Design Tokens

> **Status**: Provisional (Phase 1). These tokens will be refined in T2.1 (Brand Identity) and re-applied in T2.7 once brand colours are confirmed.

All tokens live in `src/app/globals.css` as CSS custom properties. Tailwind utilities are wired through the `@theme inline` block, so `bg-primary`, `text-primary-foreground`, etc. resolve automatically in both light and dark modes.

---

## Colour tokens

### Brand — primary green

| Token                  | Light (`#`)           | Dark (`#`)            | Usage                             |
| ---------------------- | --------------------- | --------------------- | --------------------------------- |
| `--primary`            | `#16a34a` (green-600) | `#22c55e` (green-500) | CTA buttons, active states, links |
| `--primary-foreground` | `#fafafa`             | `#0a0a0a`             | Text/icons on primary bg          |

> oklch values: light `oklch(0.527 0.154 148)`, dark `oklch(0.723 0.219 149)`

### Secondary / accent — green tint

| Token                    | Light                        | Dark              | Usage                               |
| ------------------------ | ---------------------------- | ----------------- | ----------------------------------- |
| `--secondary`            | green-100 tint               | dark green tint   | Pill backgrounds, secondary buttons |
| `--secondary-foreground` | green-900                    | green-100         | Text on secondary bg                |
| `--accent`               | same as secondary            | same as secondary | Hover states, chip highlights       |
| `--accent-foreground`    | same as secondary-foreground | same              | Text on accent bg                   |

### Neutral surface

| Token                | Light     | Dark              | Usage                      |
| -------------------- | --------- | ----------------- | -------------------------- |
| `--background`       | `#ffffff` | `#0a0a0a`         | Page background            |
| `--foreground`       | `#0a0a0a` | `#fafafa`         | Body text                  |
| `--card`             | `#ffffff` | `#171717`         | Card surface               |
| `--card-foreground`  | `#0a0a0a` | `#fafafa`         | Card text                  |
| `--popover`          | `#ffffff` | `#171717`         | Dropdown / tooltip surface |
| `--muted`            | `#f5f5f5` | `#262626`         | Subdued backgrounds        |
| `--muted-foreground` | `#737373` | `#a3a3a3`         | Placeholder / helper text  |
| `--border`           | `#e5e5e5` | `rgba(white,10%)` | Borders, dividers          |
| `--input`            | `#e5e5e5` | `rgba(white,15%)` | Input borders              |
| `--ring`             | primary   | primary (dark)    | Focus rings                |

### Semantic colours

| Token                      | Light approx.               | Dark approx. | Usage                               |
| -------------------------- | --------------------------- | ------------ | ----------------------------------- |
| `--success`                | green-600 (same as primary) | green-500    | Verification badges, success toasts |
| `--success-foreground`     | white                       | dark         | —                                   |
| `--warning`                | amber-400                   | amber-300    | Pending states, warnings            |
| `--warning-foreground`     | dark                        | dark         | —                                   |
| `--info`                   | blue-500                    | blue-400     | Info banners                        |
| `--info-foreground`        | white                       | white        | —                                   |
| `--destructive`            | red-500                     | red-400      | Destructive actions, error states   |
| `--destructive-foreground` | white                       | white        | —                                   |

---

## Border radius

| Token         | Value       | Maps to                      |
| ------------- | ----------- | ---------------------------- |
| `--radius`    | `0.625rem`  | `rounded-lg` (`--radius-lg`) |
| `--radius-sm` | `0.25rem`   | `rounded-sm`                 |
| `--radius-md` | `0.4375rem` | `rounded-md`                 |
| `--radius-xl` | `0.875rem`  | `rounded-xl`                 |

---

## Typography

Font stack: `Noto Sans Georgian` + system sans-serif fallback. Loaded via `next/font/google` (subsets: georgian, latin; weights: 400, 500, 600, 700).

### Type-scale utility classes

Use these CSS classes (defined in `globals.css`) instead of raw Tailwind size utilities:

| Class            | Size                 | Weight | Leading | Use for                                         |
| ---------------- | -------------------- | ------ | ------- | ----------------------------------------------- |
| `.text-display`  | 2.25rem / 3rem lg    | 700    | tight   | Hero headings                                   |
| `.text-headline` | 1.5rem / 1.875rem lg | 600    | snug    | Section titles                                  |
| `.text-title`    | 1.25rem              | 600    | snug    | Card titles, page subtitles                     |
| `.text-body-lg`  | 1rem / 1.125rem lg   | 400    | relaxed | Lead paragraphs                                 |
| `.text-body`     | 0.875rem / 1rem lg   | 400    | relaxed | Default body text                               |
| `.text-caption`  | 0.75rem              | 400    | normal  | Meta / helper text (muted)                      |
| `.text-overline` | 0.75rem              | 500    | normal  | Section labels, eyebrows (uppercase + tracking) |

---

## Dark mode

Dark mode is driven by the `.dark` class on `<html>` (managed by `next-themes` via `ThemeProvider`). Every token has a `.dark` override — no component should hardcode a colour.

---

## Rules

- **No hardcoded hex in components.** Always use a semantic token (`bg-primary`, `text-muted-foreground`, `border-border`, etc.).
- **Semantic over raw scale.** Prefer `bg-success` over `bg-green-600` so dark mode and future rebrands work automatically.
- **Token updates here.** When T2.1 finalises the brand, update `globals.css` only — all components update for free.
