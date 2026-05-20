# Transactional email

Sport Visa sends transactional email via **[Resend](https://resend.com)** — a developer-focused
email API with reliable deliverability and an official Node/TypeScript SDK.

Wired in T1.8. The env contract lives in [`../.env.example`](../.env.example) and is validated
at boot by [`src/lib/env.ts`](../src/lib/env.ts).

---

## Email types

| Type                 | Trigger                                      | Template file                                   |
| -------------------- | -------------------------------------------- | ----------------------------------------------- |
| `welcome`            | User registration                            | `src/lib/email/templates/welcome.ts`            |
| `application_status` | Club accepts / rejects / shortlists a player | `src/lib/email/templates/application-status.ts` |
| `notification`       | Generic in-app notification fallback         | `src/lib/email/templates/notification.ts`       |

---

## Sending an email

### From server-side code (recommended)

Import the typed helpers from `src/lib/resend.ts`:

```ts
import { sendWelcomeEmail, sendApplicationStatusEmail, sendNotificationEmail } from '@/lib/resend';

// Welcome
await sendWelcomeEmail('player@example.com', {
  name: 'João Silva',
  appUrl: env.NEXT_PUBLIC_APP_URL,
});

// Application status
await sendApplicationStatusEmail('player@example.com', {
  playerName: 'João Silva',
  clubName: 'FC Example',
  status: 'accepted', // 'accepted' | 'rejected' | 'shortlisted'
  message: 'We would love to have you on trial next week.',
  appUrl: env.NEXT_PUBLIC_APP_URL,
});

// Generic notification
await sendNotificationEmail('player@example.com', {
  recipientName: 'João',
  subject: 'You have a new message',
  bodyHtml: '<p>FC Example sent you a message.</p>',
  bodyText: 'FC Example sent you a message.',
  ctaLabel: 'Read message',
  ctaUrl: `${env.NEXT_PUBLIC_APP_URL}/messages/123`,
  appUrl: env.NEXT_PUBLIC_APP_URL,
});
```

### Via the REST API

`POST /api/email/send` accepts a JSON body discriminated by the `type` field.

**Welcome email:**

```json
{
  "type": "welcome",
  "to": "player@example.com",
  "name": "João Silva"
}
```

**Application status:**

```json
{
  "type": "application_status",
  "to": "player@example.com",
  "playerName": "João Silva",
  "clubName": "FC Example",
  "status": "accepted",
  "message": "Optional message from the club."
}
```

**Generic notification:**

```json
{
  "type": "notification",
  "to": "player@example.com",
  "recipientName": "João",
  "subject": "You have a new message",
  "bodyHtml": "<p>FC Example sent you a message.</p>",
  "bodyText": "FC Example sent you a message.",
  "ctaLabel": "Read message",
  "ctaUrl": "https://sport-visa.example.com/messages/123"
}
```

**Response (200):**

```json
{ "id": "re_xxxxxxxxxxxx" }
```

---

## Adding a new email type

1. Create a template file in `src/lib/email/templates/` following the existing pattern
   (both `*Html` and `*Text` exports).
2. Add a typed send helper in `src/lib/resend.ts`.
3. If the email must be triggerable via the API, extend the discriminated union in
   `src/app/api/email/send/route.ts`.
4. Add the type to the table above.

---

## One-time setup

### 1. Create a Resend account and API key

[resend.com](https://resend.com) → API Keys → Create API key.
Scope it to **Sending** access only.
Copy the key (`re_xxxxxxxxxxxx`) into `RESEND_API_KEY`.

### 2. Verify your sending domain

Resend → Domains → Add Domain → follow the DNS instructions.
Without a verified domain the `RESEND_FROM` address will be rejected in production.

For local development use Resend's sandbox address `onboarding@resend.dev` — it
works without domain verification but only delivers to the account's verified email.

### 3. Set environment variables

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=no-reply@sport-visa.example.com
```

Both are optional at boot — the app keeps running without them — but any call into
`src/lib/resend.ts` will throw `INTERNAL` until they're set.

---

## Env vars

```env
RESEND_API_KEY=   # Resend API key (re_xxxxxxxxxxxx). Server-only.
RESEND_FROM=      # Verified sender address, e.g. no-reply@sport-visa.example.com
```

---

## Local development

Set `RESEND_FROM=onboarding@resend.dev` and a real API key from your Resend
account. Emails sent to any address will be delivered only to your Resend
account's verified email (sandbox behaviour).

To inspect sent emails without hitting Resend's API, check the **Emails** log
in the Resend dashboard.

---

## Structured log events

Every successful send logs at `info` level with a structured event name:

| Event                           | Fields                     |
| ------------------------------- | -------------------------- |
| `email_welcome_sent`            | `to`, `emailId`            |
| `email_application_status_sent` | `to`, `status`, `emailId`  |
| `email_notification_sent`       | `to`, `subject`, `emailId` |

Resend provides its own delivery webhooks for bounce / complaint handling —
out of scope for T1.8, tracked for a future task.
