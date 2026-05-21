# 11 — Chat Thread · Hi-Fi Spec

> Pairs with [wireframes/11-chat.md](../wireframes/11-chat.md).

**Route**: `/chat/[conversationId]` · authenticated participant.

---

## Layout

Two-pane on desktop. Mobile alternates between the conversation list view
and the active thread view (no side-by-side).

```
┌──────────────────────────────────────────────────────────────┐
│  Header (role nav)                            [💬 ● 2]       │
├────────────────────┬─────────────────────────────────────────┤
│  CONVERSATION LIST │  ACTIVE THREAD                           │
│  320 px sticky     │  fluid                                  │
└────────────────────┴─────────────────────────────────────────┘
```

Total page height = `h-[calc(100vh-4rem)]` so the input bar stays pinned at the bottom.

---

## Conversation list (sidebar)

`bg-card border-r border-border w-[320px] h-full flex flex-col`.

### Search

`p-3 border-b border-border` — `<Input placeholder="ჩატის ძიება" leadingIcon={<SearchIcon size={16} />} />`.

### List

`overflow-y-auto divide-y divide-border`. Each row (`ConversationListItem`):

```
┌─ row ──────────────────────────────────────┐
│ ▓  ი. ბაქრ.   ● online            14:32    │
│    "გამარჯობა, გაინტერ. ვარ..."        [2] │
└────────────────────────────────────────────┘
```

- Row: `flex gap-3 p-3 hover:bg-accent cursor-pointer relative` (active = `bg-accent`).
- Avatar: `size-10` with presence dot (`size-2.5 absolute -right-0.5 -bottom-0.5 ring-2 ring-card rounded-full`). `bg-success` / `bg-muted-foreground`.
- Top line: name `.text-body font-medium truncate` + timestamp right `.text-caption text-muted-foreground tabular-nums`.
- Preview: `.text-caption text-muted-foreground line-clamp-1`.
- Unread badge: `absolute top-3 right-3 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center`.

Empty state ⚑F: full-sidebar empty state shown when zero conversations
(see active-thread empty section below for the role-aware copy).

---

## Thread header

`flex items-center justify-between gap-4 p-4 border-b border-border bg-card sticky top-0 z-10`.

```
[← (mobile only)]   ▓ ი. ბაქრ.   ● online        [CV ↗]  [პროფ. ↗]
                     Last seen 12 წ. წინ (if offline)
```

- Mobile-only back button `<Button variant=ghost size=icon>` `<ArrowLeftIcon />`.
- Avatar + name (`size-9`).
- Presence text below name in `.text-caption text-muted-foreground`.
- Right slot: `Button variant=outline size=sm` "CV ↗" (downloads PDF) + `Button variant=outline size=sm` "პროფ. ↗" (opens profile in a new tab). Both with trailing `<ExternalLinkIcon size={12} />`.

---

## Messages list

`flex-1 overflow-y-auto px-4 py-6 space-y-4`. Auto-scrolls to bottom on new messages unless user has scrolled up.

### Date separator

```
─────── დღეს ───────
```

`flex items-center gap-3 my-6`. Horizontal lines `flex-1 h-px bg-border` flanking a `.text-caption text-muted-foreground` label centred.

### Message bubble — incoming (other person)

```
┌── ▓ avatar (size-8) ──┐
│  [sender label]        │
│  ┌──────────────────┐  │
│  │  message text     │  │
│  │              13:45│  │
│  └──────────────────┘  │
└────────────────────────┘
```

- Container: `flex items-end gap-2 max-w-[75%] mr-auto`.
- Avatar on the left (only on the first message of a consecutive run from the same sender; subsequent shows a placeholder spacer).
- Sender label `.text-caption text-muted-foreground mb-1` (only first message of the run).
- Bubble: `bg-card border-border rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm`.
- Body: `.text-body whitespace-pre-wrap break-words`.
- Timestamp: `.text-caption text-muted-foreground tabular-nums float-right ml-3`.

### Message bubble — outgoing (current user)

