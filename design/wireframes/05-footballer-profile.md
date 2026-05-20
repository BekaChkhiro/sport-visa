# 05 — Footballer Profile Edit

**Route**: `/profile/edit`  
**Auth state**: authenticated footballer.  
**Goal**: View and edit all profile sections. Changes are saved per section (not one big form).

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (same as dashboard)                                   │
├─────────────────┬────────────────────────────────────────────┤
│  SIDEBAR        │  MAIN                                       │
│                 │                                             │
│  SECTION NAV    │  PAGE TITLE                                 │
│  · პირადი ინფ.  │  # პროფილის რედაქტირება                    │
│  · სპ. ინფ.     │                                             │
│  · ფოტო გალ.    │  ── PERSONAL INFO ──────────────────────   │
│  · ვიდეოები     │  ┌──────────────────────────────────────┐  │
│  · კარ. ისტ.    │  │  ▓▓▓▓                                │  │
│  · სერვ. მოთ.   │  │  [ავატ. ცვლ.]  JPG/PNG < 5MB         │  │
│  · ანგ. პარ.    │  │                                      │  │
│                 │  │  {სახელი ★}       {გვარი ★}          │  │
│  VISIBILITY     │  │  {დაბ. თ. ★}      {ეროვ. ★ [↓]}     │  │
│  ──────────     │  │  {ქალაქი ★}       {ქვეყ. ★ [↓]}     │  │
│  [●] პროფ.      │  │  {ტელ.}           {წ. მისამ.}       │  │
│  ხილვ. კლ.      │  │  {ბიო} (500 სიმ.)                    │  │
│                 │  │  [0/500]                              │  │
│  Status: ⚑A     │  │                          [შენახვა]   │  │
│  ✓ გადამ.       │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── SPORT INFO ─────────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  POSITION ★  [GK][CB][LB][RB][CM]   │  │
│                 │  │              [DM][AM][LW][RW][CF][ST]│  │
│                 │  │  {სიმაღლე (სმ)} {წონა (კგ)}          │  │
│                 │  │  DOMINANT FOOT ★                     │  │
│                 │  │  (●)მარჯ. ( )მარც. ( )ორივე          │  │
│                 │  │  {ამ. კლ.}  {ნომ.}  LEVEL [↓]        │  │
│                 │  │  {სასურ. ლ.}                          │  │
│                 │  │                          [შენახვა]   │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── PHOTO GALLERY ──────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  ┌────┐┌────┐┌────┐┌────┐            │  │
│                 │  │  │░░░░││░░░░││░░░░││ +  │            │  │
│                 │  │  │[×] ││[×] ││[×] ││    │  ⚑B       │  │
│                 │  │  └────┘└────┘└────┘└────┘            │  │
│                 │  │  ┌────┐┌────┐┌────┐┌────┐            │  │
│                 │  │  │░░░░││░░░░││░░░░││░░░░│            │  │
│                 │  │  └────┘└────┘└────┘└────┘            │  │
│                 │  │  8/8 ფოტო              [+ ატვ.]      │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── VIDEO LINKS ────────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  {YouTube / Vimeo URL 1}  [×]        │  │
│                 │  │  {YouTube / Vimeo URL 2}  [×]        │  │
│                 │  │  [+ ვიდეოს დამ.] (max 3)             │  │
│                 │  │                          [შენახვა]   │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── CAREER HISTORY ─────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  · FC Dinamo Tbilisi   2022–2024 [✏] │  │
│                 │  │  · FC Locomotive       2020–2022 [✏] │  │
│                 │  │  [+ კლ. / გუნდის დამ.]               │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
└─────────────────┴────────────────────────────────────────────┘
```

---

## Mobile wireframe (< 640 px)

```
┌─────────────────────┐
│ HEADER (footballer) │
│ [▓ logo]    [≡ ]    │
├─────────────────────┤
│ # პროფ. რედ.        │
│                     │
│ SECTION TABS (swipe)│
│ [პირ.][სპ.][ფო.][ვ.]│
├─────────────────────┤
│ PERSONAL INFO       │
│ ▓▓ [ავ. ცვლ.]       │
│ {სახ. ★} {გვ. ★}   │
│ {დ.თ. ★} {ეროვ. [↓]}│
│ {ქ. ★}  {ქვ. [↓]}  │
│ {ტელ.}              │
│ {ბიო} [0/500]       │
│          [შენახვა]  │
├─────────────────────┤
│ Visibility: [●] on  │
│ Status: ✓ გადამ.    │
└─────────────────────┘

── Sport info tab ─────
┌─────────────────────┐
│ SPORT INFO          │
│ POSITION ★          │
│ [GK][CB][LB][RB]    │
│ [CM][DM][AM][LW]    │
│ [RW][CF][ST]        │
│ FOOT ★              │
│ (●)მ. ( )მ. ( )ო.  │
│ {სიმ.} {წ.}         │
│ {ამ. კლ.} {ნ.} [↓] │
│ {ს. ლ.}             │
│          [შენახვა]  │
└─────────────────────┘

── Gallery tab ────────
┌─────────────────────┐
│ PHOTO GALLERY       │
│ ┌──┐┌──┐┌──┐┌ + ┐  │
│ │░░││░░││░░││   │  │
│ │[×]││[×]││[×]│    │
│ └──┘└──┘└──┘└───┘  │
│ 3/8        [+ ატვ.] │
│                     │
│ VIDEO LINKS         │
│ {URL 1}  [×]        │
│ [+ ვიდ.] (max 3)    │
│          [შენახვა]  │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Verification badge shows current status: ⏳ Pending / ✓ Verified / ✕ Rejected (with rejection reason). Rejected users can re-submit after fixing issues. |
| B   | Gallery thumbnails support drag-to-reorder. First photo is the profile cover. Clicking × removes with confirmation toast.                                |
| C   | Each section saves independently with optimistic UI update + toast. No full-page submit.                                                                 |
| D   | Account settings (email, password change, delete account) are in a separate `/account/settings` page linked from sidebar.                                |
| E   | Profile visibility toggle (sidebar) controls whether clubs can find this footballer in the directory. Default ON after verification.                     |
| F   | Mobile uses a tab-based layout instead of the desktop scroll-all-sections layout. Section tabs are swipeable.                                            |
