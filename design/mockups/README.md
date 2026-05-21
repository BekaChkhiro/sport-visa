# Sport Visa — High-Fidelity Mockups

> **Status**: Finalised in T2.5 (Hi-Fi Mockups). Builds directly on
> T2.1 (brand identity), T2.2 (wireframes), T2.3 (iconography),
> T2.4 (empty / loading / error states), T1.12 (Tailwind + shadcn theme).

This folder contains the **hi-fi mockup specifications** — the bridge
between low-fidelity wireframes (`../wireframes/`) and the implemented UI.
Each screen wireframe gets a sibling spec here that locks in:

- Applied colour tokens (no raw hex)
- Exact typography utility (`text-display` / `text-headline` / …)
- shadcn/ui (or custom) component per element
- Iconography from `@/components/icons` per element
- State variants (default, hover, active, disabled, focus, loading, empty, error)
- Spacing values from the `4-px` grid
- Responsive behaviour at mobile / tablet / desktop

> The actual Figma file (`figma.com/file/sport-visa/mvp-hifi`) mirrors
> this folder one-to-one. When the file drifts from these specs, the
> markdown wins — Figma is the visual reference, the markdown is the
> contract that flows into the implemented components.

---

## Screen index

Each row pairs the wireframe (lo-fi layout + annotations) with the hi-fi
spec (applied design system).

| #   | Wireframe                                                    | Hi-Fi mockup spec                                     | Mobile |
| --- | ------------------------------------------------------------ | ----------------------------------------------------- | ------ |
| 00  | —                                                            | [style-foundation.md](00-style-foundation.md)         | —      |
| 01  | [landing](../wireframes/01-landing.md)                       | [landing.md](01-landing.md)                           | ✅     |
| 02  | [auth](../wireframes/02-auth.md)                             | [auth.md](02-auth.md)                                 | ✅     |
| 03  | [onboarding](../wireframes/03-onboarding.md)                 | [onboarding.md](03-onboarding.md)                     | ✅     |
| 04  | [footballer dash](../wireframes/04-footballer-dashboard.md)  | [footballer-dashboard.md](04-footballer-dashboard.md) | ✅     |
| 05  | [footballer profile](../wireframes/05-footballer-profile.md) | [footballer-profile.md](05-footballer-profile.md)     | ✅     |
| 06  | [club dash](../wireframes/06-club-dashboard.md)              | [club-dashboard.md](06-club-dashboard.md)             | ✅     |
| 07  | [club profile](../wireframes/07-club-profile.md)             | [club-profile.md](07-club-profile.md)                 | ✅     |
| 08  | [directory](../wireframes/08-directory.md)                   | [directory.md](08-directory.md)                       | ✅     |
| 09  | [footballer detail](../wireframes/09-footballer-detail.md)   | [footballer-detail.md](09-footballer-detail.md)       | ✅     |
| 10  | [club detail](../wireframes/10-club-detail.md)               | [club-detail.md](10-club-detail.md)                   | ✅     |
| 11  | [chat](../wireframes/11-chat.md)                             | [chat.md](11-chat.md)                                 | ✅     |
| 12  | [services](../wireframes/12-services.md)                     | [services.md](12-services.md)                         | ✅     |
| 13  | [admin](../wireframes/13-admin.md)                           | [admin.md](13-admin.md)                               | ✅     |

---

## Figma file structure

The Figma file is the visual companion to this spec set. Pages mirror this
folder; frames mirror screens.

```
Sport Visa — MVP Hi-Fi
├── 🎨 00 · Style foundation        ← page (matches 00-style-foundation.md)
│   ├── Colour tokens (swatches)
│   ├── Typography ramp
│   ├── Spacing & radii
│   ├── Buttons (variants × states)
│   ├── Inputs (variants × states)
│   ├── Cards / panels
│   ├── Badges, chips, pills
│   ├── Avatars
│   ├── Icons (mapped from @/components/icons)
│   └── States (empty / loading / error)
│
├── 🟢 01 · Landing
│   ├── Desktop ≥ 1024 px
│   ├── Tablet 640–1024 px
│   └── Mobile < 640 px
│
├── 🟢 02 · Auth (Sign up / Sign in / Reset)
│   ├── Desktop
│   └── Mobile
│
├── 🟢 03 · Onboarding (Footballer 4-step + Club 3-step)
│   └── …
│
├── 🟢 04–13 · One page per screen
│
└── 🧩 Components library (instances reused above)
    ├── Header (footballer / club / admin / public)
    ├── Sidebar
    ├── Profile card
    ├── Position chip
    ├── Verification badge
    ├── ChatBubble
    └── …
```

