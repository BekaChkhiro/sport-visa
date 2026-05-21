# 13 — Admin Panel · Hi-Fi Spec

> Pairs with [wireframes/13-admin.md](../wireframes/13-admin.md).

**Route**: `/admin` (ADMIN role only) · authenticated. Desktop-first; mobile
provides read + approve/reject access only.

---

## Layout

Single-column with a top tab bar — admin work is task-oriented, no sidebar.

```
┌──────────────────────────────────────────────────────┐
│  Header (admin nav)                                   │
│  [▓ logo]  [Verif.] [სერვ. მოთხ.] [მომხ.] [Ref. Data] │
│                                          [▓ admin ▾] │
├──────────────────────────────────────────────────────┤
│  Content (max-w-[1120px] mx-auto px-6 py-8)           │
└──────────────────────────────────────────────────────┘
```

Header uses the same `h-16 glass` chrome. Active nav link gets the underlined `text-primary` treatment.

---

## Verification queue tab

### Page heading

```
.text-headline "ვერიფიკაციის რიგი"

[ფეხბურთელი (14)]   [კლუბი (3)]
```

Sub-tabs use shadcn `<Tabs>` styled as pills:

- `TabsList bg-muted rounded-full p-1`.
- `TabsTrigger px-4 py-1.5 rounded-full text-body data-[state=active]:bg-card data-[state=active]:shadow-sm`.
- Count badge inline: `.text-caption text-muted-foreground` "(14)".

### Filter / search row

```
[🔍 სახელი / ელ.ფ.]            SORT: [შემოს. თარ. ↑ ▾]
```

- `<Input>` full-width on mobile, `max-w-[320px]` desktop with leading `<SearchIcon size={16} />`.
- `<Select>` sort to the right.

### Queue list

`bg-card border-border rounded-xl divide-y` with each `VerificationQueueRow`:

```
┌─ row ──────────────────────────────────────────────────────┐
│  ▓ size-12   სახელი გვარი            user@email.ge  ⏳ Pending│
│              CM · 26 წ · GEO         შემოს.: 2026-05-18      │
│                                                              │
│              [პროფ. ნახვა ↗]    [✓ დადასტურება]  [✕ უარყოფა]│
└──────────────────────────────────────────────────────────────┘
```

- Row: `flex items-start gap-4 p-5`.
- Avatar `size-12`. Verification status pill aligned top-right.
- Name `.text-body font-medium`. Email `.text-caption text-muted-foreground`.
- Meta line `.text-caption text-muted-foreground`.
- Submission date `.text-caption text-muted-foreground tabular-nums`.
- Action row aligned right (`mt-3 flex gap-2`):
  - `Button variant=outline size=sm` "პროფ. ნახვა" with trailing `<ExternalLinkIcon size={12} />` — opens profile in new tab.
  - `Button size=sm` "დადასტურება" with leading `<CheckIcon size={14} />`.
  - `Button variant=destructive size=sm` "უარყოფა" with leading `<CloseIcon size={14} />`.

### Pagination

Centred shadcn `<Pagination>` below the list.

### Rejection modal ⚑D

shadcn `<AlertDialog>` (`max-w-[480px]`):

```
# უარყოფის მიზეზი

(●) პროფ. სრულყოფ. არ არის
( ) ყალბი ინფ. (ან ეჭვი)
( ) ფოტო არასწორი (ან ეჭვი)
( ) სხვა (ჩაწერე ქვემოთ)

{დამატებითი კომენტარი (გამოგზავნება ელ.ფ-ში)}
[counter: 0 / 500]

[გაუქმება]                      [უარყოფის გაგზავნა]
```

- `<RadioGroup>` for reasons (max 1 selection).
- `<Textarea>` for the optional comment with char counter.
- Footer: secondary "გაუქმება" + destructive "უარყოფის გაგზავნა" (loading spinner on submit). Disabled until a reason is selected.

---

## Service requests tab

### Heading + filter chips

```
.text-headline "სერვ. მოთხოვნები"

[ყველა]  [⏳ ახ. (8)]  [✓ დადასტ.]  [✕ უარყ.]
```

Filter pills `<ToggleGroup>` with one active at a time. Counts visible inline.

### List rows

`ServiceRequestRow`:

```
┌─ row ──────────────────────────────────────────────────────┐
│  SR-2026-0042   კვება   ·   ი. ბაქრ.        2026-05-18       │
│  ⏳ ახ.          user@email.ge                                │
│                                                              │
│  [პროფ. ნახვა ↗]   [✓ ჩამოყრა]   [✕ უარყოფა]   [💬 კომენტ.] │
└──────────────────────────────────────────────────────────────┘
```

- Container shape: same `bg-card divide-y` as the verification queue.
- ID `.text-caption tabular-nums text-muted-foreground`.
- Service type chip: `bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 .text-caption`.
- Footballer name links to detail page.
- Status pill via `StatusPill`.
- Action buttons mirror verification queue pattern (✓ = resolve, ✕ = reject, 💬 opens comment dialog to write a note that goes to footballer).

