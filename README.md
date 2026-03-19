<p align="center">
  <img src="public/og-image 1x.jpg" alt="The Road to Next" width="100%" />
</p>

<h1 align="center">Ticket Bounty</h1>

<p align="center">
  <strong>A high-fidelity, production-grade laboratory for modern full-stack development.</strong>
  <br />
  <em>Engineered for <a href="https://www.road-to-next.com" target="_blank">The Road to Next</a>.</em>
</p>

---

## 1. THE VISION (The Mental Model)

We view this application not just as a tool, but as a **High-Performance Vehicle** designed for endurance and speed. Every layer is an engineered component optimized to ensure the system never stalls, no matter how heavy the payload.

### The Core Loop

1.  **The Cockpit (Next.js 16 + React 19):** Where intent meets execution. We leverage **Server Components** for zero-bundle-size data fetching and **Server Actions** for seamless mutations.
2.  **The Cargo (PostgreSQL + Prisma 7):** Our persistent payload. **Prisma** acts as a type-safe manifest, ensuring data integrity from the database to the UI.
3.  **The Transmission (Inngest):** Handles the shifting. Heavy side-effects (emails, analytics, maintenance) are offloaded to an asynchronous event loop, keeping the main engine (the UI thread) responsive.
4.  **The Telemetry (PostHog + Seline):** The dashboard sensors. We track **Intent** and **Performance** in real-time to navigate the roadmap effectively.

---

## 2. THE ANATOMY (The Architecture)

Following our **Feature-First** philosophy, we encapsulate complexity within domains. This ensures the system is modular: if you remove a feature folder, you remove a capability, not the system's stability.

### Linear Flow

- **DATA SCHEMA (Prisma):** Defined in `schema.prisma`, forming the bedrock of our type-safety.
- **LOGIC & ACTIONS (Features):** Encapsulated in `src/features`. Each module contains its own **Server Actions**, **Queries**, and **Components**.
- **INTERFACE (Next.js App Router):** The entry point. Routes in `src/app` compose features into user journeys.
- **USER JOURNEY:** From secure **Lucia Auth** onboarding to **Multi-Tenant Organization** switching and **Optimistic Ticketing**.

---

## 3. THE ENGINE (The Tech Stack)

We only use tools that prioritize **Type Safety** and **Developer Velocity**.

### Framework & Language

- **Next.js 16 (Beta):** Utilizing the latest App Router features and enhanced caching.
- **React 19:** Powered by the **React Compiler** for automatic memoization and performance.
- **TypeScript 5:** Strict mode for ironclad reliability.

### Data & State

- **Prisma 7:** The next-gen ORM for type-safe database access.
- **React Query (TanStack):** Managing server state with optimistic updates and caching.
- **Nuqs:** Type-safe **URL as State** management for shareable filters and search.

### Storage & Media

- **Cloudflare R2 / S3:** Global object storage via AWS SDK v3 for high-speed media delivery.

### Infrastructure & Async

- **Inngest:** Durable execution engine for background jobs and event-driven logic.
- **Resend & React Email:** Designing and sending transactional emails as React components.

### Observability & SEO

- **PostHog:** Privacy-first product analytics and session replays.
- **Vercel Speed Insights:** Real-time performance monitoring.
- **Seline:** Lightweight, event-based telemetry.
- **JSON-LD Structured Data:** Automated SEO rich snippets for Organizations and Software Applications.

---

## 4. KEY CAPABILITIES

### 🎫 Smart Ticketing & Optimistic UI

We don't wait for the server. When a user creates a ticket or updates a bounty, **React Query** updates the UI instantly. The server action runs in the background, with automatic rollback on failure.

### 🏢 Enterprise-Grade Multi-Tenancy

Built-in support for **Organizations**.

- **Contextual Isolation:** Users switch between organizations seamlessly.
- **Membership & Roles:** Fine-grained access control managed through a custom membership layer.
- **Invitation System:** Robust invite flows with expiring tokens and email delivery.

### 🔐 Zero-Trust Authentication

A custom authentication system built with **Lucia Auth** and **Argon2**.

- **Session Ownership:** We own the session table, allowing for precise control over user identity.
- **Full Flow:** Email verification, password reset, and secure session management.

### 🤖 AI-Optimized Workflow

Utilizing the **Vercel AI SDK** and custom tooling like `convit`.

- **AI Commits:** Automated, high-quality commit messages generated based on code diffs.
- **Structured LLM Outputs:** Integration with OpenAI-compatible APIs for future AI-driven feature enhancements.

---

## 5. PROJECT TOUR (The Map)

```typescript
src/
├── app/                  // -- THE ROUTER (Navigation & Layouts) --
├── features/             // -- THE HEART (Domain Logic) --
│   ├── auth/             // Identity & Sessions
│   ├── ticket/           // Ticketing, Search, Bounties
│   ├── invitation/       // Team Onboarding
│   └── organizations/    // Multi-tenancy & Memberships
├── lib/                  // -- THE GLUE (Shared Infrastructure) --
│   ├── prisma.ts         // DB Engine
│   ├── aws.ts            // Storage Engine
│   ├── inngest.ts        // Event Engine
│   └── structured-data.ts // SEO Engine
├── components/           // -- THE UI (Reusable Atomic Units) --
└── emails/               // -- THE MESSENGER (Templates) --
```

---

## 6. THE LABORATORY (Getting Started)

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** (Local or Managed)
- **R2/S3 Credentials** (Optional for local dev)

### Setup

1.  **Clone & Install**

    ```bash
    git clone <repo-url>
    npm install
    ```

2.  **Environment Sync**

    ```bash
    cp .env.example .env.local
    ```

3.  **Database Ignition**

    ```bash
    npx prisma generate
    npx prisma db push
    npm run db:seed
    ```

4.  **Launch**
    ```bash
    npm run dev
    ```

### Engineering Commands

| Command               | Description                      |
| :-------------------- | :------------------------------- |
| `npm run commit`      | AI-powered high-fidelity commits |
| `npm run inngest:dev` | Local background job dashboard   |
| `npm run db:studio`   | GUI for database exploration     |
| `npm run type:check`  | Strict TypeScript validation     |

---

_Built with meticulous care by Kareem Ahmed._
