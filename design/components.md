# Sport Visa — Design System & Component Blueprint

> **Status**: Finalised in T2.6. Bridges hi-fi mockups (T2.5) → implementation (T3+).
> Depends on T2.1 (tokens), T2.3 (icons), T2.4 (states), T2.5 (screen mockups).

This document is the **single source of truth for every reusable component** in the Sport Visa
UI. For each component it specifies: import path, props API, variants, interactive states, and
usage notes. Screen-level composition is in the individual `design/mockups/*.md` files; this
document governs the shared building blocks they reference.

---

## How this relates to other design docs

| Doc                                     | Scope                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `design/tokens.md`                      | CSS custom properties, colour palette, typography scale, border radius |
| `design/iconography.md`                 | Icon exports (`@/components/icons`) and sizing rules                   |
| `design/states.md`                      | `EmptyState`, `Skeleton*`, `ErrorState` APIs                           |
| `design/mockups/00-style-foundation.md` | Visual specimens: buttons × states, inputs × states, badges, avatars   |
| **`design/components.md` (this file)**  | Full component catalog with props, variants, status, and notes         |
| `design/mockups/01–13-*.md`             | Per-screen assembly — references components from this catalog          |

---

## Component layers

Components are organised into five layers. Import rules flow downward only (a domain
component may use a primitive; a primitive must not import a domain component).

```
Layer 4 │ Composite / layout    AppShell, AppSidebar, MobileNavDrawer, …
        │
Layer 3 │ Domain components     FootballerCard, PositionChip, ChatBubble, …
        │
Layer 2 │ UI patterns           NotificationsBell, UserMenu, DirectoryFilterBar, …
        │
Layer 1 │ Brand                 Logo
        │
Layer 0 │ Primitives            Button, Input, Card, Skeleton, Avatar, Badge, …
                                (shadcn/ui — src/components/ui/)
```

**Status key** used throughout this file:

| Badge       | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| ✅ exists   | Component is in `src/` and matches this spec                             |
| 🔨 to build | Not yet implemented — queued for T3+                                     |
| ➕ shadcn   | Standard shadcn component to be added via `npx shadcn@latest add <name>` |

---

## Layer 0 — Primitives

These come from shadcn/ui, themed via `globals.css`. Install with
`npx shadcn@latest add <name>` when needed. Never import from `@radix-ui/*` directly
in feature code — always go through the shadcn wrapper in `src/components/ui/`.

### `Button` ✅

**File**: `src/components/ui/button.tsx`

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">
  Primary CTA
