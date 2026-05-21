# 05 — Footballer Profile Edit · Hi-Fi Spec

> Pairs with [wireframes/05-footballer-profile.md](../wireframes/05-footballer-profile.md).

**Route**: `/profile/edit` (FOOTBALLER role) · authenticated.

---

## Layout

Two-pane like the dashboard. Sidebar shows section navigation + visibility / status. Main area is a long vertical stack of editable sections, each with its own save button.

```
┌──────────────────────────────────────────────────────┐
│  Header                                               │
├────────────┬─────────────────────────────────────────┤
│  Sidebar   │  Main                                    │
│  264 px    │  max-w-[800px] py-8                       │
└────────────┴─────────────────────────────────────────┘
```

Mobile collapses into a `<Tabs>` layout — see "Mobile" below.

---

## Sidebar

### Section nav

`.text-overline text-muted-foreground` heading "სექციები" + divider.

Stacked nav rows (`Button variant=ghost size=sm justify-start w-full`) — clicking scrolls to that section with `scroll-margin-top: 6rem`:

| Row              | Icon               |
| ---------------- | ------------------ |
| პირადი ინფ.      | `<UserIcon />`     |
| სპ. ინფ.         | `<JerseyIcon />`   |
| ფოტო გალერეა     | `<ImageIcon />`    |
| ვიდეოები         | `<VideoIcon />`    |
| კარიერის ისტ.    | `<CalendarIcon />` |
| სერვ. მოთხოვნები | `<MealPlanIcon />` |
| ანგ. პარამეტრები | `<SettingsIcon />` |

Active section: `bg-accent text-accent-foreground` + 2-px primary indicator bar on the left.

### Visibility toggle

```
.text-overline "ხილვადობა"
─────────────────────────
[●] პროფ. ხილვ. კლუბებში
```

shadcn `<Switch>` paired with `.text-body` label. Helper `.text-caption text-muted-foreground` "OFF → directory-დან გაქრებიხარ".

### Verification status ⚑A

```
.text-overline "სტატუსი"
─────────────────────────
✓ Verified
```

Uses `VerifiedBadge` foundation component. Pending shows `PendingBadgeIcon` + "⏳ მოლოდინში · 24-48 სთ". Rejected shows `XCircleIcon` + "✕ უარყოფილია" with `Button variant=link size=sm` "მიზეზის ნახვა" → dialog with admin's note + a "re-submit" CTA.

---

## Main — section pattern

Every editable section follows the same anatomy:

```
.text-overline "PERSONAL INFO"
─────────────────────────────────
┌─────────────────────────────────────────────┐
│  (form fields per section)                  │
│                                             │
│  ──────────────────────────  [შენახვა]      │
└─────────────────────────────────────────────┘
```

- Outer container: `bg-card border-border rounded-xl shadow-sm p-6`.
- Save button: bottom-right `Button size=sm` "შენახვა"; disabled until form dirty + valid; shows `SpinnerIcon` while submitting.
- Success: toast `<CheckCircleIcon className=text-success /> "ცვლილებები შენახულია"`.
- Failure: inline `<Alert variant=destructive>` above the save row.

Section gap on desktop: `space-y-8`.

---

## Personal info section

### Avatar row

```
┌─────┐
│ ▓▓▓ │  [ავატარის ცვლილება]   JPG / PNG · < 5 MB
│size-20│
└─────┘
```

Click-to-upload `<Button variant=outline size=sm>` next to a `size-20 rounded-full` avatar preview. Hover overlay on the avatar shows `<CameraIcon size={20} />`.

### Form grid (same as onboarding Step 1)

Two columns desktop, single column mobile. Fields:

| Field          | Notes                                                 |
| -------------- | ----------------------------------------------------- |
| სახელი ★       | min 2                                                 |
| გვარი ★        | min 2                                                 |
| დაბ. თარიღი ★  | date input                                            |
| ეროვნება ★     | combobox                                              |
| ქალაქი ★       | text                                                  |
| ქვეყანა ★      | combobox                                              |
| ტელეფონი       | optional                                              |
| წინა მისამართი | optional (only shown on profile edit, not onboarding) |
| ბიო (max 500)  | textarea, char count                                  |

---

## Sport info section

Identical to onboarding Step 2 with two additions:

- **Career history** is moved out of this section into its own "Career" block (below).
- The position chips remember selections across the form lifecycle (controlled state).

