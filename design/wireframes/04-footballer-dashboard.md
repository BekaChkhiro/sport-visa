# 04 — Footballer Dashboard

**Route**: `/dashboard` (FOOTBALLER role)  
**Auth state**: authenticated, verified footballer.  
**Goal**: Central hub — quick-access profile status, club newsfeed, pending service requests, and shortcut actions.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                       │
│  [▓ logo]  [Dashboard] [პროფილი] [კლუბები] [სერვ.] [ჩატი]  │
│                                           [▓ avatar ▾]       │
├─────────────────┬────────────────────────────────────────────┤
│  SIDEBAR        │  MAIN                                       │
│                 │                                             │
│  ▓▓▓            │  PROFILE COMPLETION BANNER ⚑A              │
│  სახელი გვ.     │  ┌──────────────────────────────────────┐  │
│  ● CM · GEO     │  │ ░░░ პროფილი 70% შევსებული           │  │
│                 │  │ [პროფ. დასრულება →]                  │  │
│  Profile score  │  └──────────────────────────────────────┘  │
│  ████████░░ 70% │                                             │
│                 │  ── CLUB NEWSFEED ────────────────────────  │
│  [პროფ. რედ.]  │                                             │
│  [CV ჩამოტვ.]  │  ┌──────────────────────────────────────┐  │
│                 │  │  ▓ კლუბ A ლოგო  · 2 სთ. წინ         │  │
│  ── QUICK ────  │  │  # სათაური                           │  │
│                 │  │  მოკლე ახ. ტექსტი ···               │  │
│  [+ სერვ. მოთ]  │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  [კლუბების ძ.]  │  │  [❤ 12]  [💬 3]                     │  │
│  [ჩატები]       │  └──────────────────────────────────────┘  │
│                 │                                             │
│  ── STATS ───   │  ┌──────────────────────────────────────┐  │
│  👁 348 view.   │  │  ▓ კლუბ B ლოგო  · 1 დ. წინ          │  │
│  ❤ 5 saved     │  │  # სათაური 2                          │  │
│  💬 2 messages  │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│                 │  │  [❤ 4]  [💬 1]                      │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  [მეტის ჩვენება ↓]                         │
│                 │                                             │
│                 │  ── SERVICE REQUESTS ─────────────────────  │
│                 │                                             │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  · კვება — [⏳ განხ.]   2026-05-18   │  │
│                 │  │  · ტრენერი — [✓ დადასტ.] 2026-05-15 │  │
│                 │  └──────────────────────────────────────┘  │
│                 │  [ახ. სერვ. მოთხოვნა]                      │
│                 │                                             │
│                 │  ── CLUBS SUBSCRIBED ─────────────────────  │
│                 │                                             │
│                 │  ▓ კლ. A  ▓ კლ. B  ▓ კლ. C  [+ კლ. ძ.]   │
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
│ PROFILE STRIP       │
│ ▓ avatar            │
│ სახელი გვ.          │
│ ████████░░ 70%      │
│ [პროფ. რედ.]        │
├─────────────────────┤
│ QUICK ACTIONS       │
│ [+ სერვ.] [კლ.ძ.]  │
│ [ჩატები]            │
├─────────────────────┤
│ STATS               │
│ 👁 348  ❤ 5  💬 2   │
├─────────────────────┤
│ NEWSFEED            │
│ ┌─────────────────┐ │
│ │ ▓ კლუბ A · 2სთ │ │
│ │ # სათაური       │ │
│ │ ░░░░░░░░░░░░░░  │ │
│ │ [❤ 12] [💬 3]  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ▓ კლუბ B · 1დ  │ │
│ │ # სათაური 2     │ │
│ │ ░░░░░░░░░░░░░░  │ │
│ └─────────────────┘ │
│ [მეტის ჩვენება ↓]   │
├─────────────────────┤
│ SERVICE REQUESTS    │
│ · კვება [⏳]         │
│ · ტრენ. [✓]         │
│ [+ ახ. სერვ.]       │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Completion banner is dismissed when profile reaches 100% or user clicks ×. Percentage is computed server-side from filled optional + required fields. |
| B   | Newsfeed items come from clubs the footballer has subscribed to. Empty state shows "გამოიწერე კლუბი newsfeed-ისთვის" with a link to club directory.   |
| C   | Stats (profile views, saves, messages) are aggregated daily and cached; not real-time.                                                                |
| D   | CV download generates a PDF server-side from the profile data (Phase 4).                                                                              |
| E   | Service request badge count shown on the [სერვ.] nav item when there are pending/updated requests.                                                    |