</Button>;
```

**Variants**

| `variant`     | Background       | Foreground                    | Use                            |
| ------------- | ---------------- | ----------------------------- | ------------------------------ |
| `default`     | `bg-primary`     | `text-primary-foreground`     | One primary CTA per screen     |
| `secondary`   | `bg-secondary`   | `text-secondary-foreground`   | Secondary actions              |
| `outline`     | `border-input`   | `text-foreground`             | Tertiary / cancel              |
| `ghost`       | transparent      | `text-foreground`             | Toolbar, table row actions     |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | Delete, reject, sign-out modal |

**Sizes**

| `size`    | Height | Use                                        |
| --------- | ------ | ------------------------------------------ |
| `sm`      | 36 px  | Desktop-only compact actions               |
| `default` | 40 px  | Standard desktop button                    |
| `lg`      | 44 px  | Mobile-friendly (meets 44 px touch target) |
| `icon`    | 40 px  | Icon-only, no label                        |
| `icon-lg` | 44 px  | Icon-only, mobile touch target             |

**States**: default → hover (`bg-primary/90`) → active (scale-95) → focus-visible
(`ring-2 ring-ring ring-offset-2`) → disabled (`opacity-50 cursor-not-allowed`).

Loading state: replace leading icon with `<SpinnerIcon size={16} className="animate-spin" />`;
keep the label visible. Never disable the button during loading (prevents screen-reader
confusion) — disable it only when the action would genuinely error.

---

### `Input` ✅

**File**: `src/components/ui/input.tsx`

```tsx
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="სახელი" />;
```

Height: `h-10` desktop / `h-11` mobile. Font: `text-body` (≥ 16 px on mobile to prevent
iOS zoom). Border: `border-input rounded-md`. Label sits above using `.text-overline`;
helper text sits below using `.text-caption text-muted-foreground`.

**States**: default → focus (`ring-2 ring-ring`) → valid (`border-success` + trailing
`CheckCircleIcon`) → invalid (`border-destructive` + trailing `AlertCircleIcon` + helper
turns `text-destructive`) → disabled (`bg-muted opacity-50 cursor-not-allowed`).

Required marker: `<span className="text-destructive ml-0.5">*</span>` after the label
text — never inside the placeholder.

---

### `Card` ✅

**File**: `src/components/ui/card.tsx`

Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

**Variants** (applied via `className` — not separate props):

| Variant      | Classes                                                 | Use                             |
| ------------ | ------------------------------------------------------- | ------------------------------- |
| Default      | `rounded-xl shadow-sm p-6 bg-card border-border`        | Dashboard widgets               |
| Compact      | `rounded-lg p-4 bg-card border-border`                  | Directory grid items, chat list |
| Panel (flat) | `rounded-xl p-6 bg-card border-border` (no shadow)      | Profile-edit section blocks     |
| Banner       | `rounded-lg p-4 bg-secondary text-secondary-foreground` | Completion banners, alerts      |

Card titles always use `.text-title`; description below uses `.text-body text-muted-foreground`.
Card actions sit in `CardFooter` with `flex justify-end gap-2`.

---

### `Skeleton` ✅

**File**: `src/components/ui/skeleton.tsx`

See `design/states.md §2` for full API. Summary:

```tsx
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonListItem,
  SkeletonStatStrip,
} from '@/components/ui/skeleton';
```

Animation: `animate-pulse bg-muted` (2 s ease-in-out). Use the composite variants
(`SkeletonCard`, `SkeletonListItem`) in preference to raw `<Skeleton />` to prevent layout
shift. Render exactly as many skeletons as the real list will show (typically 6 for a grid,
5 for a list).

---

### `EmptyState` ✅

**File**: `src/components/ui/empty-state.tsx`

See `design/states.md §1` for full API. Props: `icon`, `title`, `description`, `action`,
`className`. Icon size always 48 px. Catalogue of domain-specific messages is in
`states.md §1`.

---

### `ErrorState` ✅

**File**: `src/components/ui/error-state.tsx`

See `design/states.md §3` for full API. Props: `variant` (`inline` | `page`), `title`,
`description`, `action`, `className`. Use `variant="page"` only in route-level error
boundaries.

---

### `Avatar` ➕ shadcn

**Install**: `npx shadcn@latest add avatar`  
**File** (after install): `src/components/ui/avatar.tsx`

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar className="size-10">
  <AvatarImage src={profilePhotoUrl} alt={fullName} />
  <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
    {initials}
  </AvatarFallback>
</Avatar>;
```

**Sizes** (apply via `className`):

| Context               | Class     | px  |
| --------------------- | --------- | --- |
| Chat bubble / inline  | `size-6`  | 24  |
| Compact list row      | `size-8`  | 32  |
| Header user menu      | `size-9`  | 36  |
| Card item / sidebar   | `size-10` | 40  |
| Profile hero (small)  | `size-20` | 80  |
| Profile hero (detail) | `size-32` | 128 |

Footballer avatars: `rounded-full`. Club logos: `rounded-md` (organisations are not people).
Fallback always shows initials — never a generic grey silhouette.

---

### `Badge` ➕ shadcn

**Install**: `npx shadcn@latest add badge`  
**File** (after install): `src/components/ui/badge.tsx`

Generic status label. Domain-specific badges (`VerificationBadge`, `PositionChip`,
`StatusPill`) are built on top — see Layer 3.

---

### `Dialog` ➕ shadcn

**Install**: `npx shadcn@latest add dialog`  
**File** (after install): `src/components/ui/dialog.tsx`

Used for: confirm-delete prompts, reject reason modals (admin), image-preview lightbox.
Max-width `sm:max-w-md`. Title uses `.text-title`; body uses `.text-body`.
Always include a close button (`CloseIcon size={16}`). Actions: `variant=destructive`
(confirm) / `variant=outline` (cancel) in `flex justify-end gap-2`.

---

### `Sheet` ➕ shadcn

**Install**: `npx shadcn@latest add sheet`  
**File** (after install): `src/components/ui/sheet.tsx`

Used for: `MobileNavDrawer` (side=right, 320 px), directory filters on mobile
(side=bottom, full-width).

---

### `Select` ➕ shadcn

**Install**: `npx shadcn@latest add select`  
**File** (after install): `src/components/ui/select.tsx`

