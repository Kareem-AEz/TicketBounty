<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (Initial ratification)
Modified principles: None (initial creation)
Added sections:
  - Core Principles (7 principles)
  - Technology Stack section
  - Development Workflow section
  - Governance section
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns
  ✅ spec-template.md - User stories, requirements structure compatible
  ✅ tasks-template.md - Phase organization compatible
  ✅ agent-file-template.md - No conflicts
Follow-up TODOs: None
-->

# The Road to Next Constitution

## Core Principles

### I. Feature-Based Architecture

All code MUST be organized by domain/feature, not by file type. Each feature module contains its own actions, components, queries, hooks, types, and schemas. Shared utilities live in `lib/`, shared UI primitives in `components/ui/`.

**Rationale**: Feature-based organization keeps related code together, simplifies navigation, and enables independent feature development. When adding ticket functionality, everything lives in `features/ticket/`. This pattern scales better than type-based organization (all components together, all hooks together).

### II. Server-First Rendering

Server Components MUST be the default. Use `"use client"` directive only when necessary (interactivity, hooks, browser APIs). All mutations MUST use Server Actions—never API routes for form submissions.

**Rationale**: Server Components reduce client bundle size, enable direct database access, and improve performance. Server Actions provide type-safe mutations with automatic revalidation. This is the Next.js 16 App Router pattern.

### III. Type Safety Everywhere

TypeScript MUST be used for all code. Zod schemas MUST validate all external inputs (forms, API responses). Prisma client provides database type safety. Never use `any` without explicit justification.

**Rationale**: Type safety catches bugs at compile time, improves IDE support, and serves as documentation. The Prisma + Zod + TypeScript combination provides end-to-end type safety from database to UI.

### IV. React Query for Server State

All GET requests MUST use React Query for caching and synchronization. Mutations MUST use Server Actions with `useMutation` for optimistic updates. Cache invalidation MUST be explicit via `queryClient.invalidateQueries()`.

**Rationale**: React Query handles caching, background refetching, and optimistic updates. Combined with Server Actions, this provides instant UI feedback with automatic rollback on errors. See `REACT_QUERY_GUIDE.md` for patterns.

### V. URL State for Shareability

Search, filter, sort, and pagination state MUST live in URL search params using `nuqs`. Local component state is only for transient UI state (dropdowns open, modals visible). URL state enables shareable, bookmarkable views.

**Rationale**: URL state makes application state shareable and bookmarkable. Users can share filtered ticket views. Browser back/forward works correctly. See `NUQS_GUIDE.md` for implementation patterns.

### VI. Accessibility as Foundation

All interactive elements MUST be keyboard accessible. Semantic HTML MUST be used (buttons for actions, links for navigation). ARIA labels MUST be provided where semantic meaning is unclear. Focus indicators MUST be visible.

**Rationale**: Accessibility is not an afterthought—it's a core requirement. Good accessibility improves UX for everyone (keyboard users, screen reader users, power users who prefer keyboard navigation).

### VII. Clean Code Standards

ESLint and Prettier MUST pass before commits. Imports MUST be sorted (simple-import-sort). Unused imports MUST be removed. Components MUST follow established patterns in the codebase.

**Rationale**: Consistent code style reduces cognitive load, makes code reviews easier, and prevents style debates. Automated tooling enforces standards without manual effort.

## Technology Stack

All new code MUST use the established technology stack. Introducing new dependencies requires explicit justification.

**Core Framework**:
- Next.js 16 (App Router, Turbopack) — React framework
- React 19.2 (React Compiler enabled) — UI library
- TypeScript 5 — Type-safe JavaScript

**Database & ORM**:
- PostgreSQL — Primary database
- Prisma ORM — Type-safe database client and migrations

**Authentication**:
- Lucia Auth — Session-based authentication
- @node-rs/argon2 — Password hashing

**State Management**:
- React Query (TanStack Query) — Server state management
- React Hook Form — Client-side form handling
- nuqs — URL search params state
- Zod — Schema validation

**UI & Styling**:
- Tailwind CSS 4 — Utility-first CSS
- shadcn/ui — Component library (Radix primitives)
- Motion — Animation library
- next-themes — Dark/light mode
- Sonner — Toast notifications
- Lucide React — Icons

**Background Jobs & Email**:
- Inngest — Background job orchestration
- Resend — Transactional email
- React Email — Email templates

**Analytics**:
- PostHog — Product analytics (feature flags, experiments, events)

**Development Tools**:
- ESLint — Code linting
- Prettier — Code formatting
- Turbopack — Fast development builds

## Development Workflow

### Code Quality Gates

All code MUST pass these checks before merging:
1. `npm run type` — TypeScript compilation with no errors
2. `npm run lint` — ESLint with no errors or warnings
3. `npm run format:check` — Prettier formatting verified

### Feature Development Process

1. Create feature directory under `src/features/[feature-name]/`
2. Implement Server Actions in `actions/`
3. Create React Query hooks in `queries/` or `hooks/`
4. Build components in `components/`
5. Define Zod schemas in `schema.ts`
6. Export types in `types.ts`

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma db push` for development
3. Create migration for production: `npx prisma migrate dev`
4. Update seed data if needed: `npm run seed`

### PostHog Integration

Feature flags MUST be used sparingly and defined in a centralized location. Event tracking MUST use consistent naming conventions. Custom properties for persons or events referenced in multiple places MUST use constants/enums.

## Governance

This constitution supersedes all other practices. Amendments require:
1. Documentation of the proposed change and rationale
2. Review of impact on existing code and templates
3. Update of affected documentation and guides

All code reviews MUST verify compliance with these principles. Complexity beyond these patterns MUST be justified in PR descriptions.

For runtime development guidance, consult:
- `PROJECT.md` — Architecture and patterns
- `REACT_QUERY_GUIDE.md` — Server state patterns
- `docs/NUQS_GUIDE.md` — URL state management
- `docs/POSTHOG_GUIDE.md` — Analytics integration
- `docs/inngest/` — Background job patterns

**Version**: 1.0.0 | **Ratified**: 2026-01-12 | **Last Amended**: 2026-01-12
