# 11 — Chat Thread

**Route**: `/chat/[conversationId]`  
**Auth state**: authenticated user who is a participant in the conversation.  
**Goal**: Real-time 1:1 messaging between a footballer and a club. Initiated by the club from the directory.

---

## Desktop wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (role-appropriate nav)              [💬 ● 2 unread]  │
├────────────────────┬─────────────────────────────────────────┤
│  CONVERSATION LIST │  ACTIVE THREAD                           │
│  (sticky sidebar)  │                                          │
│                    │  ── THREAD HEADER ──────────────────── │
│  [🔍 ჩატ. ძ.]      │  ┌─────────────────────────────────┐   │
│                    │  │  ▓ ი. ბ.  ● online               │   │
│  ┌──────────────┐  │  │  ● [CV ↗]  ● [პროფ. ↗]          │   │
│  │ ▓ ი. ბ. ● on │  │  └─────────────────────────────────┘   │
│  │ "გამარჯობა··"│  │                                         │
│  │ 14:32  [2]   │  │  ── MESSAGES ───────────────────────── │
│  └──────────────┘  │                                         │
│  ┌──────────────┐  │  ↕ (scroll)                             │
│  │ ▓ გ. მ. ○ off│  │                                         │
│  │ "კი, მზად ···"│  │  ┌──────────────────────────────┐     │
│  │ გუშ.         │  │  │  ▓  FC Dila                   │     │
│  └──────────────┘  │  │  გამარჯობა! გაინტ. ხარ?      │     │
│  ┌──────────────┐  │  │                       13:45   │     │
│  │ ▓ ლ. ქ. ○ off│  │  └──────────────────────────────┘     │
│  │ "···"        │  │                                         │
│  │ 3 დ. წ.      │  │                 ┌──────────────────────┐│
│  └──────────────┘  │                 │  კი, გამარჯობა.      ││
│                    │                 │  რა პირობებია?  13:47 ││
│                    │                 └──────────────────────┘│
│                    │                                         │
│                    │  ┌──────────────────────────────┐     │  │
│                    │  │  ▓  FC Dila                   │     │  │
│                    │  │  ხელფ.: 800$/თვ. + ბინა.     │     │  │
│                    │  │  გათვ.: 2026-06-01.   13:50  │     │  │
│                    │  └──────────────────────────────┘     │  │
│                    │                                         │
│                    │  ┌──────────────────────────┐ ⚑B       │
│                    │  │ ░░ attachment preview ░░░ │          │
│                    │  │  contract_draft.pdf  [×]  │          │
│                    │  └──────────────────────────┘          │
│                    │                                         │
│                    │  ── TODAY (date separator) ──────────── │
│                    │                                         │
│                    │  ┌──────────────────────────────┐       │
│                    │  │  ▓  FC Dila                   │       │
│                    │  │  სად ხარ ამ. კლუბ-ში? 14:30 │       │
│                    │  └──────────────────────────────┘       │
│                    │                                         │
│                    │  ── MESSAGE INPUT ──────────────────── │
│                    │  ┌─────────────────────────────────┐   │
│                    │  │ {შეტყობინება ···}   [📎] [➤]   │   │
│                    │  └─────────────────────────────────┘   │
│                    │  ⚑A max 2000 სიმ. · Enter to send       │
│                    │                                         │
└────────────────────┴─────────────────────────────────────────┘
```

---

## Empty state (no conversations)

```
┌──────────────────────────────────────────────────────────────┐
│  # ჩატები                                                     │
│                                                               │
│      ▓▓▓                                                      │
│  ჯერ ჩატი არ გაქვს.                                           │
│                                                               │
│  (FOOTBALLER view)                                            │
│  კლუბები ინიციირებენ კომ. directory-იდან.                    │
│  მას შემდეგ, რაც კლ. გამოგიგ., ჩ. აქ გამ.                   │
│                                                               │
│  (CLUB view)                                                  │
│  [Directory-ს გახსნა]  და ფეხბ. პროფ-ზე დააჭ. "ჩატი"        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Mobile wireframe — conversation list (< 640 px)

```
┌─────────────────────┐
│ HEADER              │
│ [▓ logo] # ჩატები   │
├─────────────────────┤
│ [🔍 ჩატ. ძ.]        │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ ▓ ი.ბ. ● on     │ │
│ │ "გამარჯობა···"  │ │
│ │ 14:32       [2] │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ▓ გ.მ. ○ off    │ │
│ │ "კი, მზად ···"  │ │
│ │ გუშ.            │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ▓ ლ.ქ. ○ off    │ │
│ │ "···"           │ │
│ │ 3 დ. წ.         │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## Mobile wireframe — active thread (< 640 px)

```
┌─────────────────────┐
│ [←] ▓ ი.ბ. ● online │
│     [CV↗][პ.↗]      │
├─────────────────────┤
│ ↕ (scroll)          │
│                     │
│ ┌───────────────┐   │
│ │ ▓ FC Dila     │   │
│ │ გამ.! გ. ხ.?  │   │
│ │          13:45│   │
│ └───────────────┘   │
│                     │
│   ┌───────────────┐ │
│   │ კი. რა პ.?    │ │
│   │         13:47 │ │
│   └───────────────┘ │
│                     │
│ ┌───────────────┐   │
│ │ ▓ FC Dila     │   │
│ │ ხ.: 800$/თვ.  │   │
│ │          13:50│   │
│ └───────────────┘   │
│                     │
│ ── TODAY ────────── │
│                     │
│ ┌───────────────┐   │
│ │ ▓ FC Dila     │   │
│ │ სად ხ. ამ.კლ? │   │
│ │          14:30│   │
│ └───────────────┘   │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ {შეტ.···} [📎][➤]│ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## Annotations

| ⚑   | Note                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------- |
| A   | Input field supports newline with Shift+Enter; plain Enter submits. Max 2000 characters.                                  |
| B   | File attachment (📎) allows PDF/image up to 10 MB. Uploaded to R2 via presigned URL; message body stores the R2 key.      |
| C   | Messages are delivered via Pusher private channel `private-chat-[conversationId]`. Read receipts are deferred to Phase 8. |
| D   | Online status (● / ○) is derived from Pusher presence channel subscription; refreshed on connect/disconnect.              |
| E   | Conversation list sidebar collapses to a back-arrow on mobile (full-screen thread view).                                  |
| F   | Only clubs can initiate a new conversation (from footballer detail page). Footballers can only reply.                     |
| G   | Unread count badge on nav item is the sum of unread messages across all conversations. Cleared on thread open.            |
| H   | Mobile shows either the conversation list OR the active thread — never both side-by-side. [←] back returns to list.       |
