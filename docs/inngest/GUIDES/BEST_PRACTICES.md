# Inngest Best Practices & Code Organization Guide

A comprehensive guide to organizing event-driven workflows, messaging patterns, and best practices when using Inngest in a modern TypeScript/Next.js application.

---

## 🚨 New to Inngest? Start Here First!

Before diving into this comprehensive guide, **read [PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md)** first. It covers:

- 14 critical production pitfalls based on common patterns
- Do's and Don'ts quick reference
- Battle-tested patterns from production experience

**Why start there?** Learning what NOT to do saves you more time than learning best practices.

---

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Project Structure](#project-structure)
3. [Event Naming Conventions](#event-naming-conventions)
4. [Workflow Patterns](#workflow-patterns)
5. [Error Handling & Reliability](#error-handling--reliability)
6. [Performance & Optimization](#performance--optimization)
7. [Testing & Observability](#testing--observability)
8. [Common Pitfalls](#common-pitfalls)

---

## Architecture Principles

### 1. **Event-Driven Architecture**

Inngest enables true event-driven systems by decoupling services. Key principles:

- **Decouple Services**: Don't call external services directly from API handlers. Emit events instead.
- **Asynchronous First**: Offload non-critical tasks to background functions.
- **Retryable Operations**: Structure functions as idempotent steps that can safely retry.

#### Example: API Response Stays Fast

```typescript
// ❌ SLOW: Direct call in handler
app.post("/api/signup", async (req, res) => {
  const user = await createUser(req.body);
  await sendWelcomeEmail(user); // Blocks response
  res.json({ success: true });
});

// ✅ FAST: Emit event, let Inngest handle email
app.post("/api/signup", async (req, res) => {
  const user = await createUser(req.body);

  await inngest.send({
    name: "app/auth.sign-up-welcome-email-function",
    data: { userId: user.id, email: user.email },
  });

  res.json({ success: true }); // Returns immediately
});
```

---

## Project Structure

### Recommended File Organization

```
src/
├── lib/
│   └── inngest.ts                    # Inngest client & event schema
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── events/                   # Workflow functions
│   │   │   ├── event-sign-up-welcome-email.ts
│   │   │   └── event-types.ts
│   │   ├── queries/
│   │   └── hooks/
│   ├── admin/
│   │   ├── events/                   # Workflow functions
│   │   │   ├── prepare-admin-digest.ts
│   │   │   ├── send-digest-email.ts
│   │   │   └── send-digest-discord.ts
│   │   ├── emails/                   # Email templates
│   │   │   └── send-email-admin-digest.tsx
│   │   └── utils/
│   ├── password/
│   │   ├── events/
│   │   ├── emails/
│   │   └── actions/
│   └── [feature]/
│       ├── events/                   # All workflow functions here
│       ├── emails/                   # Email utilities
│       ├── actions/
│       └── utils/
└── app/
    └── api/
        └── inngest/
            └── route.ts              # Inngest handler registration
```

### Benefits of This Structure

- **Co-location**: Workflows live with their feature domain
- **Discoverability**: All event handlers in one place
- **Scalability**: Easy to add new events to existing features
- **Maintenance**: Organize by business domain, not infrastructure

---

## Event Naming Conventions

### Naming Strategy

Use a **hierarchical, domain-based naming scheme**:

```
app/[feature].[action-or-resource]
```

### Convention Rules

1. **Use dot notation** for namespacing (not slashes)
2. **Start with `app/`** to distinguish application events
3. **Feature name** is the business domain
4. **Action** describes what happened (past tense is optional but clear)

### Examples

```typescript
// ✅ GOOD: Clear, hierarchical, domain-based
app/auth.sign-up-welcome-email-function
app/password.password-reset-function
app/admin-digest.ready
app/ticket.created
app/ticket.updated
app/comment.posted
app/payment.succeeded
app/order.shipped

// ❌ AVOID: Ambiguous or inconsistent
onSignUp                            // Too generic
user_signup_email                   // Underscore inconsistency
sendWelcomeEmail                    // Action-based (less flexible)
api.v1.auth.signup                  // Over-nested
```

### Event Type Definitions

Always define event types in the Inngest client:

```typescript
// src/lib/inngest.ts
export type Events = {
  "app/auth.sign-up-welcome-email-function": {
    data: {
      userId: string;
      email: string;
      name: string;
    };
  };
  "app/password.password-reset-function": {
    data: {
      userId: string;
      token: string;
      email: string;
    };
  };
  "app/admin-digest.ready": {
    data: {
      totalTickets: { total: number; totalSince: number };
      totalUsers: { total: number; totalSince: number };
      totalComments: { total: number; totalSince: number };
    };
  };
};

export const inngest = new Inngest({
  id: "ticket-bounty",
  schemas: new EventSchemas().fromRecord<Events>(),
});
```

---

## Workflow Patterns

### Pattern 1: Simple Event-Triggered Workflow

**Use case**: Single action triggered by an event (emails, notifications, webhooks)

```typescript
// src/features/auth/events/event-sign-up-welcome-email.ts
import { inngest } from "@/lib/inngest";
import { sendWelcomeEmail } from "../emails/send-welcome-email";

export type SignUpWelcomeEmailFunctionData = {
  data: {
    userId: string;
    email: string;
    name: string;
  };
};

export const eventSignUpWelcomeEmail = inngest.createFunction(
  {
    id: "sign-up-welcome-email",
    // Optional: concurrency control
    // concurrency: {
    //   key: "event.data.userId",
    //   limit: 5 // prevent email storms
    // }
  },
  { event: "app/auth.sign-up-welcome-email-function" },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    // Wrap all operations in steps for observability & retries
    const result = await step.run("send-welcome-email", async () => {
      return await sendWelcomeEmail({
        email,
        name,
      });
    });

    return {
      userId,
      emailSent: true,
      messageId: result.messageId,
    };
  },
);
```

### Pattern 2: Multi-Step Orchestration Workflow

**Use case**: Complex business processes requiring multiple steps, with rollbacks or compensations

```typescript
// src/features/ticket/events/event-process-ticket.ts
export const processTicketWorkflow = inngest.createFunction(
  { id: "process-ticket" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {
    const { ticketId, userId } = event.data;

    // Step 1: Validate ticket
    const ticket = await step.run("validate-ticket", async () => {
      return await prisma.ticket.findUnique({ where: { id: ticketId } });
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Step 2: Assign to team (with delay before assignment)
    await step.sleep("wait-for-assignment", "30s");

    const assignment = await step.run("assign-ticket", async () => {
      const availableTeamMember = await getAvailableTeamMember();
      return await assignTicket(ticketId, availableTeamMember.id);
    });

    // Step 3: Notify assignee
    await step.run("notify-assignee", async () => {
      return await sendNotification({
        userId: assignment.assignedTo,
        message: `Ticket #${ticket.number} assigned to you`,
      });
    });

    // Step 4: Update customer
    await step.run("notify-customer", async () => {
      return await sendCustomerEmail({
        to: ticket.customerEmail,
        message: "Your ticket has been assigned to our team",
      });
    });

    return { ticketId, assignedTo: assignment.assignedTo };
  },
);
```

### Pattern 3: Event Chaining with `sendEvent`

**Use case**: Trigger downstream workflows based on completion of earlier steps

```typescript
// src/features/admin/events/prepare-admin-digest.ts
export const eventPrepareAdminDigest = inngest.createFunction(
  {
    id: "prepare-admin-digest",
  },
  { cron: "0 0 * * *" }, // Every day at midnight
  async ({ step }) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Gather data in parallel steps
    const [totalTickets, totalUsers, totalComments] = await Promise.all([
      step.run("count-tickets", async () => {
        const total = await prisma.ticket.count();
        const totalSince = await prisma.ticket.count({
          where: { createdAt: { gte: since } },
        });
        return { total, totalSince };
      }),
      step.run("count-users", async () => {
        const total = await prisma.user.count();
        const totalSince = await prisma.user.count({
          where: { createdAt: { gte: since } },
        });
        return { total, totalSince };
      }),
      step.run("count-comments", async () => {
        const total = await prisma.ticketComment.count();
        const totalSince = await prisma.ticketComment.count({
          where: { createdAt: { gte: since } },
        });
        return { total, totalSince };
      }),
    ]);

    // Trigger downstream workflows
    await step.sendEvent("emit-digest-ready", {
      name: "app/admin-digest.ready",
      data: {
        totalTickets,
        totalUsers,
        totalComments,
      },
    });
  },
);
```

```typescript
// src/features/admin/events/send-digest-email.ts
export const eventSendAdminDigestEmail = inngest.createFunction(
  {
    id: "send-admin-digest-email",
  },
  { event: "app/admin-digest.ready" },
  async ({ event, step }) => {
    const { totalTickets, totalUsers, totalComments } = event.data;

    await step.run("send-digest-email", async () => {
      return await sendEmailAdminDigest({
        totalTickets,
        totalUsers,
        totalComments,
      });
    });

    return { success: true };
  },
);

