# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Ticket Bounty is a single Next.js 16 (App Router) application with PostgreSQL (Prisma 7 ORM). No monorepo — one `package.json` at the root. See `README.md` for full tech stack and project tour.

### Running the application

- **Dev server:** `npm run dev` (port 3000)
- **Lint:** `npm run lint`
- **Type check:** `npm run type`
- **Format check:** `npm run format:check`
- See `package.json` scripts for all available commands.

### Database

- The app connects to PostgreSQL via `DATABASE_URL` (runtime) and `DIRECT_URL` (Prisma migrations/push).
- These are injected as environment secrets pointing to a remote Supabase instance.
- `prisma.config.ts` uses `DIRECT_URL`; `src/lib/prisma.ts` uses `DATABASE_URL`.
- Prisma client is generated to `src/generated/` (runs automatically via `postinstall`).
- **Do not run `npm run db:seed`** against the Supabase database — the seed script has a safety guard that aborts if the URL contains "supabase".
- For local development with Docker PostgreSQL, set `PROJECT_NAME=ticketbounty` when running `docker compose up`.

### Key gotchas

- `npm install` requires `--legacy-peer-deps` due to `@lucia-auth/adapter-prisma` peer dependency conflict with Prisma 7. The lockfile already accounts for this.
- The `docker-compose.yml` uses a `${PROJECT_NAME}` variable for the container name. Without it, the container name becomes `-db` which is invalid.
- The Prisma schema uses the `pg_trgm` PostgreSQL extension for text search indexes.
- Sign-up flow requires email verification (via Resend). For testing, use the seeded admin account (`admin@example.com`) which has `emailVerified` set. Check `prisma/seed.ts` for the default credential.

### Optional services (not required for core functionality)

- **Inngest** (background jobs): `npx inngest-cli@latest dev`
- **Resend** (email): requires `RESEND_API_KEY` env var
- **PostHog** (analytics): requires `NEXT_PUBLIC_POSTHOG_KEY` env var
