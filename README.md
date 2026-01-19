<p align="center">
  <img src="public/og-image 1x.jpg" alt="The Road to Next" width="100%" />
</p>

<h1 align="center">The Road to Next</h1>

<p align="center">
  <strong>A production-grade playground for building modern, scalable web applications with Next.js 16.</strong>
  <br />
  <em>Built as part of <a href="https://www.road-to-next.com" target="_blank">The Road to Next</a> by Robin Wieruch.</em>
</p>

---

## 1. The Mental Model

To understand how this application functions, we view it as a **High-Performance Vehicle** designed for the long haul. This architecture ensures every component drives us forward without stalling.

### The Core Loop
1.  **The Cockpit (Next.js 16 + React 19):** Where control meets logic. **Server Components** handle the heavy lifting (data fetching, security), while **Client Components** manage the steering (interactivity) to ensure a smooth ride.
2.  **The Cargo (PostgreSQL + Prisma):** Our persistent storage. We use **Prisma** to organize and secure the payload, acting as a type-safe manifest so nothing gets lost on the journey.
3.  **The Transmission (Inngest):** Handles the shifting. Heavy tasks—sending emails, processing digests, maintenance—are offloaded here. This keeps the engine (Main Thread) from stalling and ensures the UI remains responsive.
4.  **The Telemetry (PostHog):** The dashboard sensors. We track meaningful events and performance metrics to navigate effectively and understand how the machine is being handled.

---

## 2. The Tech Stack

We have chosen tools that prioritize **Developer Experience (DX)** and **Type Safety**.

### The Engine
*   **Next.js 16 (App Router):** The framework. We use the latest features like Server Actions for mutations.
*   **React 19:** Utilizing the new **React Compiler** for automatic optimization.
*   **TypeScript:** Strict mode is on. We rely on types to catch bugs before they run.

### Data & State
*   **Prisma ORM:** The single source of truth for our data schema.
    > *Educational Note:* We use Prisma's `schema.prisma` to define our data models. This generates a fully typed client (`db.user.findMany()`) so we never guess column names.
*   **PostgreSQL:** The robust relational database backing everything.
*   **React Query (TanStack):** Manages server state on the client. It handles caching, revalidation, and synchronization with the server.
*   **Nuqs:** Type-safe URL search parameters.
    > *Why?* Allows users to bookmark filtered views (e.g., `?status=OPEN&sort=desc`) because the state lives in the URL, not just React memory.

### Security & Identity
*   **Lucia Auth:** Used as a learning resource to build a custom authentication system from the ground up. Note: Lucia is deprecated; we use it here to understand the mechanics of session management and ownership of the auth database.
*   **Argon2:** Industry-standard password hashing.

### UI & UX
*   **Tailwind CSS 4:** The styling engine.
*   **Shadcn/ui:** Accessible, reusable components built on Radix Primitives.
*   **Motion:** Adds weight and physics to interactions.

### Async & Infrastructure
*   **Inngest:** Durable execution engine for background jobs (Email sending, etc.).
*   **Resend & React Email:** Designing and sending emails using React components.
*   **PostHog:** Privacy-focused product analytics.

---

## 3. Key Features

### Smart Ticketing
Not just a CRUD list.
*   **Rich Filters:** Filter by status, sort by bounty, search text—all synchronizing with the URL.
*   **Conversation Threads:** Robust commenting system attached to every ticket.

### Multi-Tenancy (Organizations)
Users aren't just islands.
*   **Organization Support:** Users can create organizations and manage memberships.
*   **Context Switching:** The UI adapts to the currently active organization context.

### Robust Authentication
*   **Full Flow:** Sign up, Sign in, Password Reset (via Email), and Email Verification.
*   **Session Management:** Secure, database-backed sessions built from scratch.

---

## 4. Project Tour (File Structure)

We use a **Feature-First** architecture. Instead of grouping files by type (controllers, views), we group them by **domain**.

```typescript
src/
├── app/                  // The Next.js Router
│   ├── (authenticated)/  // Routes requiring login
│   ├── api/              // Backend endpoints (Inngest, etc.)
│   └── ...
├── features/             // -- THE HEART OF THE APP --
│   ├── auth/             // Login, Register, Session logic
│   ├── ticket/           // Ticket CRUD, Search, Filter logic
│   ├── comment/          // Commenting logic
│   └── organizations/    // Org management logic
├── lib/                  // Shared utilities (The "Glue")
│   ├── prisma.ts         // DB Client
│   ├── inngest.ts        // Job Queue Client
│   └── posthog.ts        // Analytics Client
├── components/           // Shared UI (Buttons, Inputs)
└── emails/               // React Email templates
```

> **Pro Tip:** If you're looking for logic related to "Tickets", go to `src/features/ticket`. You'll find everything there: Server Actions, Components, and Hooks.

---

## 5. Getting Started

### Prerequisites
*   Node.js 18+
*   PostgreSQL Database (Local or provider like Neon)
*   Product keys (Resend, PostHog) or mock values for dev.

### Setup

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    cd the-road-to-next
    npm install
    ```

2.  **Environment Variables**
    ```bash
    cp .env.example .env.local
    ```
    *Fill in your `DATABASE_URL` and other keys.*

3.  **Database Initialization**
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Push Schema to DB
    npx prisma db push

    # Seed with dummy data (Users, Tickets, Comments)
    npm run db:seed
    ```

4.  **Run It**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`.

### Useful Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the dev server |
| `npm run db:studio` | GUI to inspect your database |
| `npm run email` | Preview email templates locally |
| `npm run commit` | Generate AI-powered commit messages |

---

## 6. Contributing

We follow a strict "Make it Nice" policy.
*   **Linting:** `npm run lint`
*   **Formatting:** `npm run format`
*   **Type Checking:** `npm run type`

*Built with care by Kareem Ahmed.*