// Send to Discord simultaneously
export const eventSendAdminDigestDiscord = inngest.createFunction(
  {
    id: "send-admin-digest-discord",
  },
  { event: "app/admin-digest.ready" },
  async ({ event, step }) => {
    const { totalTickets, totalUsers, totalComments } = event.data;

    await step.run("send-discord-message", async () => {
      return await sendDiscordAdminDigest({
        totalTickets,
        totalUsers,
        totalComments,
      });
    });

    return { success: true };
  },
);
```

### Pattern 4: Wait for External Events

**Use case**: Long-running workflows that wait for external input (user action, webhook, payment)

```typescript
export const onboardUserWorkflow = inngest.createFunction(
  { id: "onboard-user" },
  { event: "app/auth.sign-up-welcome-email-function" },
  async ({ event, step }) => {
    const { userId, email } = event.data;

    // Step 1: Send verification email
    await step.run("send-verification-email", async () => {
      return await sendVerificationEmail(email);
    });

    // Step 2: Wait for email verification (up to 7 days)
    const verified = await step.waitForEvent("wait-for-verification", {
      event: "app/auth.email-verified",
      timeout: "7d",
      if: "async.data.userId == event.data.userId",
    });

    if (!verified) {
      // Timeout: send reminder
      await step.run("send-reminder-email", async () => {
        return await sendReminderEmail(email);
      });
      return { status: "timeout" };
    }

    // Step 3: Complete onboarding
    await step.run("setup-account", async () => {
      return await setupUserAccount(userId);
    });

    return { status: "completed" };
  },
);
```

---

## Error Handling & Reliability

### 1. **Structured Error Handling**

Always wrap operations in steps and handle errors explicitly:

```typescript
export const reliableWorkflow = inngest.createFunction(
  { id: "reliable-workflow" },
  { event: "app/payment.created" },
  async ({ event, step }) => {
    try {
      const result = await step.run("process-payment", async () => {
        // Inngest automatically retries this step on error
        return await processPayment(event.data.paymentId);
      });

      return { success: true, result };
    } catch (error) {
      // Log structured error
      logger.error(
        {
          paymentId: event.data.paymentId,
          error: error instanceof Error ? error.message : String(error),
        },
        "Payment processing failed",
      );

      // Rethrow to trigger Inngest's built-in retry mechanism
      throw error;
    }
  },
);
```

### 2. **Global Failure Handler**

Set up a centralized handler for all function failures:

```typescript
// src/lib/inngest.ts
export const handleAnyFunctionFailure = inngest.createFunction(
  { id: "handle-any-fn-failure" },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {
    await step.run("log-failure", async () => {
      logger.error(
        {
          functionId: event.data.function_id,
          runId: event.data.run_id,
          error: event.data.error,
          eventData: event.data,
        },
        "Inngest function failed",
      );

      // Optional: Send alert to Slack, PagerDuty, etc.
      // await notifyOncall(event.data);
    });
  },
);
```

### 3. **Idempotency Keys**

Design functions to be idempotent (safe to retry):

```typescript
export const safePaymentWorkflow = inngest.createFunction(
  { id: "safe-payment" },
  { event: "app/payment.created" },
  async ({ event, step }) => {
    const paymentId = event.data.paymentId;

    await step.run("charge-card", async () => {
      // Check if already charged
      const existing = await prisma.charge.findUnique({
        where: { paymentId },
      });

      if (existing) {
        return existing; // Already processed
      }

      // Charge with idempotency key
      return await stripe.charges.create({
        amount: event.data.amount,
        idempotency_key: paymentId, // Prevents duplicate charges
      });
    });
  },
);
```

---

## Performance & Optimization

### 1. **Concurrency Control**

Prevent resource exhaustion with concurrency limits:

```typescript
export const emailWorkflow = inngest.createFunction(
  {
    id: "send-email-notification",
    concurrency: {
      key: "event.data.userId", // Group by user
      limit: 5, // Max 5 emails per user simultaneously
    },
  },
  { event: "app/notification.email" },
  async ({ event, step }) => {
    return await step.run("send-email", async () => {
      return await sendEmail(event.data.email);
    });
  },
);
```

### 2. **Batching & Debouncing**

For high-volume events, batch processing:

```typescript
export const batchedDigestWorkflow = inngest.createFunction(
  { id: "batched-digest" },
  { cron: "0 * * * *" }, // Every hour
  async ({ step }) => {
    const pending = await step.run("fetch-pending", async () => {
      return await prisma.notification.findMany({
        where: { sent: false },
        take: 1000, // Batch size
      });
    });

    await step.run("send-batch", async () => {
      return await sendBatchEmails(pending);
    });
  },
);
```

### 3. **Parallel Steps**

Execute independent operations concurrently:

```typescript
export const parallelWorkflow = inngest.createFunction(
  { id: "parallel-workflow" },
  { event: "app/order.created" },
  async ({ event, step }) => {
    // Run all these in parallel
    const [inventory, payment, shipping] = await Promise.all([
      step.run("check-inventory", async () => {
        return await checkInventory(event.data.items);
      }),
      step.run("process-payment", async () => {
        return await stripe.charges.create({
          /* ... */
        });
      }),
      step.run("book-shipping", async () => {
        return await bookShipping(event.data.address);
      }),
    ]);

    return { inventory, payment, shipping };
  },
);
```

### 4. **Delays & Backoff**

Strategically delay operations:

```typescript
export const delayedNotificationWorkflow = inngest.createFunction(
  { id: "delayed-notification" },
  { event: "app/payment.pending" },
  async ({ event, step }) => {
    // Wait 24 hours before reminding
    await step.sleep("remind-later", "24h");

    await step.run("send-reminder", async () => {
      return await sendReminder(event.data.userId);
    });
  },
);
```

---

## Testing & Observability

### 1. **Function Naming for Clarity**

Use descriptive IDs and names:

```typescript
export const eventSignUpWelcomeEmail = inngest.createFunction(
  {
    id: "sign-up-welcome-email", // Machine-readable
    name: "Send Welcome Email on Sign Up", // Human-readable (optional)
  },
  { event: "app/auth.sign-up-welcome-email-function" },
  async ({ event, step }) => {
    // ...
  },
);
```

### 2. **Step Naming for Debugging**

Use clear, specific step names:

```typescript
export const debuggableWorkflow = inngest.createFunction(
  { id: "order-processing" },
  { event: "app/order.created" },
  async ({ event, step }) => {
    // ✅ GOOD: Specific, actionable
    const inventory = await step.run(
      "check-inventory-availability",
      async () => {
        return await checkInventory(event.data.items);
      },
    );

    // ❌ AVOID: Too generic
    // const result = await step.run("check", async () => { ... });

    const payment = await step.run("charge-payment-method", async () => {
      return await chargePayment(event.data.paymentId);
    });

    const shipping = await step.run("book-shipping-label", async () => {
      return await bookShipping(event.data.address);
    });
  },
);
```

### 3. **Logging Context**

Integrate structured logging for observability:

```typescript
import logger from "@/lib/logger";

