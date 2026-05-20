# 07 — Club Profile Edit

**Route**: `/profile/edit` (CLUB role)  
**Auth state**: authenticated club.  
**Goal**: Edit all club profile sections. Each section saves independently.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (same as club dashboard)                              │
├─────────────────┬────────────────────────────────────────────┤
│  SIDEBAR        │  MAIN                                       │
│                 │                                             │
│  SECTION NAV    │  # კლუბის პროფილის რედ.                    │
│  · ვინაობა      │                                             │
│  · მედია        │  ── IDENTITY ───────────────────────────   │
│  · შემ. სიტ.    │  ┌──────────────────────────────────────┐  │
│  · ისტ. / ბიო   │  │  {კლუბის სახ. ★}                     │  │
│  · სტ. ინფ.     │  │  {დაარ. წელი}    {ქვ. ★ [↓]}        │  │
│  · ანგ. პარ.    │  │  {ქ. ★}          {ლ./დ. [↓]}         │  │
│                 │  │  {სტ. სახ.}       {ტევ. (ად.)}        │  │
│  Visibility     │  │  {ოფ. ვებ.}                            │  │
│  [●] კლ. ხ.     │  │                          [შენახვა]   │  │
│   direct.-ში    │  └──────────────────────────────────────┘  │
│                 │                                             │
│  Status:        │  ── MEDIA ──────────────────────────────   │
│  ✓ გადამ.       │  ┌──────────────────────────────────────┐  │
│                 │  │  LOGO (required)                      │  │
│                 │  │  ▓▓▓▓▓  [ლოგოს ცვლ.] PNG/SVG < 2MB   │  │
│                 │  │                                      │  │
│                 │  │  COVER PHOTO (stadium / team)         │  │
│                 │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│                 │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│                 │  │  [ფოტოს ცვლ.] JPG/PNG < 10MB         │  │
│                 │  │                          [შენახვა]   │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── CURRENT ROSTER ─────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  {მოთ. სახ.}  {პოზ. [↓]}  [+ დამ.]  │  │
│                 │  │                                      │  │
│                 │  │  · ი. ბ.  CM   [×]                   │  │
│                 │  │  · გ. მ.  ST   [×]                   │  │
│                 │  │  · ნ. კ.  GK   [×]                   │  │
│                 │  │                          [შენახვა]   │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── HISTORY / BIO ──────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  {კლუბის ისტ. / ბიო} (max 2000)      │  │
│                 │  │  [rich text toolbar: B I U • ≡ 🔗]   │  │
│                 │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│                 │  │  [0/2000]                [შენახვა]   │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
│                 │  ── STADIUM INFO ────────────────────────   │
│                 │  ┌──────────────────────────────────────┐  │
│                 │  │  {სტ. მისამ.}                         │  │
│                 │  │  {Google Maps ლინ. ან კოორდ.}         │  │
│                 │  │  ░░░░ map embed placeholder ░░░░░░░░  │  │
│                 │  │                          [შენახვა]   │  │
│                 │  └──────────────────────────────────────┘  │
│                 │                                             │
└─────────────────┴────────────────────────────────────────────┘
```

---

## Mobile wireframe (< 640 px)

```
┌─────────────────────┐
│ HEADER (club)       │
│ [▓ logo]    [≡ ]    │
├─────────────────────┤
│ # კლ. პროფ. რედ.   │
│                     │
│ SECTION TABS (swipe)│
│ [ვინ.][მედ.][შ.][ბ.]│
├─────────────────────┤
│ IDENTITY            │
│ {კლ. სახ. ★}        │
│ {დ.წ.} {ქვ. ★ [↓]} │
│ {ქ. ★} {ლ. [↓]}    │
│ {სტ.} {ტ.}          │
│ {ვებ.}              │
│          [შენახვა]  │
│                     │
│ Visibility: [●]     │
│ Status: ✓ გადამ.    │
└─────────────────────┘

── Media tab ──────────
┌─────────────────────┐
│ MEDIA               │
│ LOGO                │
│ ▓▓▓▓ [ლ. ცვლ.] 2MB │
│                     │
│ COVER PHOTO         │
│ ░░░░░░░░░░░░░░░░░░  │
│ [ფ. ცვლ.] < 10MB    │
│          [შენახვა]  │
└─────────────────────┘

── Roster tab ─────────
┌─────────────────────┐
│ ROSTER              │
│ {სახ.} {პოზ. [↓]}  │
│ [+ დამ.]            │
│                     │
│ · ი. ბ.  CM  [×]    │
│ · გ. მ.  ST  [×]    │
│ · ნ. კ.  GK  [×]    │
│          [შენახვა]  │
└─────────────────────┘

── Bio tab ────────────
┌─────────────────────┐
│ HISTORY / BIO       │
│ [B I U • ≡ 🔗]      │
│ ░░░░░░░░░░░░░░░░░░  │
│ ░░ rich text ░░░░░  │
│ ░░░░░░░░░░░░░░░░░░  │
│ [0/2000] [შენახვა]  │
│                     │
│ STADIUM             │
│ {სტ. მისამ.}         │
│ {Maps ლინ./კოო.}    │
│          [შენახვა]  │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Rich text editor for History/Bio uses a minimal Tiptap or Quill implementation with only basic formatting (bold, italic, underline, bullets, links). No images inside bio. |
| B   | Roster entries are free-text in MVP (name + position). Not linked to platform footballer accounts.                                                                         |
| C   | Visibility toggle hides the club from the footballer directory but keeps the profile page accessible via direct URL.                                                       |
| D   | Logo is displayed at 200×200 px on the public profile and as a 40×40 thumbnail in directory cards. Must be square.                                                         |
| E   | Stadium map embed uses an iframe to Google Maps using the provided coordinates or link. Shown on the public club detail page.                                              |
| F   | Mobile uses a swipeable tab layout. Section tabs map to: ვინ. (identity), მედ. (media), შ. (roster), ბ. (bio + stadium).                                                   |
