# 06 — Club Dashboard

**Route**: `/dashboard` (CLUB role)  
**Auth state**: authenticated, verified club.  
**Goal**: Central hub for clubs — profile status, recent footballer shortlist activity, messages, and quick access to the directory.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                       │
│  [▓ logo]  [Dashboard] [პროფილი] [Directory] [ჩატი] [ახ.]  │
│                                             [▓ avatar ▾]     │
├─────────────────┬────────────────────────────────────────────┤
│  SIDEBAR        │  MAIN                                       │
│                 │                                             │
│  ▓▓ logo        │  VERIFICATION BANNER ⚑A                    │
│  კლუბ. სახ.     │  ┌──────────────────────────────────────┐  │
│  ● ქ. · ● ლ.   │  │ ✓ კლუბი დადასტ.  [× ]               │  │
│                 │  └──────────────────────────────────────┘  │
│  [კლ. პროფ.]   │                                             │
│  [+ ახ. გამ.]   │  ── RECENT SHORTLIST ACTIVITY ────────────  │
│                 │                                             │
│  ── QUICK ────  │  ┌──────────────────────────────────────┐  │
│                 │  │  ▓ ი. ბ.  CM · 182სმ · GEO           │  │
│  [Directory ↗]  │  │  ✓ შენ მოათავსე შ. სიაში  · 1სთ წ.  │  │
│  [ჩატები]       │  │  [პროფ. ნახვა]  [ჩატი]               │  │
│  [service req.] │  └──────────────────────────────────────┘  │
│                 │                                             │
│  ── STATS ───   │  ┌──────────────────────────────────────┐  │
│  👁 1 200 ნახ.  │  │  ▓ გ. მ.  ST · 178სმ · GEO           │  │
│  ★ 34 შ. სია    │  │  ✓ შ. სიაში დამ.  · 3 დ. წ.          │  │
│  💬 8 ახ. ჩ.    │  │  [პროფ. ნახვა]  [ჩატი]               │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  [Directory-ის გახსნა →]                   │
│                 │                                             │
│                 │  ── ACTIVE CHATS ──────────────────────   │
│                 │                                             │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  ▓ ი. ბ.  ● online                   │  │
│                 │  │  "გამარჯობა, გაინტ. ..."    14:32    │  │
│                 │  │  [ჩატის გახსნა]                      │  │
│                 │  ├──────────────────────────────────────┤  │
│                 │  │  ▓ გ. მ.   ○ offline                  │  │
│                 │  │  "კი, მზად ვარ..."          გუ.      │  │
│                 │  │  [ჩატის გახსნა]                      │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── NEWS POSTS ────────────────────────   │
│                 │                                             │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  · "ახ. სეზ. დაიწყო!" · 12 ❤        │  │
│                 │  │    2026-05-18          [რედ.][წაშ.]  │  │
│                 │  │  · "ტრავ. განახ."       · 5 ❤        │  │
│                 │  │    2026-05-16          [რედ.][წაშ.]  │  │
│                 │  └──────────────────────────────────────┘  │
│                 │  [+ ახ. პოსტი]                             │
│                 │                                             │
└─────────────────┴────────────────────────────────────────────┘
```

---

## Mobile wireframe (< 640 px)

```
┌─────────────────────┐
│ HEADER              │
│ [▓ logo]    [≡ ]    │
├─────────────────────┤
│ CLUB STRIP          │
│ ▓ logo              │
│ კლუბ. სახ.          │
│ ● ქ. · ● ლ.         │
│ [კლ. პროფ.]         │
├─────────────────────┤
│ STATS               │
│ 👁 1200  ★ 34  💬 8  │
├─────────────────────┤
│ QUICK ACTIONS       │
│ [Directory] [ჩატ.]  │
│ [+ ახ. პოსტი]       │
├─────────────────────┤
│ RECENT SHORTLIST    │
│ ┌─────────────────┐ │
│ │ ▓ ი. ბ. CM 182  │ │
│ │ [პროფ.][ჩატი]  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ▓ გ. მ. ST 178  │ │
│ │ [პროფ.][ჩატი]  │ │
│ └─────────────────┘ │
├─────────────────────┤
│ ACTIVE CHATS        │
│ ▓ ი. ბ. ● "გამ..." │
│ ▓ გ. მ. ○ "კი..."  │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------- |
| A   | Verification banner is shown until dismissed; green on verified, yellow with instructions if pending.          |
| B   | Shortlist activity feed shows the 10 most recently shortlisted footballers (sorted by shortlist timestamp).    |
| C   | Active chats list is ordered by most recent message. Unread count badge shown on chat items.                   |
| D   | News posts management is scoped to this dashboard; the public view is on the club detail page (screen 10).     |
| E   | Service requests tab (sidebar) only visible if at least one footballer has requested a service from this club. |