Used in: onboarding dropdowns (country, nationality, year), form selects.
Height `h-10`. Same border/radius treatment as `Input`.

---

### `Textarea` ➕ shadcn

**Install**: `npx shadcn@latest add textarea`  
**File** (after install): `src/components/ui/textarea.tsx`

Used in: bio field (profile edit), service request message. Min-height 120 px; resizable
vertically only (`resize-y`). Character count rendered as `.text-caption text-muted-foreground`
aligned right below the field.

---

### `Checkbox` ➕ shadcn

**Install**: `npx shadcn@latest add checkbox`  
**File** (after install): `src/components/ui/checkbox.tsx`

Used in: directory filters (experience level), terms acceptance on auth.
Label sits right of the box with `gap-2 text-body`.

---

### `RadioGroup` ➕ shadcn

**Install**: `npx shadcn@latest add radio-group`  
**File** (after install): `src/components/ui/radio-group.tsx`

Used in: directory filter (dominant foot: left / right / both / all).
Vertical stack with `space-y-2 text-body`.

---

### `Progress` ➕ shadcn

**Install**: `npx shadcn@latest add progress`  
**File** (after install): `src/components/ui/progress.tsx`

Used in: `ProfileCompletionBanner` (horizontal bar, `h-2`, primary fill, muted track).

---

### `Slider` ➕ shadcn

**Install**: `npx shadcn@latest add slider`  
**File** (after install): `src/components/ui/slider.tsx`

Used in: directory filters (age, height, weight range). Single or double-headed.
Primary track fill.

---

### `Tabs` ➕ shadcn

**Install**: `npx shadcn@latest add tabs`  
**File** (after install): `src/components/ui/tabs.tsx`

Used in: footballer profile (about / stats / gallery), club profile tabs, admin
queue tabs (pending / approved / rejected).

---

### `Tooltip` ➕ shadcn

**Install**: `npx shadcn@latest add tooltip`  
**File** (after install): `src/components/ui/tooltip.tsx`

Used in: icon-only buttons that need a label on hover. Always wrap `<TooltipProvider>`
near the root (already placed in `layout.tsx` when installed).

---

### `DropdownMenu` ➕ shadcn

**Install**: `npx shadcn@latest add dropdown-menu`  
**File** (after install): `src/components/ui/dropdown-menu.tsx`

Used in: `UserMenu` (header avatar), 3-dot context menus on cards.
Max-width 200 px. Destructive items use `text-destructive` with `DeleteIcon`.

---

### `NumberInput` 🔨 to build

**File**: `src/components/ui/number-input.tsx`

Numeric input with optional `min` / `max` clamp and `+` / `−` steppers.

```tsx
<NumberInput min={14} max={60} value={age} onChange={setAge} placeholder="18" />
```

Props: `min`, `max`, `step` (default 1), `value`, `onChange`, `placeholder`, `disabled`,
`className`. Implements the same states as `Input`. Clamps `value` on blur. Internal
steppers are `Button variant=ghost size=icon-lg` (44 px touch target on mobile).

---

### `ComboboxField` 🔨 to build

**File**: `src/components/ui/combobox-field.tsx`

Combobox with search-as-you-type. Built on `@radix-ui/react-popover` + `Input`.

```tsx
<ComboboxField
  options={countries}
  value={nationality}
  onSelect={setNationality}
  placeholder="ქვეყანა"
  searchPlaceholder="ძიება…"
/>
```

Props: `options: { value: string; label: string }[]`, `value`, `onSelect`, `placeholder`,
`searchPlaceholder`, `disabled`, `className`. Renders selected value with `CloseIcon`
clear button. Dropdown max-height 240 px with scroll.

---

## Layer 1 — Brand

### `Logo` ✅

**File**: `src/components/logo.tsx`

```tsx
import { Logo } from '@/components/logo';

<Logo size="md" showWordmark />;
```

Props: `size` (`sm` | `md` | `lg`), `showWordmark` (bool, default `true`).
Renders: shield badge (filled `bg-primary`, white V-mark) + "Sport Visa" wordmark in
`font-semibold tracking-tight`. Dark mode: badge fill swaps via `fill-primary`;
white stroke stays white.

| `size` | Badge | Wordmark font |
| ------ | ----- | ------------- |
| `sm`   | 24 px | `text-sm`     |
| `md`   | 32 px | `text-base`   |
| `lg`   | 48 px | `text-xl`     |

