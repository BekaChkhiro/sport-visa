# 02 — Authentication (Sign Up / Sign In)

**Routes**: `/auth/signup`, `/auth/signin`  
**Auth state**: unauthenticated only; redirects to dashboard if already signed in.  
**Goal**: Register a new user (footballer or club) or authenticate an existing one.

---

## Sign Up — Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER  [logo]                          [უკვე გაქვს? შესვლა]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│              ┌─────────────────────────────┐                 │
│              │  # Sport Visa-ში რეგ.       │                 │
│              │                             │                 │
│              │  ROLE SELECTOR ⚑A           │                 │
│              │  ┌─────────┐  ┌─────────┐   │                 │
│              │  │ ▓       │  │ ▓       │   │                 │
│              │  │ ფეხბ.   │  │ კლუბი   │   │                 │
│              │  └─────────┘  └─────────┘   │                 │
│              │                             │                 │
│              │  {სახელი ★}                 │                 │
│              │  {გვარი ★}                  │                 │
│              │  {ელ. ფოსტა ★}              │                 │
│              │  {პაროლი ★}  [👁]            │                 │
│              │  {პაროლის დად. ★}  [👁]      │                 │
│              │                             │                 │
│              │  [✓] ვეთანხმები წესებს ⚑B   │                 │
│              │                             │                 │
│              │  [რეგისტრაცია]              │                 │
│              │                             │                 │
│              │  ──── ან ────               │                 │
│              │                             │                 │
│              │  [Google-ით შესვლა] ⚑C      │                 │
│              └─────────────────────────────┘                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Sign In — Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER  [logo]                       [ანგარიში არ გაქვს?]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│              ┌─────────────────────────────┐                 │
│              │  # შესვლა                   │                 │
│              │                             │                 │
│              │  {ელ. ფოსტა ★}              │                 │
│              │  {პაროლი ★}  [👁]            │                 │
│              │                             │                 │
│              │  [პაროლი დამავიწყდა?] ⚑D    │                 │
│              │                             │                 │
│              │  [შესვლა]                   │                 │
│              │                             │                 │
│              │  ──── ან ────               │                 │
│              │                             │                 │
│              │  [Google-ით შესვლა]         │                 │
│              └─────────────────────────────┘                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Password Reset — Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER  [logo]                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│              ┌─────────────────────────────┐                 │
│              │  # პაროლის აღდგენა          │                 │
│              │                             │                 │
│              │  {ელ. ფოსტა ★}              │                 │
│              │                             │                 │
│              │  [გამოგვიგზავნე ლინკი]      │                 │
│              │                             │                 │
│              │  [← შესვლაზე დაბრუნება]     │                 │
│              └─────────────────────────────┘                 │
│                                                               │
│  ── (after submit) ──────────────────────────────────────    │
│                                                               │
│              ┌─────────────────────────────┐                 │
│              │  ✓ წერილი გაიგზავნა         │                 │
│              │  შეამოწმე ელ. ფოსტა         │                 │
│              └─────────────────────────────┘                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Validation states

```
  ┌──────────────────────────────┐
  │  {ელ. ფოსტა}                │  ← neutral / empty
  └──────────────────────────────┘
  ┌──────────────────────────────┐
  │  user@domain.com  ✓          │  ← valid (green border)
  └──────────────────────────────┘
  ┌──────────────────────────────┐
  │  not-an-email     ✕          │  ← invalid (red border)
  │  ! სწორი ფოსტა შეიყვანე     │  ← inline error beneath
  └──────────────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Role selector is pre-selected if the user arrived via `?role=footballer` or `?role=club` from the landing page CTAs.                                                             |
| B   | "Terms" link opens in a new tab. Checkbox must be checked to enable the submit button.                                                                                           |
| C   | Google OAuth is a Phase 3 enhancement (T3.x); the button is shown but disabled in MVP with a "coming soon" tooltip.                                                              |
| D   | Password reset sends a Resend email with a single-use token link (24 h TTL).                                                                                                     |
| E   | After successful sign-up, user is redirected to `/onboarding` for the role-appropriate wizard.                                                                                   |
| F   | After successful sign-in, user is redirected to their role dashboard (`/dashboard/footballer` or `/dashboard/club`). Pending-verification users land on `/verification-pending`. |