export const observableWorkflow = inngest.createFunction(
  { id: "observable-workflow" },
  { event: "app/signup.completed" },
  async ({ event, step }) => {
    const userId = event.data.userId;

    logger.info(
      { userId, event: "workflow_started" },
      "Starting onboarding workflow",
    );

    try {
      const result = await step.run("send-welcome", async () => {
        logger.debug({ userId }, "Sending welcome email");
        return await sendWelcomeEmail(userId);
      });

      logger.info(
        { userId, messageId: result.messageId },
        "Welcome email sent successfully",
      );

      return result;
    } catch (error) {
      logger.error(
        {
          userId,
          error: error instanceof Error ? error.message : String(error),
        },
        "Workflow failed",
      );
      throw error;
    }
  },
);
```

---

## Common Pitfalls

> **📖 For a comprehensive guide to production pitfalls with illustrative examples and typical impacts, see [PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md)**

### ❌ **Pitfall 1: Not Using Steps**

**Common impact:** Significant revenue loss due to payment processing failures

```typescript
// ❌ BAD: No steps = no retries, no observability
export const badWorkflow = inngest.createFunction(
  { id: "bad-workflow" },
  { event: "app/test" },
  async ({ event }) => {
    const data = await fetchData(); // Direct call, not wrapped
    return data;
  },
);