### Naming convention inside Figma

- **Pages**: `## · Name` (matches spec file prefix — `01 · Landing`).
- **Frames**: `Screen · Breakpoint` (e.g. `Landing · Desktop`, `Landing · Mobile`).
- **Components**: PascalCase, matching the React component name where one exists
  (`Button`, `PositionChip`, `VerifiedBadge`). One-to-one with `src/components/ui/`
  and `src/components/icons.tsx`.
- **Variants**: lowercase kebab-case props matching shadcn variants
  (`variant=default`, `state=hover`, `size=sm`).
- **Layers inside a component**: semantic — `label`, `icon`, `helper`, `error`.

---

## Design principles applied across all screens

| Principle                      | Implementation rule                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Tokens > raw values**        | Every colour, radius, font weight, shadow references `design/tokens.md`. No hex / px-only in component layers.      |
| **Dark mode parity**           | Every frame has a `.dark` companion. Tokens swap automatically — designers verify but don't re-define palette.      |
| **Georgian-first typography**  | `Noto Sans Georgian` (loaded via `next/font/google`). Latin and Georgian glyphs share the same x-height & weight.   |
| **4-px spacing grid**          | All gaps, padding, margins are multiples of 4 (`gap-1` = 4, `gap-2` = 8, `gap-4` = 16, `gap-6` = 24, `gap-8` = 32). |
| **Density follows context**    | Forms: roomy (`gap-6`). Lists: compact (`gap-2`). Hero: generous (`py-24` desktop, `py-12` mobile).                 |
| **Touch targets ≥ 44 × 44 px** | Mobile button height `h-11`. Icon-only buttons get `size-11` with padding around the 16-px icon.                    |
| **State coverage**             | Every interactive element exposes hover, focus-visible, active, disabled, loading. Inputs add error and success.    |
| **Empty / loading / error**    | Use [states.md](../states.md) components — never invent ad-hoc placeholders.                                        |
| **Verified vs pending**        | Profile cards always render the verification badge (success / warning). Pending users are visually de-emphasised.   |

---

## Breakpoints — frame widths in Figma

| Label   | Width (Figma frame) | Tailwind      |
| ------- | ------------------- | ------------- |
| mobile  | 375 px              | (default)     |
| tablet  | 768 px              | `md:`         |
| desktop | 1280 px (1440 max)  | `lg:` / `xl:` |

Desktop is the primary hi-fi frame for every screen; mobile is co-equal
for the screens marked ✅ in the index. Tablet is interpolated unless
explicitly different.

---

## Component sourcing rules

| Element                              | Source                                                             |
| ------------------------------------ | ------------------------------------------------------------------ |
| Buttons, inputs, dropdowns, dialogs  | shadcn/ui — `src/components/ui/*` (already themed)                 |
| Icons                                | `@/components/icons` — never lucide-react directly                 |
| Empty / loading / error states       | `@/components/ui/empty-state`, `skeleton`, `error-state`           |
| Logo, brand chrome                   | `<Logo>` from `src/components/logo.tsx`                            |
| Verification badge                   | `VerifiedBadgeIcon` / `PendingBadgeIcon` from `@/components/icons` |
| Custom domain shapes (pitch, jersey) | Custom icons from `@/components/icons`                             |

**Never build a one-off button or input in Figma.** If you find yourself
designing a control that doesn't have a shadcn counterpart, file it as a
new component in the library page first, then place an instance.

---

## Handoff checklist (per screen)

Before a screen spec is considered "ready for implementation":

- [ ] All colours reference semantic tokens (no raw hex in the spec)
- [ ] Typography utility named (`text-headline` / `text-body` / …)
- [ ] All icons named from `@/components/icons`
- [ ] All interactive elements have state variants documented
- [ ] Mobile breakpoint specified (or marked "desktop-only" with rationale)
- [ ] Empty / loading / error states linked to [states.md](../states.md) variants
- [ ] Annotations from the wireframe carry over — nothing dropped silently
- [ ] Component instances point at the shared library page in Figma
