# Sport Visa — Empty, Loading & Error State Illustrations

> **Status**: Finalised in T2.4. Depends on T2.1 (colour tokens) and T2.3 (icon system).
> Components live in `src/components/ui/` — import from there, not directly from this spec.

All three state families share a centred vertical layout so they feel native across every screen in the product.

---

## Design principles

| Principle                       | Rationale                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| **Centred, spacious**           | States replace content — they need breathing room so users don't feel the screen is broken |
| **Icon at 48 px**               | Largest icon size from iconography.md; visible but not dominating                          |
| **Muted palette by default**    | Empty / loading states use `text-muted-foreground` — they're informational, not alarming   |
| **Destructive tint for errors** | `text-destructive` signals actionable failure without full-red alarm                       |
| **Always offer an exit**        | Every state that can become "stuck" exposes a CTA (retry, navigate, action)                |

---

## 1 — Empty states

### Visual anatomy

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  ▓▓▓▓▓▓▓▓▓▓▓                         │
│              (domain icon, 48 px,                    │
│               text-muted-foreground/50)              │
│                                                      │
│              სათაური (font-semibold)                  │
│        დამხმარე ტექსტი (text-sm, text-muted)          │
│                                                      │
│              [ სამოქმედო ღილაკი ]                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Empty state catalogue

| Screen                           | Icon                     | Title (Georgian)        | Description                               | CTA                                        |
| -------------------------------- | ------------------------ | ----------------------- | ----------------------------------------- | ------------------------------------------ |
| Footballer directory             | `SearchIcon` (48)        | ფეხბურთელი ვერ მოიძებნა | ფილტრები შეცვალე ან ძიება განახლე         | ფილტრების გასუფთავება                      |
| Newsfeed (no subscriptions)      | `FootballIcon` (48)      | სიახლეები არ არის       | გამოიწერე კლუბი newsfeed-ისთვის           | კლუბების directory                         |
| Chat list (no conversations)     | `MessageCircleIcon` (48) | ჩატი ჯერ არ გაქვს       | კლუბები ინიციატივას directory-იდან იღებენ | — (footballer) / directory-ს გახსნა (club) |
| Shortlist (no saved footballers) | `StarIcon` (48)          | Shortlist ცარიელია      | directory-ში ფეხბ. ბარათზე ⭐ დააჭირე     | directory-ს გახსნა                         |
| Service requests (none yet)      | `OtherServicesIcon` (48) | სერვისი არ მოგითხოვია   | ახალი მოთხოვნის გაგზავნა შეგიძლია         | + ახალი სერვისი                            |
| Notifications (none)             | `BellIcon` (48)          | შეტყობინება არ არის     | —                                         | —                                          |
| Admin queue (empty)              | `VerifiedBadgeIcon` (48) | მოლოდინი სია ცარიელია   | ყველა ვერიფიკაცია დასრულებულია            | —                                          |

### Component API

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { FootballIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

<EmptyState
  icon={<FootballIcon size={48} />}
  title="სიახლეები არ არის"
  description="გამოიწერე კლუბი newsfeed-ისთვის."
  action={
    <Button size="sm" variant="outline">
      კლუბების directory
    </Button>
  }
/>;
```

**Props**

| Prop          | Type        | Default  | Description                               |
| ------------- | ----------- | -------- | ----------------------------------------- |
| `icon`        | `ReactNode` | —        | Icon element — use 48 px from icon system |
| `title`       | `string`    | required | Short, specific headline                  |
| `description` | `string`    | —        | One-line guidance text                    |
| `action`      | `ReactNode` | —        | CTA button or link                        |
| `className`   | `string`    | —        | Extra classes on the wrapper              |

---

## 2 — Loading states (skeletons)

Skeletons render in the same spatial footprint as the real content, preventing layout shift when data arrives.

### Skeleton anatomy

```
┌──────────────────────────────────────────────────────┐
│  CARD SKELETON                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  ▓▓▓▓   ░░░░░░░░░░░░░░░  (avatar + name)   │    │
│  │          ░░░░░░░░░░░░    (subtitle)         │    │
│  │                                             │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░  (line 1)          │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░  (line 2)          │    │
│  │  ░░░░░░░░░░░░░░         (line 3, 4/5 wide)  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  LIST ITEM SKELETON                                  │
│  ▓▓▓  ░░░░░░░░░░░░░░░░░░░                           │
│       ░░░░░░░░░░░░░░                                 │
│  ─────────────────────────────────────────────────  │
│  ▓▓▓  ░░░░░░░░░░░░░░░░░░░                           │
│       ░░░░░░░░░░░░░░                                 │
│                                                      │
│  STAT STRIP SKELETON                                 │
│  ░░░░░░   ░░░░░░   ░░░░░░  (value blocks)           │
│  ░░░░░░░  ░░░░░░░  ░░░░░░  (label blocks)           │
└──────────────────────────────────────────────────────┘
```

**Animation**: `animate-pulse` from Tailwind — `bg-muted` fades opacity between 1 → 0.5 → 1 on a 2s loop.

### Skeleton usage by screen

| Screen                    | Skeleton composition                                  |
| ------------------------- | ----------------------------------------------------- |
| Footballer directory      | 6–9 × `<SkeletonCard />` in a responsive grid         |
| Club dashboard newsfeed   | 3 × `<SkeletonCard />` stacked                        |
| Chat list sidebar         | 5 × `<SkeletonListItem />`                            |
| Footballer detail stats   | `<SkeletonStatStrip />`                               |
| Admin queue table         | 5 × `<SkeletonListItem />`                            |
| Profile completion banner | 1 × `<Skeleton className="h-20 w-full rounded-xl" />` |

### Component API

```tsx
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonListItem,
  SkeletonStatStrip,
} from '@/components/ui/skeleton';