### Detail drawer ⚑

Clicking the request ID opens a `<Sheet side="right">` with the full request body (notes, dietary restrictions, contact pref). Action buttons inside the drawer mirror the row's actions.

---

## User management tab

### Heading + filter row

```
.text-headline "მომხმარებლების მართვა"

[🔍 ელ.ფ. / სახელი]                  [ROLE: ყველა ▾]
```

### Table (desktop) ⚑

shadcn `<Table>` with these columns:

| Col          | Width | Notes                                      |
| ------------ | ----- | ------------------------------------------ |
| სახელი გვარი | 30%   | Avatar `size-8` + name + email below       |
| Role         | 12%   | `Badge` (footballer / club / admin)        |
| სტატუსი      | 18%   | StatusPill: ✓ VER. / ⏳ PEND. / ⛔ BLOCKED |
| შემოს.       | 16%   | tabular-nums date                          |
| ბოლო შესვლა  | 12%   | tabular-nums relative                      |
| მოქმედებები  | 12%   | `<DropdownMenu>` trigger                   |

Action menu (`<DropdownMenuItem>` entries):

- `<EyeIcon /> პროფილის ნახვა` → opens profile in new tab
- `<LockIcon /> ბლოკი` → confirms via `<AlertDialog>`
- `<RefreshIcon /> ბლოკის გაუქმება` (visible only if blocked)
- `<DeleteIcon className="text-destructive" /> წაშლა` → destructive `<AlertDialog>` (GDPR) ⚑F

### Mobile (read-only cards)

```
┌── card ─────────────────────────────────┐
│  ▓ ი. ბ.        FOOTBALLER  ✓ VER.       │
│  i@e.ge                                  │
│  შემოს.: 2026-04-12 · ბოლო: 1 დ. წ.      │
│  [⋯ მენიუ]                                │
└──────────────────────────────────────────┘
```

Cards stack with `space-y-3`; action dropdown collapses into the `<MoreVerticalIcon />` trigger.

---

## Reference data tab ⚑G

Not in the original wireframe; sketch only. Simple CRUD interface for:

- Positions (GK, CB, …) — full Georgian name + short code.
- Nationalities — list of country codes with Georgian names.
- Leagues — list per country.

Layout: left pane = type picker (`<Tabs orientation=vertical>`); right pane = `<Table>` with inline edit + add row button.

---

## Approve / reject side effects (visual feedback)

- On `✓ დადასტურება`: row collapses with a 200 ms transition, success toast `<CheckCircleIcon className="text-success" /> "მომხ. დადასტ. — ელ.ფ. გაიგზავნა"`.
- On rejection submit: row collapses, toast `<XCircleIcon className="text-destructive" /> "მომხ. უარყოფილია — ელ.ფ. გაიგზავნა"`.
- Optimistic UI: row state updates immediately; on server error, row reappears with `<Alert variant=destructive>` "მოქმედება ვერ შესრულდა — ცადე ისევ".

---

## States

| State                  | Treatment                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Loading queue          | 5 × `<SkeletonListItem className="h-24" />`                                                                                 |
| Empty queue            | `<EmptyState icon={<CheckCircleIcon size={48} />} title="რიგი ცარიელია" description="ყველა მომხ. დადასტ./უარყოფ." />`       |
| Empty service requests | `<EmptyState icon={<MealPlanIcon size={48} />} title="მოთხოვნა არ არსებობს" description="ფეხბ. ჯერ არ მოითხოვა სერვისი" />` |
| Empty user search      | `<EmptyState icon={<SearchIcon size={48} />} title="მომხ. ვერ მოიძებნა" />`                                                 |
| Error                  | Section-level `<ErrorState variant=inline>` with retry                                                                      |

---

## Mobile adaptations ⚑H

- Header nav collapses to drawer.
- Verification queue: row card variant — actions row is wider, action buttons get `size=lg` and `flex-1` so they stretch evenly (`grid grid-cols-3 gap-2`).
- Rejection modal: full-screen `<Sheet side="bottom" className="h-[90vh] rounded-t-xl">` instead of dialog.
- User management: card list (above). No table.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| A   | Tab pills show count badges. Footballer queue is default since it's larger.                                                  |
| B   | Profile view opens in new tab so the admin can inspect side-by-side with the queue.                                          |
| C   | Approve action: sets user status to VERIFIED + triggers Resend confirmation email.                                           |
| D   | Reject action: opens the modal per spec above; sends Resend email with reason. User can re-submit after fixing.              |
| E   | Service request "ჩამოყრა" marks request resolved; triggers Resend notification to the footballer.                            |
| F   | Block / unblock: reversible. Delete: permanent (GDPR) — destructive `<AlertDialog>` with typed-confirm safety.               |
| G   | Ref. data tab: simple CRUD for positions / nationalities / leagues used in dropdowns across the product.                     |
| H   | Admin panel is desktop-first; mobile gives read/approve/reject access with larger touch targets — but no table-wide editing. |