---

## Layer 2 — UI Patterns

Domain-agnostic components that aren't directly from shadcn.

### `NotificationsBell` 🔨 to build

**File**: `src/components/notifications-bell.tsx`

```tsx
<NotificationsBell unreadCount={3} onClick={openNotificationsPanel} />
```

`Button variant=ghost size=icon` containing `<BellIcon size={20} />`. When
`unreadCount > 0`: top-right absolute badge (`size-4 rounded-full bg-destructive
text-destructive-foreground text-[10px] font-semibold`). Caps display at `99+`.

Props: `unreadCount: number`, `onClick: () => void`, `className`.

---

### `UserMenu` 🔨 to build

**File**: `src/components/user-menu.tsx`

Avatar `<DropdownMenu>` trigger. Renders `<Avatar size-9>` as trigger. Menu items:

| Item        | Icon           | Variant     |
| ----------- | -------------- | ----------- |
| პროფილი     | `UserIcon`     | default     |
| პარამეტრები | `SettingsIcon` | default     |
| ---         | —              | separator   |
| გამოსვლა    | `LogOutIcon`   | destructive |

Props: `user: { name: string; image?: string; initials: string }`, `onSignOut`.

---

### `StatusPill` 🔨 to build

**File**: `src/components/ui/status-pill.tsx`

Inline coloured pill for request or record status.

```tsx
<StatusPill status="pending" />
<StatusPill status="approved" />
<StatusPill status="rejected" />
```

| `status`   | Icon               | Classes                              |
| ---------- | ------------------ | ------------------------------------ |
| `pending`  | `PendingBadgeIcon` | `bg-warning/10 text-warning`         |
| `approved` | `CheckCircleIcon`  | `bg-success/10 text-success`         |
| `rejected` | `XCircleIcon`      | `bg-destructive/10 text-destructive` |

Props: `status: 'pending' | 'approved' | 'rejected'`, `className`.
Size: `rounded-full px-2 py-0.5 text-caption font-medium inline-flex items-center gap-1`.
Icon size 12 px.

---

## Layer 3 — Domain Components

### `VerificationBadge` 🔨 to build

**File**: `src/components/verification-badge.tsx`

Inline chip: icon + label. Three states mirror `StatusPill` but with sport-specific copy.

```tsx
<VerificationBadge status="verified" />
<VerificationBadge status="pending" />
<VerificationBadge status="rejected" />
```

| `status`   | Icon                | Label (Georgian) | Classes                              |
| ---------- | ------------------- | ---------------- | ------------------------------------ |
| `verified` | `VerifiedBadgeIcon` | Verified         | `bg-success/10 text-success`         |
| `pending`  | `PendingBadgeIcon`  | განხ. მოლოდინი   | `bg-warning/10 text-warning`         |
| `rejected` | `XCircleIcon`       | უარყოფილი        | `bg-destructive/10 text-destructive` |

Props: `status: 'verified' | 'pending' | 'rejected'`, `showLabel` (bool, default `true`),
`className`. Icon size 12 px inside chip; 16 px when `showLabel=false` (standalone icon).

---

### `PositionChip` 🔨 to build

**File**: `src/components/position-chip.tsx`

Pill showing a football position abbreviation. Selectable (used in both display and
filter contexts).

```tsx
<PositionChip position="CM" />
<PositionChip position="ST" selected />
<PositionChip position="GK" onClick={handleToggle} />
```

Anatomy: `rounded-full px-2.5 py-0.5 text-overline uppercase inline-flex items-center`.

| State              | Classes                                                            |
| ------------------ | ------------------------------------------------------------------ |
| Unselected         | `bg-secondary text-secondary-foreground border border-transparent` |
| Selected           | `bg-primary text-primary-foreground border-primary`                |
| Hover (unselected) | `bg-accent`                                                        |
| Disabled           | `opacity-50 cursor-not-allowed`                                    |

Props: `position: string` (2–3 char code, e.g. `"CM"`, `"GK"`), `selected?: boolean`,
`onClick?: () => void`, `disabled?: boolean`, `className`.

Valid positions: `GK · CB · LB · RB · CM · DM · AM · LW · RW · CF · ST`.

---

### `ProfileAvatar` 🔨 to build

**File**: `src/components/profile-avatar.tsx`

Avatar with verification badge overlay and optional camera-edit affordance.

