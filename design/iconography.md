# Sport Visa — Iconography

> **Status**: Finalised in T2.3 (Iconography & Custom Icons).
> Source of truth for icon selection and usage across all screens.

All icons are imported from `@/components/icons` — **not** directly from `lucide-react` or other packages. This keeps import paths stable if the underlying library changes.

```tsx
import { FootballIcon, SearchIcon, VerifiedBadgeIcon } from '@/components/icons';
```

---

## Library

**Base library**: `lucide-react` — consistent 24×24 stroke-based icons, tree-shakeable.

**Custom icons** (`src/components/icons.tsx`): sport-domain concepts absent from Lucide, also 24×24, `currentColor` stroke, matching visual weight.

---

## Custom icons

These icons do not exist in Lucide and were drawn specifically for Sport Visa.

| Export              | Visual concept                                               | Where used                                                |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| `FootballIcon`      | Soccer ball with pentagon patches                            | Nav labels, empty states, hero illustration supports      |
| `JerseyIcon`        | Football shirt / jersey silhouette                           | Footballer cards, position sections                       |
| `PitchIcon`         | Overhead football pitch with centre circle and penalty areas | Tactical position picker, analytics section               |
| `VerifiedBadgeIcon` | Shield with check mark (filled tint + stroke)                | Verified footballer/club profiles — colour `text-success` |
| `PendingBadgeIcon`  | Shield with clock                                            | Pending verification — colour `text-warning`              |
| `PositionTagIcon`   | Rounded pill shape                                           | Background shape behind position abbreviation chips       |
| `TransferIcon`      | Bidirectional arrow                                          | Transfer requests, club-to-footballer matching            |

All custom icons accept standard `SVGProps` plus `size?: number` (default 24) and `className`.

---

## Lucide icon mapping — by domain concept

### Navigation & layout

| Concept                 | Export name       | Lucide source       |
| ----------------------- | ----------------- | ------------------- |
| Hamburger / mobile menu | `MenuIcon`        | `Menu`              |
| Dropdown caret          | `ChevronDownIcon` | `ChevronDown`       |
| Collapse                | `ChevronUpIcon`   | `ChevronUp`         |
| Go back                 | `ArrowLeftIcon`   | `ArrowLeft`         |
| Go forward              | `ArrowRightIcon`  | `ArrowRight`        |
| Card / grid view        | `GridViewIcon`    | `LayoutGrid`        |
| List view               | `ListViewIcon`    | `List`              |
| Filters                 | `FiltersIcon`     | `SlidersHorizontal` |

### User & authentication

| Concept                      | Export name    | Lucide source |
| ---------------------------- | -------------- | ------------- |
| Single user                  | `UserIcon`     | `User`        |
| Multiple users / club roster | `UsersIcon`    | `Users`       |
| Sign in                      | `LogInIcon`    | `LogIn`       |
| Sign out                     | `LogOutIcon`   | `LogOut`      |
| Invite / register            | `UserPlusIcon` | `UserPlus`    |

### Actions

| Concept             | Export name        | Lucide source  |
| ------------------- | ------------------ | -------------- |
| Add / new           | `PlusIcon`         | `Plus`         |
| Close / dismiss     | `CloseIcon`        | `X`            |
| Search              | `SearchIcon`       | `Search`       |
| Edit                | `EditIcon`         | `Edit`         |
| Delete              | `DeleteIcon`       | `Trash2`       |
| Download (e.g. CV)  | `DownloadIcon`     | `Download`     |
| Upload (e.g. media) | `UploadIcon`       | `Upload`       |
| Open in new tab     | `ExternalLinkIcon` | `ExternalLink` |
| Copy                | `CopyIcon`         | `Copy`         |
| Refresh             | `RefreshIcon`      | `RefreshCw`    |

### Content & engagement

| Concept                           | Export name | Lucide source |
| --------------------------------- | ----------- | ------------- |
| Like / save post                  | `HeartIcon` | `Heart`       |
| Profile views                     | `EyeIcon`   | `Eye`         |
| Shortlist (club saves footballer) | `StarIcon`  | `Star`        |