// ✅ GOOD: Wrapped in steps
export const goodWorkflow = inngest.createFunction(
  { id: "good-workflow" },
  { event: "app/test" },
  async ({ event, step }) => {
    const data = await step.run("fetch-data", async () => {
      return await fetchData();
    });
    return data;
  },
);
```

### ❌ **Pitfall 2: Blocking API Responses**

**Common impact:** Response time improvements: 5s → 180ms (96%), conversion rate improvements: 94% → 99.8%

```typescript
// ❌ BAD: Wait for email to complete
app.post("/signup", async (req, res) => {
  const user = await createUser(req.body);
  await sendWelcomeEmail(user); // Blocks!
  res.json({ success: true });
});

// ✅ GOOD: Fire and forget
app.post("/signup", async (req, res) => {
  const user = await createUser(req.body);
  inngest.send({ name: "app/auth.sign-up", data: { userId: user.id } });
  res.json({ success: true });
});
```

### ❌ **Pitfall 3: Ignoring Timeouts**

**Common impact:** Resource leaks, zombie processes, workflows running forever

```typescript
// ❌ BAD: Infinite wait
const event = await step.waitForEvent("wait", {
  event: "app/payment.succeeded",
  // No timeout!
});

// ✅ GOOD: Always set timeout
const event = await step.waitForEvent("wait", {
  event: "app/payment.succeeded",
  timeout: "24h", // Explicit timeout
});
```

### ❌ **Pitfall 4: Overloading Single Event**

**Common impact:** Hard to maintain, debug, and enable/disable features independently

```typescript
// ❌ BAD: Too much responsibility
// app/user.created does too much: email, SMS, Slack, webhook
await inngest.send({
  name: "app/user.created",
  data: { userId },
});

