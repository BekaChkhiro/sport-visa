# Sport Visa — Wireframes

Low-fidelity wireframe specifications for all key screens. Each file uses ASCII-art layouts with annotation notes describing interactions and displayed data.

> These wireframes are the single source of truth for layout decisions before hi-fi Figma mockups (T2.5) are created.

---

## Screen index

| #   | File                                                  | Screen                                | Mobile |
| --- | ----------------------------------------------------- | ------------------------------------- | ------ |
| 01  | [landing.md](01-landing.md)                           | Landing page                          | ✅     |
| 02  | [auth.md](02-auth.md)                                 | Sign up / Sign in                     | —      |
| 03  | [onboarding.md](03-onboarding.md)                     | Onboarding wizard (footballer + club) | —      |
| 04  | [footballer-dashboard.md](04-footballer-dashboard.md) | Footballer dashboard                  | ✅     |
| 05  | [footballer-profile.md](05-footballer-profile.md)     | Footballer profile edit               | —      |
| 06  | [club-dashboard.md](06-club-dashboard.md)             | Club dashboard                        | ✅     |
| 07  | [club-profile.md](07-club-profile.md)                 | Club profile edit                     | —      |
| 08  | [directory.md](08-directory.md)                       | Footballer directory + filters        | ✅     |
| 09  | [footballer-detail.md](09-footballer-detail.md)       | Footballer detail (club view)         | —      |
| 10  | [club-detail.md](10-club-detail.md)                   | Club detail page                      | —      |
| 11  | [chat.md](11-chat.md)                                 | Chat thread                           | —      |
| 12  | [services.md](12-services.md)                         | Services request form                 | —      |
| 13  | [admin.md](13-admin.md)                               | Admin verification queue              | —      |

---

## User flow

```
[Landing] ──▶ [Sign up] ──▶ [Onboarding wizard]
                                    │
                    ┌───────────────┴──────────────┐
                    ▼                               ▼
         [Footballer dashboard]           [Club dashboard]
                    │                               │
         ┌──────────┤                    ┌──────────┤
         │ Edit profile                  │ Edit profile
         │ Browse clubs                  │ Browse directory ──▶ [Footballer detail]
         │ Subscribe clubs               │ Filter & shortlist
         │ Request services ──▶ [Services form]
         │ Chat ──────────────────────────────────▶ [Chat thread]
         └──────────────────────────────────────────────────────
                                                    │
                                          [Club detail page]

[Admin] ──▶ [Verification queue] ──▶ approve / reject users
```

---

## Wireframe conventions

```
┌─────────────────┐  outer box = screen / section boundary
│                 │
│  [Button text]  │  square brackets = interactive element (button / link)
│  {Input label}  │  curly braces = form input
│  # Heading      │  hash prefix = typography heading
│  · list item    │  dot prefix = list item / data row
│  ░░░░░░░░░░░░░░  │  shade blocks = images / media placeholders
│  ▓ avatar       │  dark block = avatar / icon placeholder
└─────────────────┘

★  = required field indicator
⚑  = annotation (explained in the Annotations section of each file)
↕  = scroll boundary
```

---

## Breakpoints

| Label   | Width         |
| ------- | ------------- |
| mobile  | < 640 px      |
| tablet  | 640 – 1024 px |
| desktop | > 1024 px     |

Desktop is the primary wireframe. Mobile variants are provided for: Landing, Footballer dashboard, Club dashboard, Footballer directory.