```tsx
<ProfileAvatar
  src={photoUrl}
  fallback="GK"
  size="lg"
  verificationStatus="verified"
  editable
  onEdit={openUploadDialog}
/>
```

Visual anatomy: `<Avatar>` with `<VerificationBadge>` absolutely positioned at
bottom-right (`-bottom-1 -right-1`). When `editable`, a `<CameraIcon>` scrim overlay
(`bg-black/40 rounded-full`) appears on hover with `aria-label="ფოტო შეცვლა"`.

Props: `src?: string`, `fallback: string`, `size: 'sm' | 'md' | 'lg' | 'xl'`,
`verificationStatus?: 'verified' | 'pending' | 'rejected'`, `editable?: boolean`,
`onEdit?: () => void`, `className`.

| `size` | Avatar class       | Badge icon size |
| ------ | ------------------ | --------------- |
| `sm`   | `size-8` (32 px)   | 12 px           |
| `md`   | `size-10` (40 px)  | 14 px           |
| `lg`   | `size-20` (80 px)  | 20 px           |
| `xl`   | `size-32` (128 px) | 24 px           |

---

### `StatStrip` 🔨 to build

**File**: `src/components/stat-strip.tsx`

Three-column row of key-value stats. Used in footballer detail hero and dashboard sidebar.

```tsx
<StatStrip
  stats={[
    { label: 'ასაკი', value: '23' },
    { label: 'სიმაღლე', value: '182 სმ' },
    { label: 'ტრ. სეზ.', value: '6' },
  ]}
/>
```

Layout: `grid grid-cols-3 divide-x divide-border text-center`. Each cell: value in
`.text-title`, label in `.text-caption text-muted-foreground`. Skeleton: `<SkeletonStatStrip />`.

Props: `stats: { label: string; value: string }[]` (exactly 3 items), `className`.

---

### `FootballerCard` 🔨 to build

**File**: `src/components/footballer-card.tsx`

Profile card displayed in the directory grid and shortlist.

```tsx
<FootballerCard
  id="abc123"
  name="გიორგი მამუკელაშვილი"
  position="CM"
  nationality="GEO"
  age={23}
  height={182}
  photoUrl={url}
  verificationStatus="verified"
  isSaved={false}
  onSaveToggle={handleSave}
/>
```

**Visual anatomy** (compact card, `rounded-xl shadow-sm`):

```
┌────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░  │  ← photo (aspect-ratio 3/4, rounded-t-xl)
│                            │
│  ● CM   GEO    [★ save]   │  ← chips row, shortlist button ghost
│  სახელი გვარი (.text-title)│
│  23 · 182 სმ (.text-caption muted)
│  [ვრცლად →]               │  ← ghost button bottom-right
└────────────────────────────┘
```

Hover: `shadow-md` transition 150 ms. Focus-visible: `ring-2 ring-ring`.
Loading: `<SkeletonCard />`. The entire card links to `/directory/[id]`.

Props: `id`, `name`, `position`, `nationality`, `age?`, `height?`, `photoUrl?`,
`verificationStatus`, `isSaved`, `onSaveToggle`, `className`.
`onSaveToggle` receives `(id: string, saved: boolean)`.

---

### `ClubCard` 🔨 to build

**File**: `src/components/club-card.tsx`

Club tile used in subscription lists and club browsing.

```tsx
<ClubCard
  id="club1"
  name="FC კლუბი"
  city="თბილისი"
  country="GEO"
  logoUrl={url}
  verificationStatus="verified"
  isSubscribed={false}
  onSubscribeToggle={handleSubscribe}
/>
```

Layout: compact card (`rounded-lg p-4`) with `<Avatar rounded-md size-12>` left of
name + city/country meta. Subscribe toggle: `Button variant=ghost size=icon` with
`StarIcon` (filled when subscribed, `text-primary`). Whole card links to `/clubs/[id]`.

Props: `id`, `name`, `city?`, `country`, `logoUrl?`, `verificationStatus`,
`isSubscribed`, `onSubscribeToggle`, `className`.

---

### `NewsfeedCard` 🔨 to build

**File**: `src/components/newsfeed-card.tsx`

Club news post in the footballer dashboard newsfeed.

```tsx
<NewsfeedCard
  clubName="FC კლუბი"
  clubLogoUrl={url}
  postedAt={new Date()}
  title="სათაური"
  excerpt="მოკლე ტექსტი…"
  imageUrl={url}
  likeCount={12}
  commentCount={3}
  isLiked={false}
  onLikeToggle={handleLike}
/>
```

