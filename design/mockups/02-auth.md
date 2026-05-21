# 02 — Authentication · Hi-Fi Spec

> Pairs with [wireframes/02-auth.md](../wireframes/02-auth.md).

**Routes**: `/auth/signup`, `/auth/signin`, `/auth/reset` · public (signed-in users
are redirected by middleware).

---

## Page shell (all three views)

- Header: same `h-16` glass header as landing — logo left, contextual link right.
- Background: `bg-muted/40` to push the form card forward.
- Container: vertically centred, `min-h-[calc(100vh-4rem)]`, `grid place-items-center`, `px-4`.
- Form card: `max-w-[480px] w-full bg-card border-border rounded-xl shadow-sm p-6 lg:p-8`.

### Header right slot (contextual)

| View           | Right slot copy + button                                              |
| -------------- | --------------------------------------------------------------------- |
| `/auth/signup` | "უკვე გაქვს?" + `Button variant=outline size=sm` "შესვლა"             |
| `/auth/signin` | "ანგარიში არ გაქვს?" + `Button variant=outline size=sm` "რეგისტრაცია" |
| `/auth/reset`  | (no link — full-page focus on reset)                                  |

---

## Sign Up

### Card heading

`.text-headline` "Sport Visa-ში რეგისტრაცია" + `.text-body text-muted-foreground` "შენი როლი არჩიე".

### Role selector ⚑A

Two large radio cards in a `grid grid-cols-2 gap-3`. Each card:

```
┌─────────────────────┐
│  ▓  (40-px icon)    │   ← bg-secondary rounded-md p-3, icon text-primary
│                     │
│  ფეხბურთელი          │   ← .text-title
│  მოთამაშე-ს როლი    │   ← .text-caption text-muted-foreground
└─────────────────────┘
```

- Unselected: `border-input bg-card hover:border-primary/40`.
- Selected: `border-primary ring-2 ring-primary/30 bg-primary/5`.
- Icons: footballer = `JerseyIcon`; club = `ShieldIcon`.
- Pre-selected if `?role=footballer` or `?role=club` query param set.

### Form fields (in order, `space-y-4`)

| Field            | Component                              | Validation                       |
| ---------------- | -------------------------------------- | -------------------------------- |
| `სახელი ★`       | `<Input>`                              | min 2 chars                      |
| `გვარი ★`        | `<Input>`                              | min 2 chars                      |
| `ელ. ფოსტა ★`    | `<Input type=email>`                   | RFC-5321 regex; trim + lowercase |
| `პაროლი ★`       | `<PasswordInput>` (Input + eye toggle) | min 8 chars, ≥ 1 number          |
| `პაროლის დად. ★` | `<PasswordInput>`                      | must match password              |

`<PasswordInput>` shows `<EyeIcon size={16} />` / `<EyeOffIcon size={16} />` toggle inside the trailing slot — `Button variant=ghost size=icon`.

### Terms checkbox ⚑B

shadcn `<Checkbox>` + label. Required to enable submit. Label: "ვეთანხმები [წესებს](/terms)" — the link opens in a new tab and is `text-primary underline`.

### Primary CTA

`<Button type=submit size=lg w-full>` "რეგისტრაცია" — disabled until form is valid and terms checked. Loading state shows `<SpinnerIcon size={16} />`.

### Divider

`<div className="flex items-center gap-3"><Separator className="flex-1" /><span className="text-caption text-muted-foreground">ან</span><Separator className="flex-1" /></div>`

### Google sign-in ⚑C

`<Button variant=outline size=lg w-full disabled>` with leading Google glyph (custom SVG; size 16). Tooltip on hover: "მალე ხელმისაწვდომი".

---

## Sign In

Same shell. Fields:

| Field         | Component            |
| ------------- | -------------------- |
| `ელ. ფოსტა ★` | `<Input type=email>` |
| `პაროლი ★`    | `<PasswordInput>`    |

Right-aligned link `<a className="text-caption text-primary hover:underline">` "პაროლი დამავიწყდა?" → `/auth/reset`.

Primary CTA `<Button size=lg w-full>` "შესვლა". Same divider + Google option below.

---

## Password Reset

Two states — both in the same card, switched in place.

### State A — entry form

- Heading: `.text-headline` "პაროლის აღდგენა".
- Description: `.text-body text-muted-foreground` "ელ.ფ. შეიყვანე — გამოგვიგზავნით აღდგ. ლინკს".
- Single `<Input type=email>` field.
- CTA: `Button size=lg w-full` "გამოგვიგზავნე ლინკი".
- Below CTA: `Button variant=ghost size=sm` "← შესვლაზე დაბრუნება" (left-aligned `ArrowLeftIcon`).

### State B — confirmation

Centred content. Icon `<CheckCircleIcon size={48} className="text-success" />` (using EmptyState component with success tint).

- Title: `.text-title` "წერილი გაიგზავნა".
- Description: `.text-body text-muted-foreground` "შეამოწმე ელ. ფოსტა".
- CTA: `Button variant=ghost` "← შესვლაზე დაბრუნება".

---

## Field validation states

Per the foundation [Inputs section](00-style-foundation.md#inputs):

- **Empty / focused**: `border-ring ring-2 ring-ring ring-offset-2`.
- **Valid**: trailing `<CheckCircleIcon size={16} className="text-success" />` plus `border-success`.
- **Invalid**: `border-destructive` + helper `.text-caption text-destructive` beneath, with leading `<AlertCircleIcon size={12} />`.

Validation runs on `onBlur`; submit re-validates and scrolls to the first error.

---

## Loading / error states

| Trigger                        | Visual                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Submit in flight               | Primary button shows `<SpinnerIcon size={16} className="animate-spin" />` + disabled                                    |
| Server error (network / 5xx)   | Inline `<Alert variant=destructive>` above the form: `<AlertCircleIcon /> "სერვერთან კავშირი ვერ მოხერხდა — ცადე ისევ"` |
| Email already exists (sign-up) | Inline error under the email field: "ეს ელ.ფ. უკვე გამოყენებულია — [შესვლა](/auth/signin)?"                             |
| Wrong credentials (sign-in)    | Inline `<Alert variant=destructive>` above the form: "ელ.ფ. ან პაროლი არასწორია" — never separately confirms which      |

---

## Mobile specifics

- Card padding drops to `p-5`; max-width still 480 px but `w-full` with 16-px gutter.
- All buttons `size=lg` for 44-px touch targets.
- Role selector cards remain side-by-side on mobile (compact form is preferable to a vertical stack here).
- Password eye toggle has 44 × 44 hit area regardless of icon size.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------- |
| A   | Role pre-select via `searchParams.role` on the server component; reactive on client when query updates.                |
| B   | Terms link `target="_blank" rel="noopener"`. Checkbox required-to-submit enforced via Zod schema + disabled state.     |
| C   | Google OAuth disabled in MVP. Button retains visual identity for parity but click is no-op + tooltip.                  |
| D   | Reset email sent via Resend; token TTL 24 h. Email template lives in `lib/email/templates/password-reset.tsx`.         |
| E   | Successful sign-up → `redirect('/onboarding')` (server action). Wizard selects role from session.                      |
| F   | Successful sign-in → role-aware redirect handled by middleware. Pending verification lands at `/verification-pending`. |