// Primitive — use for one-off shapes
<Skeleton className="h-4 w-full" />

// Avatar circle
<SkeletonAvatar className="size-12" />

// Multi-line text block (last line shorter)
<SkeletonText lines={3} />

// Full card (avatar + text + body)
<SkeletonCard />

// Compact list row
<SkeletonListItem />

// Stats strip (3 value+label pairs)
<SkeletonStatStrip />
```

**SkeletonText props**

| Prop        | Type     | Default | Description                                              |
| ----------- | -------- | ------- | -------------------------------------------------------- |
| `lines`     | `number` | `2`     | Number of skeleton lines; last line renders at 80% width |
| `className` | `string` | —       | Extra classes on the wrapper                             |

---

## 3 — Error states

### Visual anatomy

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ⊗  (AlertCircleIcon, 48 px,             │
│                  text-destructive)                   │
│                                                      │
│              შეცდომა მოხდა  (font-semibold)           │
│     მონაცემების ჩატვირთვა ვერ მოხდა.  (text-sm)      │
│                                                      │
│              [ თავიდან ცდა ]                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Error variant: `inline` vs `page`

| Variant            | Min-height | Padding | Usage                                      |
| ------------------ | ---------- | ------- | ------------------------------------------ |
| `inline` (default) | —          | `py-8`  | Inside a card, list section, or data panel |
| `page`             | `40vh`     | `py-16` | Full-page route error boundary replacement |

### Error message catalogue

| Context                     | Title                       | Description                                     |
| --------------------------- | --------------------------- | ----------------------------------------------- |
| Generic data fetch          | შეცდომა მოხდა               | მონაცემების ჩატვირთვა ვერ მოხდა. ცადეთ თავიდან. |
| Directory load failure      | ძიება ვერ შესრულდა          | ფეხბ. სიის ჩატვირთვა ვერ მოხდა.                 |
| Chat load failure           | შეტყობინებები ვერ ჩაიტვირთა | ინტ. კავშირი შეამოწმე და ცადე.                  |
| Form submission failure     | გაგზავნა ვერ მოხდა          | ცადეთ თავიდან ან გვერდი განაახლე.               |
| Image / file upload failure | ფაილი ვერ ატვირთა           | ზომა 10 MB-ზე ნაკლები უნდა იყოს (PDF / image).  |
| Auth session expired        | სესია ამოიწურა              | შეხვედი სისტემაში ხელახლა.                      |

### Component API

```tsx
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

// Inline (default)
<ErrorState
  title="ძიება ვერ შესრულდა"
  description="ფეხბ. სიის ჩატვირთვა ვერ მოხდა."
  action={<Button size="sm" onClick={retry}>თავიდან ცდა</Button>}
/>

// Page-level
<ErrorState
  variant="page"
  title="შეცდომა მოხდა"
  action={
    <div className="flex gap-2">
      <Button onClick={reset}>თავიდან ცდა</Button>
      <Button variant="outline" asChild><Link href="/">მთავარი</Link></Button>
    </div>
  }
/>
```

**Props**

| Prop          | Type                 | Default       | Description                     |
| ------------- | -------------------- | ------------- | ------------------------------- |
| `variant`     | `'inline' \| 'page'` | `'inline'`    | Layout size                     |
| `title`       | `string`             | შეცდომა მოხდა | Headline — override per context |
| `description` | `string`             | (see default) | Helper text beneath headline    |
| `action`      | `ReactNode`          | —             | Retry button or nav link        |
| `className`   | `string`             | —             | Extra classes                   |

---

## Token & icon reference

| State family     | Icon                            | Icon colour                | Surface colour             |
| ---------------- | ------------------------------- | -------------------------- | -------------------------- |
| Empty            | domain-specific (see catalogue) | `text-muted-foreground/50` | —                          |
| Loading skeleton | none                            | —                          | `bg-muted` (animate-pulse) |
| Error            | `AlertCircleIcon`               | `text-destructive`         | —                          |

All colours reference semantic tokens from `design/tokens.md`. Never use raw hex.