### Communication & chat

| Concept            | Export name         | Lucide source   |
| ------------------ | ------------------- | --------------- |
| Messages / chat    | `MessageCircleIcon` | `MessageCircle` |
| Notifications bell | `BellIcon`          | `Bell`          |
| Send message       | `SendIcon`          | `Send`          |
| Attachment         | `PaperclipIcon`     | `Paperclip`     |

### Status & verification

| Concept         | Export name         | Lucide source   | Notes                     |
| --------------- | ------------------- | --------------- | ------------------------- |
| Verified ✓      | `VerifiedBadgeIcon` | custom          | colour `text-success`     |
| Pending ⏳      | `PendingBadgeIcon`  | custom          | colour `text-warning`     |
| Rejected        | `XCircleIcon`       | `XCircle`       | colour `text-destructive` |
| Generic success | `CheckCircleIcon`   | `CheckCircle`   | colour `text-success`     |
| Warning         | `AlertTriangleIcon` | `AlertTriangle` | colour `text-warning`     |
| Info            | `InfoIcon`          | `Info`          | colour `text-info`        |
| Error           | `AlertCircleIcon`   | `AlertCircle`   | colour `text-destructive` |
| In progress     | `SpinnerIcon`       | `Loader2`       | animate-spin              |

### Media & files

| Concept         | Export name    | Lucide source |
| --------------- | -------------- | ------------- |
| Photo / gallery | `ImageIcon`    | `Image`       |
| Video           | `VideoIcon`    | `Video`       |
| Document / CV   | `FileTextIcon` | `FileText`    |
| Camera          | `CameraIcon`   | `Camera`      |

### Services (footballer requests)

| Service type        | Export name           | Lucide source     |
| ------------------- | --------------------- | ----------------- |
| Meal plan 🍽        | `MealPlanIcon`        | `UtensilsCrossed` |
| Personal trainer 💪 | `PersonalTrainerIcon` | `Dumbbell`        |
| Team doctor 🏥      | `TeamDoctorIcon`      | `Stethoscope`     |
| Other services      | `OtherServicesIcon`   | `MoreHorizontal`  |

### Data, location & settings

| Concept               | Export name      | Lucide source |
| --------------------- | ---------------- | ------------- |
| Stats chart           | `BarChartIcon`   | `BarChart3`   |
| Trending              | `TrendingUpIcon` | `TrendingUp`  |
| Location pin          | `MapPinIcon`     | `MapPin`      |
| Date / calendar       | `CalendarIcon`   | `Calendar`    |
| Settings              | `SettingsIcon`   | `Settings`    |
| Permissions / shield  | `ShieldIcon`     | `Shield`      |
| Lock / private        | `LockIcon`       | `Lock`        |
| Country / language    | `GlobeIcon`      | `Globe`       |
| External link         | `LinkIcon`       | `Link`        |
| Share                 | `ShareIcon`      | `Share2`      |
| Required field marker | `FlagIcon`       | `Flag`        |

---

## Sizing convention

| Context                  | Size  | Tailwind class        |
| ------------------------ | ----- | --------------------- |
| Inline in text (caption) | 14 px | `size={14}`           |
| Button icon              | 16 px | `size={16}`           |
| Default / body           | 20 px | `size={20}`           |
| Section heading          | 24 px | `size={24}` (default) |
| Hero / empty state       | 48 px | `size={48}`           |

---

## Colour convention

Icons inherit `currentColor` — always set colour via text utilities on the icon itself or a parent:

```tsx
<VerifiedBadgeIcon className="text-success" size={20} />
<PendingBadgeIcon  className="text-warning"     size={20} />
<XCircleIcon       className="text-destructive" size={20} />
<HeartIcon         className="text-primary"     size={16} />
```

Never hardcode hex values on icons.

---

## Accessibility

- All icons are `aria-hidden="true"` and `focusable="false"` by default.
- When an icon is the only content of an interactive element, add `aria-label` to the element:

```tsx
<button aria-label="Add to shortlist">
  <StarIcon size={16} />
</button>
```

- For decorative icons alongside text, no additional ARIA is needed.