- Container: `flex items-end gap-2 max-w-[75%] ml-auto justify-end`.
- Bubble: `bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5`.
- No avatar (it's you).
- Timestamp colour: `text-primary-foreground/80`.

### Attachment preview ⚑B

For PDF / image messages:

```
┌── attachment card ─────────────────────┐
│  ░░ icon (PDF / image) ░░░             │
│  contract_draft.pdf                    │
│  238 KB · PDF                          │
│                          [↓ Download]  │
└────────────────────────────────────────┘
```

- Container: `bg-background border-border rounded-md p-3 mt-2 max-w-[280px]`.
- Inside an outgoing bubble: invert to `bg-primary-foreground/10 border-primary-foreground/20`.
- Filename: `.text-body font-medium`. Meta: `.text-caption muted`.
- Action: small `<Button variant=outline size=sm>` "Download" with `<DownloadIcon size={14} />`.
- For images: full thumbnail `aspect-video object-cover` instead of icon + meta.

### Pending / failed message

| State   | Visual                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pending | bubble at `opacity-60` + a `<SpinnerIcon size={12} className="animate-spin" />` next to the timestamp                          |
| Failed  | bubble `border-destructive` + below the bubble: `.text-caption text-destructive` "ვერ გაიგზავნა · [თავიდან]" with a retry link |

---

## Message input

Sticky to the bottom of the thread pane: `border-t border-border bg-card p-3`.

```
┌────────────────────────────────────────────────────────────────┐
│ {შეტყობინება ···}                                  [📎] [➤]    │
└────────────────────────────────────────────────────────────────┘
```

- Container: `flex items-end gap-2`.
- Textarea: `<Textarea>` with `min-h-[44px] max-h-[160px] resize-none border-0 focus-visible:ring-0 bg-transparent px-3 py-2.5`. Auto-grows on input. Placeholder "შეტყობინება ···".
- Attachment button: `Button variant=ghost size=icon` `<PaperclipIcon size={18} />`. Opens file picker (PDF / image, < 10 MB).
- Send button: `Button size=icon` (`size-10 rounded-full`) `<SendIcon size={16} />`. Disabled while textarea is empty. Loading: spinner replaces send icon.
- Helper line below: `.text-caption text-muted-foreground` "Enter — გაგზავნა · Shift+Enter — ახ. ხაზი · მაქს. 2000 სიმბ. (1845 / 2000)".

### Attachment chip preview ⚑B

After picking a file, before sending, a chip appears above the textarea:

```
┌─ chip ──────────────────────────┐
│ ░░ icon  contract_draft.pdf  [×] │
└──────────────────────────────────┘
```

`bg-secondary text-secondary-foreground rounded-md px-3 py-2 inline-flex items-center gap-2`. Remove button is `<Button variant=ghost size=icon>` `<CloseIcon size={12} />`.

---

## Empty state (no conversations) ⚑F

Replaces the active thread pane (full-pane width).

```
              ▓▓▓  (MessageCircleIcon 48px, muted/50)

              ჯერ ჩატი არ გაქვს

   (FOOTBALLER) კლუბები ინიც. კომ. directory-დან.
                ჩატი აქ გამოჩნდება, როცა კლუბი მოგწერს.
   (CLUB)       Directory-ში გადადი და ფეხბ.-ს დაუკავშირდი.

              [Directory-ის გახსნა]   ← CLUB only
```

Uses `<EmptyState>` from foundation, with role-aware description swap.

---

## Loading state

- Conversation list: 5 × `<SkeletonListItem />`.
- Active thread (no conversation selected): centred placeholder `<MessageCircleIcon size={48} className="text-muted-foreground/40" />` + "ჩატი არჩიე მარცხნივ".
- Thread loading messages: `<SkeletonCard className="max-w-[60%]" />` × 3 (alternating mr-auto / ml-auto).

---

## Error state

- Conversation list load fails: `<ErrorState variant=inline>` inside the sidebar.
- Thread load fails: `<ErrorState variant=inline>` in the thread pane with copy "შეტყობინებები ვერ ჩაიტვირთა — ინტერ. შეამოწმე".
- Send failure: per-message error chip + retry (see "Failed message" above).

---

## Mobile layout ⚑E ⚑H

Conversation list and active thread are two separate routes / views:

1. `/chat` — conversation list (full-screen).
2. `/chat/[id]` — active thread (full-screen, with back arrow → `/chat`).

Thread header collapses; CV / Profile links move into an overflow `<DropdownMenu>` triggered by `<MoreVerticalIcon />`.

Message input becomes full-width with `safe-area-inset-bottom` padding so it sits above the iOS home indicator.

---

## Annotations carried from wireframe

| ⚑   | Implementation note                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Textarea accepts newline with Shift+Enter; plain Enter submits. Max 2000 chars. Counter visible only when ≥ 80%.                         |
| B   | Attachment: PDF or image up to 10 MB. Upload via R2 presigned URL; message stores R2 key, not URL.                                       |
| C   | Real-time delivery: Pusher private channel `private-chat-[conversationId]`. Read receipts deferred (Phase 8).                            |
| D   | Presence: Pusher presence channel `presence-chat-[conversationId]`. Online when subscribed, offline on disconnect.                       |
| E   | Sidebar collapses to a back arrow on mobile (separate routes per spec above).                                                            |
| F   | Only CLUB can initiate a new conversation (from footballer detail). Footballers can only reply.                                          |
| G   | Unread badge count on header bell = sum of `unreadCount` across all conversations. Cleared on thread open.                               |
| H   | Mobile: either list OR thread, never both. Back arrow returns to list. Push notifications (Phase 8) drop the user into the right thread. |