---

## Photo gallery section

`grid grid-cols-4 gap-2` desktop, `grid-cols-3` mobile. Tile size `aspect-square rounded-md overflow-hidden`.

- Filled tile:
  - Image `object-cover`.
  - Top-right `<Button variant=destructive size=icon className="absolute top-1 right-1 size-7">` with `<CloseIcon size={14} />`.
  - Hover: scale-105 transform + `outline outline-2 outline-primary`.
  - Drag-to-reorder cursor.
- Add tile: dashed border, `<PlusIcon size={20} />` + label "ფოტოს დამატება". Disabled when 8 reached.

Counter `.text-caption text-muted-foreground` "3 / 8 ფოტო" bottom-left of the grid.

---

## Video links section

Stacked rows; each row:

```
┌─ row ────────────────────────────────────────┐
│ {YouTube / Vimeo URL}                  [×]   │
│ ░░ embed preview (aspect-video) ░░░░░░░     │
└──────────────────────────────────────────────┘
```

- `<Input>` with leading `<VideoIcon size={16} />` inside.
- `<Button variant=ghost size=icon>` `<CloseIcon />` to remove.
- Embed preview appears once the URL parses. Uses the real `<iframe>` at `aspect-video`.

Add: `Button variant=outline size=sm` "+ ვიდეოს დამატება" with `<PlusIcon size={14} />`. Disabled at 3 entries.

---

## Career history section

Each career entry row:

```
· FC Dinamo Tbilisi    2022 – 2024    CM    [✏]  [×]
```

- Row container: `flex items-center gap-3 py-2 border-b border-border last:border-0`.
- Dot bullet: `size-1.5 rounded-full bg-primary`.
- Club name: `.text-body font-medium`.
- Years: `.text-caption text-muted-foreground tabular-nums`.
- Position chip: `PositionChip` (foundation).
- Edit / delete: `Button variant=ghost size=icon` icons.

Empty state: `<EmptyState>` inline with icon `<CalendarIcon size={48} />` + "კარიერა ცარიელია" + CTA "+ კლუბის დამატება".

Add CTA: `Button size=sm variant=outline` "+ კლუბის / გუნდის დამატება" with `<PlusIcon size={14} />`. Opens dialog with fields: club name, start year, end year, position chip picker.

---

## Mobile layout

`<Tabs>` along the top with horizontally scrollable section labels:

```
[პირადი] [სპორტ.] [გალერეა] [ვიდეო] [კარიერა]
```

- `<TabsList className="overflow-x-auto sticky top-16 bg-background z-10 border-b">`.
- Each `<TabsContent>` is one of the sections above.
- Active tab: underline `decoration-2 decoration-primary` + `text-foreground`.
- Save button per section becomes `w-full size=lg` on mobile.

Sidebar metadata (visibility toggle, verification status) moves to a top strip:

```
┌────────────────────────────────────────┐
│  Visibility: [●] ON                     │
│  Status: ✓ Verified                     │
└────────────────────────────────────────┘
```

---

## Empty / loading / error per section

| Section | Empty trigger | Empty state                                       |
| ------- | ------------- | ------------------------------------------------- |
| Gallery | 0 photos      | Empty tile grid + CTA on the add tile only        |
| Videos  | 0 links       | Single row with placeholder + "+ ვიდეო" CTA       |
| Career  | 0 entries     | `<EmptyState>` inline (see above)                 |
| Other   | n/a           | Sections render with empty fields ready for input |

Loading on first paint: each section is a `<SkeletonCard />`.
Error from save: inline `<Alert variant=destructive>` above the save row, with retry guidance.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A   | Verification badge in sidebar always reflects current status; rejected reason opens in a dialog (`<Dialog>`) with the admin's note. |
| B   | Gallery supports drag-to-reorder; first photo becomes the profile cover. Delete shows `<Dialog>` confirm with destructive accent.   |
| C   | Each section saves independently (optimistic UI + toast). No full-page submit button.                                               |
| D   | Account settings (email, password change, delete account) live at `/account/settings`, linked from the sidebar bottom.              |
| E   | Profile visibility toggle hides the footballer from the club directory but keeps the profile URL accessible.                        |
| F   | Mobile uses `<Tabs>` instead of long scroll. Tabs are swipeable via touch (CSS scroll-snap; no JS).                                 |