// ✅ GOOD: Domain-specific events
await inngest.send({
  name: "app/auth.sign-up-welcome-email-function",
  data: { userId, email },
});
await inngest.send({
  name: "app/admin.user-created-notification",
  data: { userId },
});
```

### ❌ **Pitfall 5: Not Defining Event Types**

**Common impact:** Bugs discovered in production instead of compile time

```typescript
// ❌ BAD: No type safety
inngest.send({
  name: "app/payment.completed",
  data: {
    /* anything goes */
  },
});

// ✅ GOOD: Strongly typed
type Events = {
  "app/payment.completed": {
    data: {
      paymentId: string;
      amount: number;
      currency: string;
    };
  };
};

export const inngest = new Inngest({
  id: "app",
  schemas: new EventSchemas().fromRecord<Events>(),
});
```

**See [PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md) for 9 more production pitfalls with detailed explanations and real-world costs.**

---

## Inngest Handler Registration

All functions must be registered in your API route:

```typescript
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { eventPrepareAdminDigest } from "@/features/admin/events/prepare-admin-digest";
import { eventSendAdminDigestDiscord } from "@/features/admin/events/send-digest-discord";
import { eventSendAdminDigestEmail } from "@/features/admin/events/send-digest-email";
import { eventSignUpWelcomeEmail } from "@/features/auth/events/event-sign-up-welcome-email";
import { eventPasswordReset } from "@/features/password/events/event-password-reset";
import { handleAnyFunctionFailure, inngest } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Always include failure handler
    handleAnyFunctionFailure,
    // Feature workflows
    eventPasswordReset,
    eventSignUpWelcomeEmail,
    eventPrepareAdminDigest,
    eventSendAdminDigestEmail,
    eventSendAdminDigestDiscord,
    // Add new functions here as features grow
  ],
});
```

---

## Key Takeaways

1. **Decouple with events**: Don't call external services from handlers; emit events.
2. **Organize by domain**: Group workflows with their features.
3. **Use clear naming**: Events and steps should tell you exactly what's happening.
4. **Wrap in steps**: Every operation needs a step for retries and observability.
5. **Handle errors globally**: Set up a centralized failure handler.
6. **Design for idempotency**: Ensure workflows are safe to retry.
7. **Optimize for concurrency**: Use limits to prevent resource exhaustion.
8. **Always set timeouts**: Long-running workflows need explicit timeout boundaries.
9. **Log structured data**: Make debugging and observability easier.
10. **Type your events**: Full type safety prevents bugs and improves DX.

---

## Next Steps

1. **Learn from mistakes:** Read [PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md) for real-world production pitfalls
2. **Study patterns:** Read [MESSAGING_PATTERNS.md](./MESSAGING_PATTERNS.md) for advanced workflows
3. **Organize code:** Read [ROUTING_ARCHITECTURE.md](./ROUTING_ARCHITECTURE.md) for scaling your route handler
4. **Quick reference:** Bookmark [CHEATSHEET.md](../QUICK_REFERENCE/CHEATSHEET.md) for daily use

---

## Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest TypeScript SDK](https://github.com/inngest/inngest-js)
- [Event-Driven Architecture Patterns](https://www.inngest.com/patterns)
- [Workflow Orchestration Best Practices](https://www.inngest.com/blog)
- **[PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md)** - Battle-tested production tips
