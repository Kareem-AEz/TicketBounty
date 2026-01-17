# Inngest Quick Reference

A fast lookup guide for common patterns and conventions in your codebase.

---

## Event Naming Quick Guide

```
app/[feature].[action]
```

| Feature      | Event Example                             | When to Use                |
| ------------ | ----------------------------------------- | -------------------------- |
| **auth**     | `app/auth.sign-up-welcome-email-function` | Welcome email after signup |
| **password** | `app/password.password-reset-function`    | Password reset requested   |
| **admin**    | `app/admin-digest.ready`                  | Daily digest data compiled |
| **ticket**   | `app/ticket.created`                      | New support ticket         |
| **payment**  | `app/payment.succeeded`                   | Payment processed          |
| **comment**  | `app/comment.posted`                      | New comment added          |

---

## Function Structure Template

```typescript
import { inngest } from "@/lib/inngest";
import { someService } from "../services/some-service";

export type YourEventData = {
  data: {
    userId: string;
    email: string;
    // Add your event fields
  };
};

export const eventYourFeature = inngest.createFunction(
  {
    id: "your-feature-action", // Machine-readable ID
    // Optional: concurrency control
    // concurrency: {
    //   key: "event.data.userId",
    //   limit: 5
    // }
  },
  { event: "app/feature.action" }, // Or: { cron: "0 0 * * *" }
  async ({ event, step }) => {
    // Wrap ALL operations in steps
    const result = await step.run("operation-name", async () => {
      return await someService.doSomething(event.data);
    });

    return result;
  },
);
```

---

## Common Triggers

```typescript
// Event-triggered
{
  event: "app/auth.signup";
}

// Cron-scheduled
{
  cron: "0 0 * * *";
} // Midnight daily

// Multiple events
{
  event: ["app/order.created", "app/order.updated"];
}
```

---

## Essential Patterns

### Send an Event (Fire & Forget)

```typescript
await inngest.send({
  name: "app/auth.sign-up-welcome-email-function",
  data: { userId, email, name },
});
```

### Wrap Operations in Steps

```typescript
const data = await step.run("fetch-user", async () => {
  return await database.getUser(userId);
});
```

### Wait for Another Event

```typescript
const payment = await step.waitForEvent("wait-for-payment", {
  event: "app/payment.succeeded",
  timeout: "24h",
  if: "async.data.userId == event.data.userId",
});
```

### Sleep/Delay

```typescript
await step.sleep("wait-24h", "24h");
```

### Run Multiple Steps in Parallel

```typescript
const [user, orders, settings] = await Promise.all([
  step.run("fetch-user", async () => getUserData()),
  step.run("fetch-orders", async () => getOrders()),
  step.run("fetch-settings", async () => getSettings()),
]);
```

### Chain Events (Event → Event)

```typescript
// In first workflow
await step.sendEvent("trigger-next", {
  name: "app/admin-digest.ready",
  data: { totalTickets, totalUsers, totalComments },
});

// Second workflow listens
{
  event: "app/admin-digest.ready";
}
```

---

## Concurrency Control

```typescript
// No limit (not recommended for high volume)
// Default: unlimited

// Per-user limit
concurrency: {
  key: "event.data.userId",
  limit: 5 // Max 5 concurrent jobs per user
}

// Global limit
concurrency: {
  key: "event.type",
  limit: 100 // Max 100 concurrent jobs total
}
```

---

## Error Handling

### Automatic Retries (Built-in)

```typescript
// Inngest automatically retries failed steps
const result = await step.run("risky-operation", async () => {
  return await externalAPI.call(); // If fails, Inngest retries
});
```

### Global Failure Handler

```typescript
// Register in src/lib/inngest.ts
export const handleAnyFunctionFailure = inngest.createFunction(
  { id: "handle-any-fn-failure" },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {
    await step.run("log-failure", async () => {
      logger.error(
        {
          functionId: event.data.function_id,
          error: event.data.error,
        },
        "Function failed",
      );
    });
  },
);
```

### Idempotent Operations

```typescript
// Check if already done
const existing = await prisma.charge.findUnique({ where: { paymentId } });
if (existing) return existing; // Safe to retry

// Or use idempotency keys
await stripe.charges.create({
  amount: 100,
  idempotency_key: paymentId, // Prevents duplicate charges
});
```

---

## Registration

All functions must be registered in the handler:

```typescript
// src/app/api/inngest/route.ts
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleAnyFunctionFailure, // Always first
    eventSignUpWelcomeEmail, // Auth features
    eventPasswordReset,
    eventPrepareAdminDigest, // Admin features
    eventSendAdminDigestEmail,
    eventSendAdminDigestDiscord,
    // Add new functions as you create them
  ],
});
```

---

## Checklist: Before Shipping a New Workflow

- [ ] Event is registered in `src/lib/inngest.ts` with type definition
- [ ] Event name follows `app/[feature].[action]` convention
- [ ] Function has a descriptive `id` (kebab-case)
- [ ] All operations wrapped in `step.run()`
- [ ] Long-running workflows have explicit timeouts
- [ ] Error cases are handled (throw or return error state)
- [ ] Function is registered in `src/app/api/inngest/route.ts`
- [ ] Concurrency limits added if handling high volume
- [ ] Step names are specific and actionable
- [ ] Test function locally with Inngest dev server

---

## Troubleshooting

| Issue                 | Likely Cause                          | Solution                                       |
| --------------------- | ------------------------------------- | ---------------------------------------------- |
| Function never runs   | Not registered in route handler       | Add to `serve({ functions: [...] })`           |
| No retries on failure | Operation not wrapped in `step.run()` | Use `step.run()` for all async operations      |
| Slow API response     | Waiting for email/external call       | Emit event, return immediately                 |
| Duplicate operations  | Missing idempotency key               | Add idempotency check or use `idempotency_key` |
| Function times out    | No explicit timeout set               | Add `timeout: "24h"` to `waitForEvent()`       |
| Can't find logs       | Wrong feature folder                  | Check `src/features/[feature]/events/`         |

---

## File Locations

```
src/
├── lib/inngest.ts                          ← Event schema & config
├── features/[feature]/
│   ├── events/
│   │   ├── event-*.ts                      ← Workflow functions
│   │   └── event-types.ts                  ← Type definitions
│   ├── emails/
│   │   └── send-*.tsx                      ← Email templates
│   └── actions/
│       └── *.ts                            ← Server actions
└── app/api/inngest/
    └── route.ts                            ← Handler registration
```

---

## Related Documentation

- **Full Guide**: See `INNGEST_BEST_PRACTICES.md`
- **Project Structure**: `PROJECT.md`
- **Inngest Docs**: https://www.inngest.com/docs
