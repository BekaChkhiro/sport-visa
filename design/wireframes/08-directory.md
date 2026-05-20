# 08 — Footballer Directory

**Route**: `/directory` (CLUB role only)  
**Auth state**: authenticated, verified club.  
**Goal**: Browse, filter, and shortlist footballers. Primary discovery tool for clubs.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (club nav)                                            │
├─────────────────┬────────────────────────────────────────────┤
│  FILTERS        │  RESULTS                                    │
│  (sticky)       │                                             │
│                 │  # ფეხბ. Directory   [234 შედეგი]          │
│  # ფილტრები     │                                             │
│                 │  SORT: [სიახლე ▾]  [VIEW: ▤ ▦]  ⚑D        │
│  POSITION ⚑A    │                                             │
│  [ ] GK         │  ┌──────────────┐┌──────────────┐┌───────┐ │
│  [ ] CB         │  │ ▓▓▓▓▓        ││ ▓▓▓▓▓        ││ ▓▓▓▓▓ │ │
│  [ ] LB / RB    │  │ სახ. გვ.     ││ სახ. გვ.     ││ ...   │ │
│  [ ] CM / DM    │  │ CM · 26წ    ││ ST · 22წ    ││       │ │
│  [ ] AM         │  │ 182სმ · 78კ  ││ 175სმ · 70კ  ││       │ │
│  [ ] LW / RW    │  │ ★ GEO       ││ ★ GEO       ││       │ │
│  [ ] CF / ST    │  │             ││             ││       │ │
│                 │  │ [★ შ. სია]  ││ [★ შ. სია]  ││       │ │
│  AGE            │  │ [პროფ. ნახვ]││ [პროფ. ნახვ]││       │ │
│  min [18 ] - max[35]│ └──────────────┘└──────────────┘└───────┘ │
│                 │                                             │
│  HEIGHT (სმ)    │  ┌──────────────┐┌──────────────┐┌───────┐ │
│  min [160]      │  │ ▓▓▓▓▓        ││ ▓▓▓▓▓        ││ ▓▓▓▓▓ │ │
│  max [200]      │  │ სახ. გვ.     ││ სახ. გვ.     ││       │ │
│                 │  │ LB · 24წ    ││ GK · 28წ    ││       │ │
│  WEIGHT (კგ)    │  │ [★ შ. სია]  ││ [★ შ. სია]  ││       │ │
│  min [55 ]      │  │ [პროფ. ნახვ]││ [პროფ. ნახვ]││       │ │
│  max [100]      │  └──────────────┘└──────────────┘└───────┘ │
│                 │                                             │
│  DOMINANT FOOT  │  ── LIST VIEW (alternative) ──────────     │
│  (●) ყველა      │                                             │
│  ( ) მარჯ.      │  ┌──────────────────────────────────────┐  │
│  ( ) მარც.      │  │  ▓  სახ. გვ. | CM | 26წ | 182სმ |   │  │
│  ( ) ორივე      │  │     GEO    [★ შ. სია] [პროფ.]       │  │
│                 │  ├──────────────────────────────────────┤  │
│  NATIONALITY    │  │  ▓  სახ. გვ. | ST | 22წ | 175სმ |   │  │
│  {ეროვ. ძ. [↓]} │  │     GEO    [★ შ. სია] [პროფ.]       │  │
│                 │  └──────────────────────────────────────┘  │
│  CITY / REGION  │                                             │
│  {ქ./რ. ძ. [↓]} │  PAGINATION                                │
│                 │  [← წინა]  1  2  3 ···  [შემ. →]          │
│  EXPERIENCE     │                                             │
│  [ ] პროფ.      │                                             │
│  [ ] ნახ.       │                                             │
│  [ ] სამ.       │                                             │
│                 │                                             │
│  [ფ. გასუფთ.]   │                                             │
│  [გამ. ▸]       │                                             │
└─────────────────┴────────────────────────────────────────────┘
```

---

## Mobile wireframe (< 640 px)

```
┌─────────────────────┐
│ HEADER (club nav)   │
├─────────────────────┤
│ # Directory         │
│ [🔍 ფეხბ. ძებნა]    │
│ [⚙ ფილტრი (3)] ⚑E  │
├─────────────────────┤
│ 234 შედ. [სიახლე ▾] │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ ▓▓  სახ. გვ.    │ │
│ │ CM · 26წ · 182  │ │
│ │ GEO             │ │
│ │ [★][პროფ. ნახვ] │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ▓▓  სახ. გვ.    │ │
│ │ ST · 22წ · 175  │ │
│ │ GEO             │ │
│ │ [★][პროფ. ნახვ] │ │
│ └─────────────────┘ │
│ [მეტი ↓]            │
└─────────────────────┘

── FILTER DRAWER (slides up) ─
┌─────────────────────┐
│ # ფილტრები    [✕]   │
│                     │
│ POSITION            │
│ [GK][CB][CM][ST]··· │
│ AGE  [18] – [35]    │
│ სიმ. [160] – [200]  │
│ ფეხ. (●)ყ.( )მ.( )ო. │
│ ეროვ. [↓]           │
│ ქ./რ. [↓]           │
│                     │
│ [გამოყ.][გასუფ.]    │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------ |
| A   | Position filter is a multi-select chip group. Selected positions are highlighted.                                        |
| B   | Shortlist button (★) toggles on/off; optimistic UI update. Shortlisted players are stored in a `ClubShortlist` relation. |
| C   | Grid view shows 3 columns on desktop, 2 on tablet, 1 on mobile.                                                          |
| D   | Sort options: "სიახლე" (newest profile update), "ასაკი ↑", "ასაკი ↓", "სიმ. ↑", "სიმ. ↓".                                |
| E   | Mobile filter button shows badge count of active filters. Opens a bottom-sheet drawer.                                   |
| F   | Directory is only accessible to CLUB role users. Footballer and unauthenticated visitors see a 403 / redirect.           |
| G   | Empty state (no results): "ფილტრებთან ფეხბ. ვერ მოიძებნა — [ფილტ. გასუფ.]".                                              |