Layout: compact card (`rounded-xl p-4`) with club avatar + name + relative timestamp
header; optional image (`aspect-video rounded-lg object-cover`); title (`.text-title`);
excerpt (`.text-body text-muted-foreground`, 2-line clamp); action row with
`HeartIcon` toggle + count, `MessageCircleIcon` + count.

Props: `clubName`, `clubLogoUrl?`, `postedAt: Date`, `title`, `excerpt?`, `imageUrl?`,
`likeCount`, `commentCount`, `isLiked`, `onLikeToggle`, `className`.

Relative timestamp format: `2 სთ. წინ` / `1 დ. წინ` via `Intl.RelativeTimeFormat`.

---

### `ServiceRequestRow` 🔨 to build

**File**: `src/components/service-request-row.tsx`

Single service request in the footballer dashboard and services page.

```tsx
<ServiceRequestRow id="req1" type="meal_plan" status="pending" requestedAt={new Date()} />
```

Layout: `flex items-center justify-between px-4 py-3 border-b border-border`.
Left: service icon (16 px) + `.text-body` service name. Right: `<StatusPill />` + date
(`.text-caption text-muted-foreground`).

Props: `id`, `type: 'meal_plan' | 'personal_trainer' | 'team_doctor' | 'other'`,
`status: 'pending' | 'approved' | 'rejected'`, `requestedAt: Date`, `className`.

Icon mapping:

| `type`             | Icon                  |
| ------------------ | --------------------- |
| `meal_plan`        | `MealPlanIcon`        |
| `personal_trainer` | `PersonalTrainerIcon` |
| `team_doctor`      | `TeamDoctorIcon`      |
| `other`            | `OtherServicesIcon`   |

---

### `ChatBubble` 🔨 to build

**File**: `src/components/chat-bubble.tsx`

Single message in a conversation thread.

```tsx
<ChatBubble message="გამარჯობა!" sentAt={new Date()} direction="outgoing" status="delivered" />
```

| `direction` | Alignment     | Background   | Text                      |
| ----------- | ------------- | ------------ | ------------------------- |
| `incoming`  | `items-start` | `bg-muted`   | `text-foreground`         |
| `outgoing`  | `items-end`   | `bg-primary` | `text-primary-foreground` |

Bubble: `max-w-[75%] rounded-2xl px-4 py-2.5`. Outgoing corners: `rounded-br-sm`.
Incoming corners: `rounded-bl-sm`. Timestamp: `.text-caption` below bubble, right-aligned.
Incoming: club logo `<Avatar size-6>` to the left. Outgoing: no avatar.

Status icons (outgoing only, 12 px, `text-primary-foreground/70`):

- `sent`: single `CheckCircleIcon`
- `delivered`: double `CheckCircleIcon`
- `read`: double `CheckCircleIcon text-primary-foreground`

Props: `message`, `sentAt: Date`, `direction: 'incoming' | 'outgoing'`,
`status?: 'sent' | 'delivered' | 'read'`, `senderName?`, `senderLogoUrl?`, `className`.

---

### `ChatListItem` 🔨 to build

**File**: `src/components/chat-list-item.tsx`

Compact conversation preview row in the chat sidebar / chat list.

```tsx
<ChatListItem
  conversationId="conv1"
  name="FC კლუბი"
  avatarUrl={url}
  lastMessage="ვნახოთ თქვენი CV"
  lastMessageAt={new Date()}
  unreadCount={2}
  isActive={false}
/>
```

Layout: `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer`. Active state:
`bg-accent`. Hover: `hover:bg-muted`. Club avatar `size-10 rounded-md`. Right side:
name (`.text-body font-medium`), last message preview (`.text-caption text-muted-foreground`
2-line clamp), timestamp (`.text-caption text-muted-foreground`). Unread count badge:
`size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold`.

Props: `conversationId`, `name`, `avatarUrl?`, `lastMessage?`, `lastMessageAt?`,
`unreadCount`, `isActive`, `onClick`, `className`.

---

### `AdminQueueRow` 🔨 to build

**File**: `src/components/admin-queue-row.tsx`

Table row in the admin verification queue.

