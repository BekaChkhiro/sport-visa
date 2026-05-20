# Observability

Sport Visa ships with three observability primitives, all wired in T1.5:

1. **Structured logger** (`pino`) — JSON in production, pretty in dev.
2. **Request tracing** — every request carries an `x-request-id` from edge to
   handler to log line.
3. **Error tracking** (Sentry) — unhandled exceptions in server, edge, and
   client runtimes are captured automatically.

Everything degrades gracefully when secrets are absent: no `SENTRY_DSN` means
Sentry init is skipped, and `LOG_LEVEL` falls back to `debug` (dev) /
`info` (prod). The full env contract lives in [`../.env.example`](../.env.example)
and is validated at boot by [`src/lib/env.ts`](../src/lib/env.ts).

---

## Request ID flow

```
client ──► middleware ──► route handler / server component ──► logger
            │                                                   │
            │  generates UUID if x-request-id is missing,        │  pulls
            │  echoes header on the response                     │  the ID
            ▼                                                   ▼  from
   request.headers.set('x-request-id', id)                 AsyncLocalStorage
```

`src/middleware.ts` runs on every non-static request, stamps `x-request-id`,
and forwards it both downstream (so the handler sees it) and back to the
client (so curl/fetch can correlate a failed call with a server log line).

Inside route handlers wrapped with `apiHandler()`
(see [`src/lib/api-error.ts`](../src/lib/api-error.ts)), the ID is bound to an
`AsyncLocalStorage` slot. `logger.info(...)` automatically attaches the
`requestId` field — no need to thread it through call sites.

For ad-hoc reads:

```ts
import { getRequestId } from '@/lib/request-context';
const rid = getRequestId(); // string | undefined
```

---

## Log levels

We use the standard pino levels. Pick the lowest level that still answers the
question "what is this telling on-call?"

| Level   | When to use                                                                  |
| ------- | ---------------------------------------------------------------------------- |
| `fatal` | Process must exit. Boot-time misconfiguration, unrecoverable corruption.     |
| `error` | An operation failed and a human should investigate. Paired with Sentry.      |
| `warn`  | Degraded path: retry, fallback, partial result. No human action needed.      |
| `info`  | Significant lifecycle event: migration applied, job started, user signed up. |
| `debug` | Verbose dev diagnostics. Default in local dev, off in production.            |
| `trace` | Per-step instrumentation, only enabled when chasing a specific bug.          |

Set `LOG_LEVEL` in the environment to override the default. Production defaults
to `info`; local dev defaults to `debug`.

### Retention

| Environment | Sink                 | Retention                |
| ----------- | -------------------- | ------------------------ |
| Local dev   | stdout (pino-pretty) | session                  |
| CI          | GitHub Actions logs  | 90 days (GitHub default) |
| Production  | Railway log drain    | 7 days                   |
| Sentry      | issue + breadcrumbs  | 90 days (Team plan)      |

If you need anything beyond 7 days in production, forward Railway logs to a
log aggregator (Logflare, BetterStack) — don't extend retention by writing to
the database.

---

## Error response shape

All API responses for failures from Route Handlers wrapped with `apiHandler`
follow this shape:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Email is required",
    "requestId": "0d8f1e3a-7b9d-4f2c-8aef-2c4e9a8b9d1f",
    "details": { "field": "email" }
  }
}
```

Fields:

- `code` — one of `BAD_REQUEST | UNAUTHORIZED | FORBIDDEN | NOT_FOUND |
CONFLICT | VALIDATION | RATE_LIMITED | INTERNAL`. Maps 1:1 to an HTTP status
  via [`ApiError`](../src/lib/api-error.ts).
- `message` — human-readable, safe to surface to end users. ქართული in
  user-facing routes, English in admin/internal routes.
- `requestId` — the same `x-request-id` set by middleware. Also echoed in the
  response header.
- `details` — optional, structured. Used for validation field maps and similar.

Throw `ApiError` from inside a handler:

```ts
import { ApiError, apiHandler } from '@/lib/api-error';

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  if (!body.email) {
    throw new ApiError('VALIDATION', 'Email is required', {
      details: { field: 'email' },
    });
  }
  // ...
});
```

Anything else thrown (a TypeError, a Prisma error, a network blow-up) is:

1. Logged at `error` with the full stack.
2. Sent to Sentry via `captureException`.
3. Returned to the client as `{ code: 'INTERNAL', message: 'Internal server error' }`
   — never the raw error message.

---

## Sentry

Server, edge, and client all initialize in their respective entry points:

- `src/instrumentation.ts` — Node + Edge runtimes; also exports
  `onRequestError` so Next.js forwards unhandled route errors to Sentry.
- `src/instrumentation-client.ts` — browser SDK.
- `next.config.ts` — wraps the config with `withSentryConfig` only when
  `SENTRY_DSN` is set.

Sampling: 100% of traces in dev, 10% in production. PII is off by default —
call `Sentry.setUser({...})` explicitly when you need it.

Source maps upload at build time when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and
`SENTRY_PROJECT` are present (CI/CD only).
