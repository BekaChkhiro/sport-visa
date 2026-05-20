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
- Docker (for the local Postgres container — added in T1.4)

Clone and install:

```bash
git clone <repo-url> sport-visa
cd sport-visa
npm install
```

The `npm install` step also wires the git pre-commit hook via Husky.

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
├── PROJECT_PLAN.md     # roadmap, phases, acceptance criteria
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc.json
├── .editorconfig
└── .husky/             # git hooks
```

## Contributing

1. Branch off `main` using the task ID: `task/T<phase>.<n>-<short-slug>`
2. Run `npm run lint && npm run typecheck` before pushing
3. Open a PR; CI must be green

## License

Private — all rights reserved.
