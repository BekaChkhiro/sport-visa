# 09 — Footballer Detail Page (Club View)

**Route**: `/directory/[footballerId]`  
**Auth state**: authenticated, verified club.  
**Goal**: Full profile view for a footballer — allows club to shortlist, initiate chat, and see all profile details.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (club nav)                                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [← Directory-ში დაბრუნება]                                 │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  HERO SECTION                                         │    │
│  │                                                       │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░  cover / action photo  ░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │                                                       │    │
│  │  ▓▓▓▓▓▓  სახელი გვარი                    [★ შ. სია] │    │
│  │          CM · 26 წ. · GEO               [💬 ჩატი]  │    │
│  │          ● Verified · 👁 348 ნახვა                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────┐ ┌─────────────────────────┐    │
│  │  SPORT INFO              │ │  PHYSICAL                │    │
│  │                          │ │                         │    │
│  │  პოზ.: CM (ცენ. ნახ.)    │ │  სიმ.: 182 სმ           │    │
│  │  ფეხი: მარჯვენა          │ │  წონა: 78 კგ            │    │
│  │  გამ.: ნახ. პროფ.        │ │  ასაკი: 26              │    │
│  │  სეზ.: 2026/27 თავ.      │ │  ეროვ.: GEO             │    │
│  │  ამ. კლ.: FC Dila        │ │  ქ.: თბილ.              │    │
│  └──────────────────────────┘ └─────────────────────────┘    │
│                                                               │
│  ── BIO ─────────────────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ბიოგრაფია / მოკლე აღწერა ···                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ── CAREER HISTORY ──────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  · FC Dinamo Tbilisi  2022–2024  CM                  │    │
│  │  · FC Locomotive      2020–2022  CM                  │    │
│  │  · FC Dila Gori       2018–2020  AM                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ── PHOTO GALLERY ───────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐               │    │
│  │  │░░░░││░░░░││░░░░││░░░░││░░░░││░░░░│               │    │
│  │  └────┘└────┘└────┘└────┘└────┘└────┘               │    │
│  │  [← ]  1/6  [ →]                                    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ── VIDEOS ──────────────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ┌───────────────────────┐ ┌───────────────────────┐ │    │
│  │  │ ░ YouTube embed ░░░░░ │ │ ░ YouTube embed ░░░░░ │ │    │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░ │ │ ░░░░░░░░░░░░░░░░░░░░░ │ │    │
│  │  └───────────────────────┘ └───────────────────────┘ │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ── ACTIONS (sticky footer on mobile) ───────────────────    │
│  [★ Shortlist-ში დამ.]             [💬 ჩატის დაწყება]       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Mobile wireframe (< 640 px)

```
┌─────────────────────┐
│ HEADER (club nav)   │
│ [← Directory]       │
├─────────────────────┤
│ ░░░░░░░░░░░░░░░░░░  │
│ ░░  cover photo  ░  │
│ ░░░░░░░░░░░░░░░░░░  │
│                     │
│ ▓▓▓  სახ. გვ.       │
│ CM · 26წ · GEO      │
│ ● Verified · 👁 348  │
│                     │
│ ┌─────────────────┐ │
│ │ პ.: CM (ც.ნ.)   │ │
│ │ ფ.: მარჯვ.      │ │
│ │ გ.: ნახ.        │ │
│ │ ს.: 2026/27     │ │
│ │ კ.: FC Dila     │ │
│ │ სიმ.: 182 · 78კ │ │
│ │ ასაკი: 26       │ │
│ └─────────────────┘ │
│                     │
│ BIO                 │
│ ბიო ···             │
│                     │
│ CAREER              │
│ · FC Dinamo 22–24   │
│ · FC Loco   20–22   │
│                     │
│ GALLERY             │
│ ┌──┐┌──┐┌──┐        │
│ │░░││░░││░░│  1/6   │
│ └──┘└──┘└──┘        │
│ [← ] [→]            │
│                     │
│ VIDEOS              │
│ ░░░░░░░░░░░░░░░░░░  │
│ ░░ YouTube ░░░░░░░  │
│ ░░░░░░░░░░░░░░░░░░  │
├─────────────────────┤
│ STICKY FOOTER       │
│ [★ შ. სია][💬 ჩატი] │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------- |
| A   | Shortlist button is a toggle — ★ (add) / ★ highlighted (remove). Shows toast confirmation.                            |
| B   | Chat button creates or opens an existing conversation with this footballer and redirects to `/chat/[conversationId]`. |
| C   | Profile views counter increments each time a CLUB user loads this page (deduplicated by session per day).             |
| D   | Contact info (phone) is hidden unless the footballer is in the club's shortlist (privacy gating).                     |
| E   | Gallery uses a lightbox on click; keyboard navigable.                                                                 |
| F   | Videos render as responsive iframes. Only YouTube and Vimeo embeds are allowed (sanitized).                           |
| G   | This page is SSR (server-rendered) for each request — profile data is not stale-cached since it can update.           |
| H   | Mobile has a sticky footer bar with Shortlist and Chat CTAs always visible while scrolling.                           |
