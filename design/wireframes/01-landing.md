# 01 — Landing Page

**Route**: `/`  
**Auth state**: unauthenticated (redirects to dashboard if already signed in)  
**Goal**: Convey platform value; drive sign-up for both roles.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                       │
│  [Sport Visa logo]                    [შესვლა] [რეგისტრაცია] │
├──────────────────────────────────────────────────────────────┤
│  HERO                                                         │
│                                                               │
│  # Sport Visa                                                 │
│  ## ფეხბურთელები კლუბებს ენახებიან.                          │
│  ## კლუბები ფეხბურთელებს პოულობენ.                           │
│                                                               │
│     [ფეხბურთელად რეგისტრაცია]  [კლუბად რეგისტრაცია]        │
│                                                               │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░  hero illustration — footballer + club badge  ░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  HOW IT WORKS — 3-step explainer                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ ▓ icon 1     │  │ ▓ icon 2     │  │ ▓ icon 3     │        │
│  │ # შექმენი    │  │ # იპოვე      │  │ # დაუკავ.    │        │
│  │ პროფილი      │  │ კლუბი/მოთ.  │  │ შირდი        │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOR FOOTBALLERS section                                      │
│                                                               │
│  ░░░░░░░░░░░░░░░░░░░░░  # ფეხბურთელისთვის                   │
│  ░░ screenshot ░░░░░░░  · პოზიციის, ასაკის, ფიზ. მახ. პროფ. │
│  ░░░░░░░░░░░░░░░░░░░░░  · ფოტო გალერეა                       │
│                          · კლუბის გამოწერა                    │
│                          · სერვისის მოთხოვნა                  │
│                          [დაიწყე — უფასოა]                   │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOR CLUBS section                                            │
│                                                               │
│  # კლუბისთვის           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  · სტადიონი, ისტ., შემ. ░░ screenshot ░░░░░░░░░░░░░░░░░░░░  │
│  · ფეხბ. directory      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  · ფილტრები + real-time │                                     │
│    ჩატი                 │                                     │
│  [კლუბი დარეგისტრირდი]  │                                     │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  STATS STRIP                                                  │
│                                                               │
│     500+ ფეხბ.       80+ კლუბი       1 200+ match            │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                       │
│  [Sport Visa logo]   About  Privacy  Terms  Contact           │
│                                          © 2026 Sport Visa    │
└──────────────────────────────────────────────────────────────┘
```

---

## Mobile wireframe (< 640 px)

```
┌─────────────────────┐
│ HEADER              │
│ [logo]       [≡ ]   │
├─────────────────────┤
│ HERO                │
│                     │
│ # Sport Visa        │
│ ## ფეხბ. კლუბებს    │
│    ენახებიან.        │
│                     │
│ ░░░░░░░░░░░░░░░░░░  │
│ ░ illustration ░░░  │
│ ░░░░░░░░░░░░░░░░░░  │
│                     │
│ [ფეხბ. რეგ.]        │
│ [კლუბ. რეგ.]        │
├─────────────────────┤
│ HOW IT WORKS        │
│                     │
│ ▓ icon 1            │
│ # შექმენი პროფ.     │
│                     │
│ ▓ icon 2            │
│ # იპოვე             │
│                     │
│ ▓ icon 3            │
│ # დაუკავშირდი       │
├─────────────────────┤
│ FOR FOOTBALLERS     │
│ ░░░░░░░░░░░░░░░░░░  │
│ · პროფ. ···         │
│ · გალ. ···          │
│ [დაიწყე]            │
├─────────────────────┤
│ FOR CLUBS           │
│ ░░░░░░░░░░░░░░░░░░  │
│ · directory ···     │
│ [კლუბი]             │
├─────────────────────┤
│ FOOTER              │
│ © 2026 Sport Visa   │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| A   | Header CTA buttons scroll to hero on `/` but link to `/auth/signin` and `/auth/signup` on all other pages.                 |
| B   | Hero CTAs carry a `role` param: `/auth/signup?role=footballer` and `?role=club` to pre-select the role on the signup form. |
| C   | Stats strip numbers are hardcoded for MVP; later pulled from a public aggregate API.                                       |
| D   | Mobile nav is a slide-in drawer with [შესვლა] and [რეგისტრაცია] CTA at the bottom.                                         |
| E   | Page is entirely static (SSG); no auth check at the component level — Next.js middleware redirects logged-in users.        |
