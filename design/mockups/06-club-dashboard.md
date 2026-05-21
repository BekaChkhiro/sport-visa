# 06 — Club Dashboard · Hi-Fi Spec

> Pairs with [wireframes/06-club-dashboard.md](../wireframes/06-club-dashboard.md).

**Route**: `/dashboard` (CLUB role) · authenticated, verified.

---

## Layout

Same two-pane chrome as the footballer dashboard. Header nav items differ:
`Dashboard` / `პროფილი` / `Directory` / `ჩატი` / `ახ. პოსტი` (news post composer).

---

## Sidebar — club profile block

```
▓▓ (size-16, rounded-md — logo, not avatar)
კლუბის სახელი (.text-title)
● ქალაქი · ● ლიგა    (.text-caption muted)

[კლუბის პროფ.]    (Button variant=outline size=sm w-full)
[+ ახ. გამოცემა]   (Button size=sm w-full · with <PlusIcon size={14} />)
```

Quick actions list mirrors footballer dashboard pattern:

| Action         | Icon                                              |
| -------------- | ------------------------------------------------- |
| `Directory ↗`  | `<SearchIcon />`                                  |
| `ჩატები`       | `<MessageCircleIcon />` (badge)                   |
| `Service req.` | `<MealPlanIcon />` (visible only if ≥ 1 incoming) |

Stats block (3 rows):

```
👁 1 200      ნახვა
★ 34          შ. სიაში
💬 8          ახ. ჩატი
```

---

## Main area

### Verification banner ⚑A

Component: `<VerificationBanner status={status} onDismiss={...} />`.

- **Verified** state (default): `<Alert variant=success>` (success-tinted, single line). Content: leading `<VerifiedBadgeIcon size={16} className="text-success" />` + "კლუბი დადასტ." + trailing `<CloseIcon />` ghost button.
- **Pending** state: `<Alert variant=warning>` two-line. Title "ვერიფიკაცია მიმდინარეობს" + body "გთხოვ წარადგინო კლუბის სარეგ. დოკ. **admin@sportvisa.ge**-ზე". CTA `Button size=sm variant=outline` "კოპირება ელ.ფ." copies the admin email.
- Dismiss persists in `localStorage` so it doesn't re-appear.

### Recent shortlist activity

Heading `.text-headline` "ბოლო shortlist აქტ.".

`ShortlistActivityCard` rows (`bg-card border-border rounded-xl shadow-sm p-5`):

```
▓ ი. ბაქრ.        CM · 182 სმ · GEO
✓ შენ მოათავსე შ. სიაში · 1 სთ წინ

[პროფ. ნახვა]   [💬 ჩატი]
```

- Avatar `size-12`. Name `.text-body font-medium`.
- Meta `.text-caption text-muted-foreground` (position · height · nationality).
- Activity line: `.text-caption text-success` with leading `<CheckCircleIcon size={12} />`. Relative timestamp.
- Actions row: `Button variant=outline size=sm` + `Button size=sm` (chat).

Stack with `space-y-3`. Show 5 most-recent, then "Directory-ის გახსნა →" link.

#### Empty state ⚑B

Replace section body with `<EmptyState>`:

- Icon: `<StarIcon size={48} />`.
- Title: "Shortlist ცარიელია".
- Description: "Directory-ში ფეხბ. ბარათზე ★ დააჭირე".
- CTA: `Button size=sm` "Directory-ის გახსნა".

### Active chats

Heading `.text-headline mt-12` "აქტიური ჩატები".

Conversation list (max 5 visible, "ყველა ჩატი ↗" link at the bottom):

```
┌─ row ──────────────────────────────────────────┐
│ ▓ ი. ბაქრ.  ● online                            │
│ "გამარჯობა, გაინტერ. ვარ..."   14:32           │
│                                                  │
│              [ჩატის გახსნა]                     │
└──────────────────────────────────────────────────┘
```

- Container: `bg-card border-border rounded-xl divide-y divide-border`.
- Each row `flex items-center gap-3 p-4`.
- Avatar `size-10` with presence dot (`size-2.5 rounded-full bg-success`) bottom-right; offline = `bg-muted-foreground`.
- Last-message preview: `text-body text-muted-foreground line-clamp-1`.
- Timestamp: `text-caption text-muted-foreground tabular-nums`.
- Unread count badge: top-right of row, `bg-primary text-primary-foreground rounded-full px-1.5 text-[10px]`.
- CTA: `Button size=sm variant=outline` "ჩატის გახსნა".

Empty state: `<EmptyState icon={<MessageCircleIcon size={48} />} title="ჩატი ჯერ არ გაქვს" description="Directory-დან ფეხბ.-ს დაუკავშირდი" action={Button "Directory-ის გახსნა"} />`.

### News posts management

Heading `.text-headline mt-12` "სიახლის პოსტები".

Post management list (`bg-card border-border rounded-xl divide-y`):

```
· "ახ. სეზონი დაიწყო!"        ❤ 12  2026-05-18    [რედ.] [წაშ.]
· "ტრავმის განახ."             ❤ 5   2026-05-16    [რედ.] [წაშ.]
```

- Each row: `flex items-center gap-3 p-4`.
- Title: `.text-body font-medium line-clamp-1 flex-1`.
- Engagement: `<HeartIcon size={14} />` + count, `.text-caption text-muted-foreground`.
- Date: `.text-caption tabular-nums`.
- Actions: `Button variant=ghost size=sm` "რედ." (`<EditIcon size={14} />`), `Button variant=ghost size=sm` "წაშ." (`<DeleteIcon size={14} />` destructive accent).

Below the list: `Button size=sm` "+ ახალი პოსტი" with `<PlusIcon size={14} />`.

Delete confirmation: shadcn `<AlertDialog>` with destructive accent.

Empty state: inline `<EmptyState icon={<FileTextIcon size={48} />} title="პოსტი არ არსებობს" description="გააზიარე სიახლე გამოწერ.-ებთან" action={Button "+ ახ. პოსტი"} />`.

---

## Mobile layout

Per wireframe:

1. **Club strip card**: logo + name + meta + edit CTA.
2. **Stats row**: 3-col compact stats.
3. **Quick actions**: 3 chips.
4. **Recent shortlist**: full-width cards.
5. **Active chats**: full-width rows.
6. **News posts**: collapsed list; "+" floats bottom-right as a `Button size=lg-icon` (FAB-style, `fixed bottom-4 right-4 rounded-full shadow-lg`).

The news-post FAB only appears on the club dashboard.

---

## Loading / error

- All three main sections render as `<SkeletonCard />` stacks until data resolves.
- Stats sidebar uses `<SkeletonStatStrip />`.
- Section-level errors use `<ErrorState variant=inline>` with section-specific copy:
  - Shortlist: "Shortlist ვერ ჩაიტვირთა".
  - Chats: "ჩატები ვერ ჩაიტვირთა".
  - News: "პოსტები ვერ ჩაიტვირთა".

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------ |
| A   | Verification banner is dismissible (verified) or persistent (pending). Pending banner has copy-email helper. |
| B   | Shortlist activity feed shows 10 most-recent. Sort by `shortlistedAt DESC`.                                  |
| C   | Active chats sorted by `lastMessageAt DESC`. Unread badge derived from `conversation.unreadCountForUser`.    |
| D   | News post manager is scoped to this dashboard. Public-facing view lives on club detail (screen 10).          |
| E   | "Services" sidebar row only renders if `incomingServiceRequests.count > 0`.                                  |
