# The Road to Next - Project Documentation

## 1. THE VISION (Mental Model)

This project is a **living laboratory** for modern full-stack development. It is not just a collection of code; it is a demonstration of how **Next.js 16**, **Server Components**, and **Distributed Systems** (via Inngest) come together to build resilient, scalable applications.

> **The Core Philosophy:** "Complexity should be encapsulated, not hidden." We expose the wires where it matters (e.g., explicit auth flows) but abstract the tedium (e.g., type-safe database queries).

---

## 2. THE ANATOMY (Architecture)

We view the application as a biological system:

### 🧠 The Brain (Next.js App Router)
The central nervous system. It decides what to render on the server (fast, secure) and what to ship to the client (interactive).
- **Server Components:** The default state. Used for fetching data and rendering static content.
- **Server Actions:** The muscles. They mutate data directly from the UI without API endpoints.

### 🗄️ The Memory (Prisma + PostgreSQL)
Our long-term storage.
- **Prisma:** The type-safe lens through which we view our data.
- **PostgreSQL:** The bedrock.

### ⚡ The Nervous System (Inngest)
Handles asynchronous impulses. When a user signs up, we don't block their request to send a welcome email. We fire a signal to Inngest, which handles the "heavy lifting" in the background, ensuring the UI remains snappy.

### 👁️ The Senses (PostHog)
Our observation deck. We don't just count page views; we track *intent*.
- **Events:** "Ticket Created", "Bounty Updated".
- **Session Replay:** Watching how users actually struggle with the UI.

---

## 3. THE TECH STACK (The Tools)

### Core Framework
*   **Next.js 16 (Beta):** The latest and greatest.
*   **React 19:** Utilizing the **React Compiler** for automatic memoization.
*   **TypeScript 5:** Strict mode enabled.

### Data & State
*   **Prisma ORM:** Database schema and client.
*   **React Query:** Server state management (caching, optimistic updates).
*   **Nuqs:** URL-driven state management (shareable filters).
*   **Zod:** The gatekeeper for data validation.

### Authentication & Security
*   **Lucia Auth:** Session-based authentication. We own the session table.
*   **Argon2:** Secure password hashing.

### Infrastructure & Async
*   **Inngest:** Durable background job execution.
*   **Resend:** Email delivery service.

### Analytics
*   **PostHog:** Product analytics and feature flags. (Replaces Umami).

---

## 4. FEATURE ARCHITECTURE (The "Feature-First" Pattern)

We organize code by **Domain**, not by **Type**.

```typescript
src/
├── features/
│   ├── auth/             // -- THE GATEKEEPER --
│   │   ├── actions/      // Server Actions (login, logout)
│   │   ├── components/   // UI (SignInForm)
│   │   └── utils/        // Auth helpers
│   ├── ticket/           // -- THE CORE PRODUCT --
│   │   ├── actions/      // upsertTicket, deleteTicket
│   │   └── queries/      // getTickets, getTicket
│   └── organizations/    // -- THE MULTI-TENANCY LAYER --
```

> **Why this matters:** If you delete the `features/ticket` folder, you delete the entire ticketing capability. It's modular, clean, and scalable.

---

## 5. DOCUMENTATION INDEX

### 📘 Deep Dives
*   **[PostHog Analytics Guide](docs/POSTHOG_GUIDE.md):** How we track events and handle privacy.
*   **[React Query Guide](REACT_QUERY_GUIDE.md):** Mastering server state and optimistic updates.
*   **[Nuqs Guide](docs/NUQS_GUIDE.md):** Managing state in the URL.
*   **[Inngest Guide](docs/inngest/DOCUMENTATION_SUMMARY.md):** Background jobs and event-driven architecture.

### 🛠️ Developer Guides
*   **[Structure Data](docs/STRUCTURED_DATA.md):** How we handle SEO rich snippets.

---

## 6. KEY CONCEPTS & PATTERNS

### A. The "Optimistic UI" Pattern
We don't wait for the server. When a user creates a ticket:
1.  **React Query** immediately updates the cache with the new ticket (temp ID).
2.  The UI updates instantly.
3.  The **Server Action** runs in the background.
4.  If it succeeds, the real data replaces the temp data.
5.  If it fails, the UI rolls back and shows an error toast.

### B. The "URL as State" Pattern (Nuqs)
We avoid `useState` for filters.
- **Wrong:** `const [search, setSearch] = useState('')`
- **Right:** `const [search, setSearch] = useQueryState('search')`
> This makes every filtered view shareable and bookmarkable.

### C. The "Event-Driven" Pattern (Inngest)
We decouple side effects from main actions.
- **Action:** User changes password.
- **Event:** `app/password.reset` is fired.
- **Listener:** Inngest function `send-password-reset-email` picks it up.

---

*Written with the "High-Fidelity" mindset: Clear, Educational, and Technically Accurate.*