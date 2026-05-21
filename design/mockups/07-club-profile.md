# 07 — Club Profile Edit · Hi-Fi Spec

> Pairs with [wireframes/07-club-profile.md](../wireframes/07-club-profile.md).

**Route**: `/profile/edit` (CLUB role) · authenticated.

---

## Layout

Same two-pane chrome as [05 — Footballer Profile Edit](05-footballer-profile.md).
Sections differ but every section follows the same panel + save-row pattern.

Sidebar nav rows:

| Row               | Icon               |
| ----------------- | ------------------ |
| ვინაობა           | `<ShieldIcon />`   |
| მედია             | `<ImageIcon />`    |
| შემ. სია (Roster) | `<UsersIcon />`    |
| ისტ. / ბიო        | `<FileTextIcon />` |
| სტადიონის ინფ.    | `<MapPinIcon />`   |
| ანგ. პარამეტრები  | `<SettingsIcon />` |

Sidebar `Visibility` block is identical to the footballer profile (Switch + helper).
Status badge uses club verification states.

---

## Identity section

Same form-grid pattern as [Club onboarding · Step 1](03-onboarding.md#club--step-1-club-identity). Two columns desktop, single mobile.

Save row bottom-right with `Button size=sm` "შენახვა".

---

## Media section

### Logo

- Square `size-32 rounded-md` preview with `<CameraIcon />` hover overlay.
- Beside it: `Button variant=outline size=sm` "ლოგოს ცვლილება" + helper "PNG / SVG · < 2 MB · transparent".
- Validation: warns on non-square aspect.

### Cover photo

- `aspect-[16/6]` wide preview, `rounded-lg border-border`.
- Hover overlay: `bg-foreground/50` with centred `<CameraIcon size={24} />` + "ფოტოს ცვლილება".
- Helper text below: "JPG / PNG · < 10 MB · რეკ. 1920 × 720".
- Same drag-and-drop behaviour as the onboarding upload.

---

## Roster (current squad) section

Free-text roster — entries are not linked to platform accounts (per wireframe ⚑B).

### Add row

```
{მოთამაშის სახელი}    {პოზიცია [↓]}    [+ დამატება]
```

- Two inputs side-by-side + `Button size=sm` "+ დამატება".
- Position is a `<Select>` populated from the position reference list (mapped to short codes like GK / CB / ST).
- Submitting clears the inputs and prepends to the list below.

### List

`bg-card border-border rounded-md divide-y divide-border` table:

```
· ი. ბაქრ.    CM       [×]
· გ. მ.       ST       [×]
· ნ. კ.       GK       [×]
```

Row: `flex items-center gap-3 px-4 py-2`.

- Name: `.text-body flex-1`.
- Position: `PositionChip` (sm variant).
- Remove: `Button variant=ghost size=icon` `<CloseIcon size={14} />` with hover destructive tint.

Drag handle on the left (`<GripVerticalIcon />` from lucide) to reorder.

Empty state: `<EmptyState icon={<UsersIcon size={48} />} title="შემადგ. ცარიელია" description="დაამატე მოთამაშე ზემოთ" />`.

Save row at the bottom of the section.

---

## History / Bio section

### Rich text editor ⚑A

Lightweight Tiptap or Quill instance configured for:

- Bold / Italic / Underline
- Bullet list / Ordered list
- Link (inline dialog)
- No images, no media embeds inside bio

Toolbar anatomy:

```
┌──────────────────────────────────────────────────────┐
│ [B] [I] [U]  |  [•] [≡]  |  [🔗]                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  (editor content area, min-h-[240px])                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Toolbar: sticky to top of editor; `bg-muted/40 border-b border-border` divided into groups with `Separator orientation=vertical`.
- Buttons: `Button variant=ghost size=icon` 32 × 32 with 16-px icons. Active formatting: `bg-accent text-accent-foreground`.
- Editor: `bg-background border-input rounded-md p-4 min-h-[240px] focus-within:ring-2 ring-ring`.
- Counter below editor: `.text-caption text-muted-foreground` "452 / 2000".

Save row below the counter.

---

## Stadium info section

### Address + coordinates

Two-column grid:

| Field                   | Component                               |
| ----------------------- | --------------------------------------- |
| `სტადიონის მისამართი`   | `<Input>`                               |
| `Google Maps ლინ./კოო.` | `<Input>` with leading `<MapPinIcon />` |

### Map embed preview ⚑E

Below the inputs, once a valid Maps URL is entered:

- `aspect-[16/9] rounded-md overflow-hidden border-border`.
- Renders `<iframe src={derivedMapsEmbedUrl} loading="lazy" allowFullScreen />`.
- Placeholder before URL entered: greyed `bg-muted` block with centred `<MapPinIcon size={48} className="text-muted-foreground/50" />` and label "მისამართი შეიყვანე რუკის სანახ.".

Save row at the bottom.

---

## Mobile layout

`<Tabs>` strip at the top with section labels (`ვინ.`, `მედია`, `შემ.`, `ბიო`, `სტადიონი`). Each `<TabsContent>` renders one section.

Roster on mobile uses card rows instead of a horizontal table:

```
┌────────────────────────────────────┐
│  ი. ბაქრ.       CM       [×]       │
├────────────────────────────────────┤
│  გ. მ.          ST       [×]       │
└────────────────────────────────────┘
```

Rich text editor toolbar wraps to 2 rows under `sm:` (groups stack).

---

## Loading / error per section

| Section  | Loading skeleton                                                                                            | Error                                        |
| -------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Identity | 2-col `<SkeletonText />` rows                                                                               | `<ErrorState variant=inline>` above save row |
| Media    | logo placeholder `<Skeleton className="size-32" />` + cover `<Skeleton className="aspect-[16/6] w-full" />` | same                                         |
| Roster   | 3 × `<SkeletonListItem />`                                                                                  | same                                         |
| Bio      | `<SkeletonCard />`                                                                                          | toast on save failure                        |
| Stadium  | `<Skeleton aspect-[16/9] w-full />`                                                                         | inline below the field                       |

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Rich text editor is a Tiptap minimal instance, no images/embeds inside bio.                                                                 |
| B   | Roster entries are free-text in MVP — not linked to platform accounts. Phase X will introduce link-to-profile.                              |
| C   | Visibility toggle hides the club from the directory but keeps the public URL accessible. Helper text explains the difference.               |
| D   | Logo is normalised to 200 × 200 on the public profile and 40 × 40 in directory cards. Validation warns if upload is non-square.             |
| E   | Map embed uses an iframe to Google Maps with the provided coords/link, sanitised. Lazy-loaded.                                              |
| F   | Mobile uses `<Tabs>`; section nav order is identity → media → roster → bio → stadium. Settings live on `/account/settings` (separate page). |
