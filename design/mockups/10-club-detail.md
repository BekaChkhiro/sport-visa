# 10 — Club Detail Page · Hi-Fi Spec

> Pairs with [wireframes/10-club-detail.md](../wireframes/10-club-detail.md).

**Route**: `/clubs/[clubId]` · authenticated (footballer or club) viewing
another club. Page itself is publicly cacheable.

---

## Layout

Single-column scroll, max-width `max-w-[1024px] mx-auto px-6 lg:px-8`. Hero at top, tabs section below, then per-tab content.

---

## Hero block

```
┌────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░  COVER PHOTO (stadium / team)  aspect-[21/9] ░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓                                                          │
│  size-24    კლუბის სახელი            ✓ Verified     [♥ გამოწ.] │
│  (logo)     ● ქალაქი · ● ლიგა · 1998 დაარს.                    │
│             👁 1 200 ნახვა · ★ 34 shortlist                    │
└────────────────────────────────────────────────────────────────┘
```

- Cover: same pattern as footballer detail. Placeholder uses `<ShieldIcon size={96} />` if no image.
- Logo: `size-24 rounded-md ring-4 ring-background -mt-12 ml-6` (square — clubs are organisations).
- Name: `.text-headline`. Meta line `.text-body text-muted-foreground` with bullet separators.
- Stats line: `.text-caption text-muted-foreground`.
- Subscribe CTA ⚑A — only visible to FOOTBALLER role:

| State           | Button                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Not subscribed  | `<Button size=lg>` with leading `<HeartIcon size={16} />` "გამოწერა"                                       |
| Subscribed      | `<Button size=lg variant=secondary>` with `<HeartIcon className="fill-current" size={16} />` "გამოწერილია" |
| Unauthenticated | Same CTA, on-click → `redirect('/auth/signin?from=/clubs/[id]')`                                           |

---

## Tabs

shadcn `<Tabs defaultValue="bio">` controlled by URL `?tab=...`.

```
┌─ TabsList (sticky top-16) ──────────────────────────────────┐
│  [ისტ. / ბიო] [შემ. სია] [სტადიონი] [სიახლეები]              │
└─────────────────────────────────────────────────────────────┘
```

- `TabsList` is `bg-background/80 backdrop-blur border-b border-border sticky top-16 z-20`.
- Each `TabsTrigger`: `px-4 py-3 text-body`. Active: `text-foreground border-b-2 border-primary`. Inactive: `text-muted-foreground hover:text-foreground`.
- Mobile: horizontally scrollable `overflow-x-auto` with `scroll-snap-x mandatory`.

---

## Bio tab (default)

Card: `bg-card border-border rounded-xl p-6 mt-6`.

- Renders the club's history/bio HTML (sanitised) inside `.prose prose-sm dark:prose-invert`.
- Empty: hide tab entirely or render placeholder paragraph "კლუბის ისტორია მალე გამოჩნდება".

### Contact card (always under bio)

```
🌐 [https://fcdila.ge ↗]
```

- Single row: leading `<GlobeIcon size={16} />` + `<a target="_blank" rel="noopener" class="text-primary hover:underline">` external link.
- If multiple contact channels (email, social), they stack with the same row pattern.

---

## Roster tab

`bg-card border-border rounded-xl divide-y`:

```
┌────────────────────────────────────────────────────────────┐
│  #     სახელი            პოზიცია                            │
├────────────────────────────────────────────────────────────┤
│  1     ი. ბაქრ.           CM       [პროფ. ↗]               │
│  9     გ. მ.              ST       [პროფ. ↗]               │
│  23    ნ. კ.              GK                                │
└────────────────────────────────────────────────────────────┘
```

- Header row `bg-muted/40 text-overline px-4 py-2`.
- Data rows `flex items-center gap-4 px-4 py-3`.
- Jersey number column: `w-12 tabular-nums text-muted-foreground`.
- Name: `.text-body font-medium flex-1`.
- Position chip.
- Profile link column ⚑B — only renders for entries linked to a verified footballer (free-text entries leave the slot empty).

Empty state: `<EmptyState icon={<UsersIcon size={48} />} title="შემადგენ. არ არსებობს" description="კლუბი ჯერ არ ავსებს roster-ს" />`.

---

## Stadium tab

```
┌── card ─────────────────────────────────────────────────────┐
│  # სტადიონის სახელი    ·    ტევადობა: 23 000 ადგ.            │
│  📍 ქალაქი, ქუჩა, რეგიონი                                    │
│                                                              │
│  ┌─ aspect-[16/9] rounded-md overflow-hidden ───────────┐   │
│  │  ░ <iframe> Google Maps ░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

- Heading row: `.text-title` left + `.text-body text-muted-foreground` capacity right (split by `·`).
- Address: `.text-body text-muted-foreground` with leading `<MapPinIcon size={16} />`.
- Map embed: lazy-loaded iframe to Google Maps using stored coords.
- Empty: hide section, show `<EmptyState>` with "სტადიონის ინფ. არ არსებობს".

---

## News tab

Stack of `NewsCard` (same component as footballer dashboard newsfeed) sorted `publishedAt DESC`.

- Pagination at the bottom (10 per page).
- Empty: `<EmptyState icon={<FileTextIcon size={48} />} title="სიახლე არ არსებობს" description="ამ კლუბმა ჯერ პოსტი არ გამოაქვეყნა" />`.

---

## States

| State          | Treatment                                                                    |
| -------------- | ---------------------------------------------------------------------------- |
| Loading hero   | `<Skeleton aspect-[21/9] />` + `<Skeleton size-24 />` overlap + 2 lines text |
| Loading tabs   | Each tab area renders 3 × `<SkeletonCard />`                                 |
| Empty roster   | inline `<EmptyState>` per spec                                               |
| Empty stadium  | inline `<EmptyState>`                                                        |
| Empty news     | inline `<EmptyState>` + (when user is the club owner) a hint to publish      |
| Error          | Tab-level `<ErrorState variant=inline>` with retry                           |
| Club not found | 404 via `notFound()`                                                         |
| Hidden club    | If visibility OFF and visitor is not the owner, 404                          |

---

## Mobile

- Cover stays full-width edge-to-edge (`mx-[-16px]`).
- Logo overlaps cover by -32 px; smaller `size-20`.
- Subscribe button moves to full-width `size=lg` below the meta block.
- `TabsList` becomes horizontally scrollable with subtle gradient fade on the right edge.
- Roster table collapses to card rows:

```
┌────────────────────────────────────┐
│  #1  ი. ბაქრ.        CM      [↗]   │
└────────────────────────────────────┘
```

Stadium map keeps `aspect-[16/9]` which adapts well to mobile width.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| A   | Subscribe CTA only visible to FOOTBALLER. Unauthenticated → sign-in redirect with `?from` param.                    |
| B   | Profile link in roster column only when entry is linked to a verified footballer account.                           |
| C   | Tabs persisted in URL via `?tab=` so deep-linking works (e.g. `/clubs/dila?tab=stadium`).                           |
| D   | Page itself is publicly visible; subscribe CTA gates on auth.                                                       |
| E   | News post detail page is Phase 7. For now post titles in the news tab link to a `#post-N` anchor on this same page. |
| F   | Mobile uses horizontally scrollable tab strip — `overflow-x-auto scroll-snap-x mandatory`.                          |
