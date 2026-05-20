# Sport Visa

Sport Visa — პლატფორმა, რომელიც აკავშირებს ფეხბურთელებსა და კლუბებს.
A platform connecting footballers and clubs, with real-time chat, profile
discovery, newsfeed subscriptions, and admin-verified onboarding.

> **Status:** Phase 1 — Foundation. See `PROJECT_PLAN.md` for the full roadmap.

## Tech stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui
- **Backend**: Next.js Server Actions + Route Handlers
- **Database**: PostgreSQL 16 + Prisma
- **Auth**: NextAuth (Auth.js) — email + password
- **Storage**: Cloudflare R2
- **Real-time**: Pusher / Ably
- **Hosting**: Railway

## Setup

Requirements:

- Node.js **>= 20** (Node 22 recommended)
- npm 10+
- Docker (for the local Postgres container — see [Database](#database))

Clone and install:

```bash
git clone <repo-url> sport-visa
cd sport-visa
npm install
cp .env.example .env.local   # fill in any blanks before `npm run dev`
```

The `npm install` step also wires the git pre-commit hook via Husky.

## Environment variables

Every variable is documented in [`.env.example`](./.env.example) and validated
at boot by `src/lib/env.ts` (zod). Booting with a missing or malformed value
crashes the app immediately with a clear error — no silent fallbacks.

Secret sources by environment:

| Environment | Source                                                    |
| ----------- | --------------------------------------------------------- |
| Local dev   | `.env.local` (gitignored, copied from `.env.example`)     |
| CI          | GitHub Actions repository / environment secrets           |
| Production  | Railway service variables (set via the Railway dashboard) |

Rules:

- Never commit real secrets. All `.env*` files are gitignored except
  `.env.example`.
- Add any new variable to **both** `.env.example` (with a comment + safe
  placeholder) **and** the zod schema in `src/lib/env.ts`.
- Use the `NEXT_PUBLIC_` prefix only for values that are safe to ship to the
  browser — they are inlined into the client bundle at build time.

## Run

> Application scaffold lands in **T1.2**. Until then, only the toolchain
> scripts below are wired.

```bash
npm run lint         # ESLint over the project
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier — write
npm run format:check # Prettier — check only
npm run typecheck    # tsc --noEmit
```

Pre-commit hook runs `lint-staged` on staged files: ESLint `--fix` plus
Prettier `--write` for code, Prettier for `*.{json,md,yml,yaml,css}`.

## Database

Local development uses PostgreSQL 16 via docker-compose. Prisma is the ORM;
the schema lives at [`prisma/schema.prisma`](./prisma/schema.prisma) and the
client singleton at [`src/lib/db.ts`](./src/lib/db.ts).

Start the local Postgres and run the initial migration:

```bash
docker compose up -d           # start Postgres 16 on localhost:5432
npm run db:migrate             # apply migrations (creates one on first run)
npm run db:studio              # browse data at http://localhost:5555
```

Other scripts:

```bash
npm run db:generate            # regenerate Prisma Client after schema edits
npm run db:push                # push schema without creating a migration (dev only)
npm run db:reset               # drop + recreate the database, then re-apply migrations
npm run db:migrate:deploy      # apply pending migrations (CI / prod)
```

`DATABASE_URL` is loaded from `.env.local` for every `db:*` script via
`dotenv-cli`. Production gets `DATABASE_URL` from Railway service variables;
CI gets it from GitHub Actions secrets.

## Observability

Structured logging (pino), request tracing, and Sentry error tracking are
wired in `T1.5`. See [`docs/observability.md`](./docs/observability.md) for
log levels, retention, the standard error JSON shape, and the request-ID
flow. All three degrade gracefully when their env vars are unset.

## Test

> Test runners land in later Phase 1 tasks (T1.5+ for unit/integration,
> Playwright for E2E). Once present:

```bash
npm test            # unit + integration (vitest)
npm run test:e2e    # Playwright E2E
```

Coverage gate: minimum 70% line coverage on services. CI enforces.

## Project structure

```
sport-visa/
├── src/                # application code (added in T1.2)
├── prisma/             # schema.prisma + generated migrations
├── docker-compose.yml  # local Postgres 16
├── PROJECT_PLAN.md     # roadmap, phases, acceptance criteria
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc.json
├── .editorconfig
└── .husky/             # git hooks
```

## Contributing

1. Branch off `master` using the task ID: `task/T<phase>.<n>-<short-slug>`
2. Run `npm run lint && npm run typecheck` before pushing
3. Open a PR; CI must be green

## License

Private — all rights reserved.