```tsx
<AdminQueueRow
  userId="u1"
  name="გიორგი კ."
  role="footballer"
  submittedAt={new Date()}
  cvUrl="/files/cv.pdf"
  photoUrl={url}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

Layout: `<tr>` with cells: avatar + name, role badge, submitted date, CV link, actions.
Actions: `Button variant=default size=sm` "დადასტ." + `Button variant=destructive size=sm`
"უარყ.". Clicking "უარყ." opens a `<Dialog>` to capture rejection reason.

Props: `userId`, `name`, `role: 'footballer' | 'club'`, `submittedAt: Date`, `cvUrl?`,
`photoUrl?`, `onApprove: (id: string) => void`, `onReject: (id: string, reason: string) => void`,
`className`.

---

## Layer 4 — Composite / Layout

### `AppShell` 🔨 to build

**File**: `src/components/app-shell.tsx`

Authenticated layout wrapper. Composes `<SiteHeader>` (authenticated variant) +
`<AppSidebar>` + `<main>`.

```tsx
<AppShell role="footballer" currentPath="/dashboard">
  {children}
</AppShell>
```

Desktop: `flex min-h-screen`. Sidebar `w-[264px]`. Main `flex-1 overflow-auto`.
Mobile: sidebar hidden, `<MobileNavDrawer>` triggered from header.

Props: `role: 'footballer' | 'club' | 'admin'`, `currentPath: string`,
`user: { name: string; image?: string; initials: string; verificationStatus }`,
`children: ReactNode`.

---

### `AppSidebar` 🔨 to build

**File**: `src/components/app-sidebar.tsx`

`bg-card border-r border-border w-[264px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto`.
Outer padding `px-4 py-6`. Groups separated by `divider + text-overline heading`.

**Footballer variant** sections:

1. **Profile block**: `<ProfileAvatar size="lg">`, name (`.text-title`), position · nationality
   (`.text-caption muted`), `<Progress>` bar (profile completion %), `[პროფ. რედ.]` +
   `[CV ჩამოტვ.]` buttons.

2. **Quick actions**: ghost nav links with icons — `+ სერვ. მოთხ.`, `კლუბების ძიება`,
   `ჩატები` (badge if unread).

3. **Stats**: three `icon + value + label` rows (views, saves, messages).

**Club variant** sections:

1. **Club block**: club logo + name + city.
2. **Quick actions**: `+ გამოქვ.`, `Directory`, `ჩატები`.
3. **Shortlist count**.

Active nav row: `bg-accent text-accent-foreground rounded-md` + 2-px `bg-primary`
indicator bar on left edge.

Props: `role: 'footballer' | 'club'`, `currentPath`, `user`, `stats?`.

---

### `MobileNavDrawer` 🔨 to build

**File**: `src/components/mobile-nav-drawer.tsx`

`<Sheet side="right" className="w-[320px]">`. Structure: `<Logo size="md">` + `<CloseIcon>`
at top; nav links stacked at `.text-title` with `py-4 px-6` each; auth / profile CTAs
pinned to bottom. Active link: `text-primary font-semibold`.

Props: `role: 'public' | 'footballer' | 'club' | 'admin'`, `currentPath`, `open`,
`onOpenChange`, `user?`.

---

### `ProfileCompletionBanner` 🔨 to build

**File**: `src/components/profile-completion-banner.tsx`

Dismissible banner prompting the user to complete their profile. Banner variant card
(`bg-secondary text-secondary-foreground rounded-lg p-4`).

```tsx
<ProfileCompletionBanner percent={70} onDismiss={handleDismiss} />
```

Shows: description text + `<Progress value={percent} className="h-2 mt-2">` + CTA
`Button variant=default size=sm` "პროფ. დასრულება →". Closes via `<CloseIcon>` (top-right
ghost button). Hidden when `percent === 100` or user has dismissed.

Props: `percent: number` (0–100), `missingFields?: string[]`, `onComplete: () => void`,
`onDismiss: () => void`, `className`.

---

### `DirectoryFilterBar` 🔨 to build

**File**: `src/components/directory-filter-bar.tsx`

Sidebar-column filter panel for the footballer directory. Desktop: sticky left column
`w-[320px]`; mobile: `<Sheet side="bottom">` full-width.

**Filter groups** (each with `.text-overline` heading):

| Group         | Component                                             | Notes                         |
| ------------- | ----------------------------------------------------- | ----------------------------- |
| POSITION      | `<PositionChip>` grid (4 cols)                        | Multi-select                  |
| AGE           | `<NumberInput min={14} max={60}>` pair + `<Slider>`   | range                         |
| HEIGHT (სმ)   | `<NumberInput min={140} max={220}>` pair + `<Slider>` | range                         |
| WEIGHT (კგ)   | `<NumberInput min={40} max={130}>` pair + `<Slider>`  | range                         |
| DOMINANT FOOT | `<RadioGroup>` 4 options                              | ყველა / მარჯ. / მარც. / ორივე |
| NATIONALITY   | `<ComboboxField>`                                     | search-as-you-type            |
| CITY          | `<ComboboxField>`                                     | —                             |
| EXPERIENCE    | `<Checkbox>` × 3                                      | პროფ. / ნახ. / სამოყვ.        |

Footer: `[ფილტ. გასუფ.] variant=outline` + `[გამოყ. ▸] variant=default` sticky inside
scroll container. "გასუფ." disabled when no active filters.

Filter state is serialised to URL `searchParams`:
`?pos=CM,ST&ageMin=18&ageMax=26&foot=R&nat=GEO…`

Props: `filters: DirectoryFilters`, `onFiltersChange: (f: DirectoryFilters) => void`,
`onApply: () => void`, `onReset: () => void`, `isOpen?: boolean`,
`onOpenChange?: (open: boolean) => void` (mobile sheet).

```ts
type DirectoryFilters = {
  positions: string[];
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  foot?: 'left' | 'right' | 'both' | 'all';
  nationality?: string;
  city?: string;
  experience?: ('professional' | 'semi' | 'amateur')[];
};
```

---

## Site-level shell components

### `SiteHeader` ✅ (public)

**File**: `src/components/site-header.tsx`

Public header for landing, auth, onboarding. Height `h-14 md:h-16`. Sticky top with
`bg-background/80 backdrop-blur border-b border-border`. Left: `<Logo size="md">`.
Right: `[შესვლა] variant=ghost` + `[რეგისტრაცია] variant=default`.

Needs update in T3 to accept an `authenticated` prop that switches to the
authenticated variant (centre nav + `<NotificationsBell>` + `<UserMenu>`).

### `SiteFooter` ✅

**File**: `src/components/site-footer.tsx`

Public footer. `bg-muted border-t border-border`. Content: copyright, nav links
(About, Privacy, Terms), social icons. Used only on public pages — authenticated
dashboards have no footer.

---

## Component naming conventions

- **PascalCase** for all React components.
- File names match the export: `footballer-card.tsx` exports `FootballerCard`.
- shadcn primitives live in `src/components/ui/`. Custom components live in
  `src/components/`.
- Use `cn()` from `@/lib/utils` for conditional class merging — never template literals
  or manual string concatenation.
- Prop names matching shadcn: `variant`, `size`, `asChild`, `className`. No custom
  aliases like `type=` for button variants.
- Boolean props: `disabled`, `loading`, `editable`, `selected` — avoid `isDisabled`,
  `isLoading` (HTML attribute style).

---

## Accessibility rules

- All icon-only interactive elements have `aria-label`.
- Custom icons are `aria-hidden="true" focusable="false"` by default (already in icons.tsx).
- Modals (`<Dialog>`, `<Sheet>`) manage focus trap and restore focus on close (Radix handles).
- Colour alone never conveys status — always pair with icon or text.
- Inputs get `id` + `<label htmlFor>` pairs; never `placeholder` as the only label.
- `PositionChip` when used as a toggle: `role="checkbox" aria-checked={selected}`.
- Respect `prefers-reduced-motion`: animation durations drop to 0, only opacity/colour
  transitions remain. Tailwind `motion-safe:` / `motion-reduce:` utilities.

---

## Install checklist for T3

Before implementing any screen, run the following to ensure all primitive
dependencies are available:

```bash
npx shadcn@latest add avatar badge dialog sheet select textarea checkbox radio-group progress slider tabs tooltip dropdown-menu
```

Then verify `src/components/ui/` contains the new files and that `globals.css`
was not overwritten (shadcn may prompt — always choose **not** to overwrite the
theme block).

---

## Adding new components

1. Check `src/components/ui/` — shadcn may already ship it.
2. Check `@/components/icons` — domain shapes are there.
3. If genuinely new: add a section to **this file** first (specify props API and
   anatomy), then implement the React component, then add an instance on the
   `design/mockups/00-style-foundation.md` foundation page.
4. Never embed a one-off solution directly in a screen — extract it to this catalog first.
