# 13 — Admin Panel: Verification Queue

**Route**: `/admin` (ADMIN role only)  
**Auth state**: authenticated admin.  
**Goal**: Review and approve/reject pending footballer and club registrations. Also manage service requests and reference data.

---

## Desktop wireframe — Verification queue

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (admin nav)                                           │
│  [▓ logo]  [Verif.] [სერვ. მოთ.] [მომხ.] [Ref. Data]       │
│                                           [▓ admin ▾]        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  # ვერიფ. რიგი           ⚑A [ფეხბ. (14)] [კლ. (3)]         │
│                                                               │
│  ── FOOTBALLER QUEUE ──────────────────────────────────────  │
│                                                               │
│  [🔍 სახ./ელ.ფ.ძ.]    SORT: [შ. თარ. ↑ ▾]                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ▓  სახ. გვ.          ელ. ფ.          შ.: 2026-05-18 │    │
│  │     CM · 26წ · GEO    user@email.ge   ⏳ პ. მოლ.    │    │
│  │                                                      │    │
│  │  [პროფ. ნახვა]         [✓ დამ.]  [✕ უარ.]          │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  ▓  სახ. გვ.          ელ. ფ.          შ.: 2026-05-17 │    │
│  │     ST · 22წ · GEO    user2@email.ge  ⏳ პ. მოლ.   │    │
│  │                                                      │    │
│  │  [პროფ. ნახვა]         [✓ დამ.]  [✕ უარ.]          │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  ▓  სახ. გვ.          ელ. ფ.          შ.: 2026-05-16 │    │
│  │     GK · 28წ · GEO    user3@email.ge  ⏳ პ. მოლ.   │    │
│  │                                                      │    │
│  │  [პროფ. ნახვა]         [✓ დამ.]  [✕ უარ.]          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  [← წინა]  1  2 ···  [შემ. →]                               │
│                                                               │
│  ── REJECTION MODAL (on "✕ უარ.") ─────────────────────────  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  # უარყოფ. მიზ.                                      │    │
│  │                                                      │    │
│  │  (●) პროფ. სრ. არ არ.   ( ) ყ. ინფ. არ. (ც.)       │    │
│  │  ( ) ფოტო არ. (ც.)       ( ) სხვა (ჩ. ქვ.)          │    │
│  │                                                      │    │
│  │  {დამ. კომ. (გამ. ელ.ფ-ში)} (max 500)              │    │
│  │                                                      │    │
│  │  [გაუქმ.]                          [უარ. გაგ.]      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Desktop wireframe — Service requests

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (admin nav) — Service Requests tab active             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  # სერვ. მოთხ.         [ყველა] [⏳ ახ. (8)] [✓ დამ.] [✕]  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  SR-2026-0042  კვება  · ი. ბ.       2026-05-18       │    │
│  │  ⏳ ახ.         user@email.ge                         │    │
│  │  [პ. ნახ.]     [✓ ჩამ.]  [✕ უარ.]  [💬 კომ.]        │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  SR-2026-0039  ტრ.  · გ. მ.         2026-05-16       │    │
│  │  ✓ დამ.        user2@email.ge                        │    │
│  │  [პ. ნახ.]     [კომ.]                                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Desktop wireframe — User management

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (admin nav) — Users tab active                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  # მომხ. მართ.    [🔍 ელ.ფ./სახ.]   [ROLE: ყვ. ▾]           │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  სახ. გვ.  ელ. ფ.         ROLE    სტ.      მოქ.      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  ი. ბ.     i@e.ge         FOOTB.  ✓ VER.  [ბლ.][წ.] │    │
│  │  გ. მ.     g@e.ge         FOOTB.  ⏳ PEND. [ბლ.][წ.] │    │
│  │  FC Dila   d@e.ge         CLUB    ✓ VER.  [ბლ.][წ.] │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Mobile wireframe — verification queue (< 640 px)

```
┌─────────────────────┐
│ HEADER (admin)      │
│ [▓ logo]    [≡ ]    │
├─────────────────────┤
│ [ვ.][სერვ.][მ.][R.D]│
├─────────────────────┤
│ # ვერიფ. რიგი       │
│ [ფ. (14)] [კლ. (3)] │
│                     │
│ [🔍 სახ./ელ.ფ.]     │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ ▓ სახ. გვ.      │ │
│ │ CM · 26წ · GEO  │ │
│ │ user@email.ge   │ │
│ │ შ.: 2026-05-18  │ │
│ │ ⏳ პ. მოლ.       │ │
│ │ [პ.ნ.][✓][✕]   │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ▓ სახ. გვ. 2    │ │
│ │ ST · 22წ · GEO  │ │
│ │ user2@email.ge  │ │
│ │ ⏳ პ. მოლ.       │ │
│ │ [პ.ნ.][✓][✕]   │ │
│ └─────────────────┘ │
│ [← 1 2 ··· →]      │
└─────────────────────┘

── Service requests tab ─
┌─────────────────────┐
│ # სერვ. მოთ.        │
│ [ყვ.][⏳(8)][✓][✕]  │
│                     │
│ ┌─────────────────┐ │
│ │ SR-0042 კვება   │ │
│ │ ი. ბ. · 05-18   │ │
│ │ ⏳ · user@e.ge   │ │
│ │ [პ.ნ.][✓][✕][💬]│ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Tab pills show pending count badge. Footballer tab is default since it's the larger queue.                                                                       |
| B   | "პ. ნახვა" (profile view) opens the footballer/club profile in a new tab so admin can inspect before deciding.                                                   |
| C   | Approve action: sets user status to VERIFIED, triggers Resend confirmation email to user.                                                                        |
| D   | Reject action: opens the modal (wireframed above), collects rejection reason, triggers Resend email with reason to user. User can re-submit after fixing issues. |
| E   | Service request "ჩამ." marks it resolved; triggers email notification to the footballer.                                                                         |
| F   | Block user action disables login and hides profile from directory. Reversible. Delete is permanent (GDPR).                                                       |
| G   | Ref. data tab (not wireframed): admin manages position list, nationality list, league list used in dropdowns across the app. Simple CRUD table.                  |
| H   | Admin panel is desktop-first; mobile view provides read/approve/reject access but not the full table view. Action buttons [✓][✕] are larger touch targets.       |
