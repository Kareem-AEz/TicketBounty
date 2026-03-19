# Inngest Cheat Sheet

One-page reference for the most common tasks and patterns.

> **⚠️ AVOID COSTLY MISTAKES:** Read [PITFALLS_AND_TIPS.md](../GUIDES/PITFALLS_AND_TIPS.md) for 14 common production pitfalls based on real-world patterns.

---

## 🔧 Basic Setup

### Define Event Types

```typescript
// src/lib/inngest.ts
import { Inngest, eventType, staticSchema } from "inngest";

export const featureActionEvent = eventType("app/feature.action", {
  schema: staticSchema<{
    userId: string;
    email?: string;
  }>(),
});

export const inngest = new Inngest({
  id: "ticket-bounty",
  checkpointing: { maxRuntime: "300s" },
});
```

### Create a Function

```typescript
// src/features/feature/events/event-action.ts
export const eventAction = inngest.createFunction(
  { id: "feature-action", triggers: [{ event: featureActionEvent }] },
  async ({ event, step }) => {
    const result = await step.run("do-something", async () => {
      return await someService.do(event.data);
    });
    return result;
  },
);
```

### Register Functions

```typescript
// src/app/api/inngest/route.ts
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleAnyFunctionFailure,
    eventAction,
    // ... other functions
  ],
});
```

---

## 📤 Triggering Events

### Send Event (Fire & Forget)

```typescript
await inngest.send(
  featureActionEvent.create({
    data: { userId: "123", email: "user@example.com" },
  }),
);
// Returns immediately - no wait for processing
```

### Send Multiple Events

```typescript
await inngest.send([
  eventOneEvent.create({ data: {...} }),
  eventTwoEvent.create({ data: {... }) },
]);
```

### Send Event from Workflow

```typescript
await step.sendEvent(
  "trigger-next",
  nextStepEvent.create({ data: { userId: event.data.userId } }),
);
```

---

## ⚙️ Step Operations

### Run Code with Retries

```typescript
const result = await step.run("operation-name", async () => {
  return await someAsyncFunction();
});
// Automatically retried on failure
```

### Sleep/Delay

```typescript
await step.sleep("wait-period", "24h"); // 24 hours
await step.sleep("wait-period", "5m"); // 5 minutes
await step.sleep("wait-period", "30s"); // 30 seconds
```

### Wait for Event

```typescript
const event = await step.waitForEvent("wait-name", {
  event: "app/payment.succeeded",
  timeout: "24h",
  if: "async.data.orderId == event.data.orderId",
});

if (!event) {
  // Timeout occurred
}
```

### Run in Parallel

```typescript
const [user, orders, settings] = await Promise.all([
  step.run("get-user", async () => getUser()),
  step.run("get-orders", async () => getOrders()),
  step.run("get-settings", async () => getSettings()),
]);
```

---

## 🎯 Triggers

### Event-Triggered

```typescript
{
  event: "app/feature.action";
}
```

### Scheduled (Cron)

```typescript
{
  cron: "0 0 * * *";
} // Midnight daily
{
  cron: "0 9 * * MON";
} // Monday 9am
{
  cron: "0 * * * *";
} // Every hour
```

### Multiple Events

```typescript
{
  event: ["app/one", "app/two", "app/three"];
}
```

---

## 🛡️ Error Handling

### Global Failure Handler

```typescript
export const handleAnyFunctionFailure = inngest.createFunction(
  {
    id: "handle-any-fn-failure",
    triggers: [{ event: inngestFunctionFailedEvent }],
  },
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

### Try-Catch in Function

```typescript
try {
  const result = await step.run("risky-op", async () => {
    return await riskyOperation();
  });
  return result;
} catch (error) {
  logger.error(error, "Operation failed");
  throw error; // Rethrow to trigger Inngest retries
}
```

### Idempotent Check

```typescript
const existing = await db.processed.findUnique({
  where: { idempotencyKey },
});
if (existing) return existing; // Safe to retry

// Process new...
await db.processed.create({ data: { idempotencyKey, result } });
```

---

## ⚡ Performance

### Concurrency Control

```typescript
{
  id: "send-email",
  concurrency: {
    key: "event.data.userId",  // Group by user
    limit: 5                    // Max 5 per user
  }
}
```

### Batch Processing

```typescript
{
  cron: "0 * * * *";
} // Run hourly

const pending = await step.run("fetch", async () => {
  return await db.notifications.findMany({
    where: { sent: false },
    take: 1000, // Process in batches
  });
});
```

---

## 🗂️ File Organization

```
src/
├── lib/inngest.ts                         ← Event types
│
├── features/feature/
│   ├── events/
│   │   ├── event-*.ts                     ← Functions
│   │   └── event-types.ts                 ← Types
│   ├── emails/
│   │   └── send-*.tsx                     ← Email templates
│   ├── actions/
│   │   └── *.ts                           ← Server actions
│   └── queries/
│       └── *.ts                           ← Queries
│
└── app/api/inngest/
    └── route.ts                           ← Handler
```

---

## 📋 Event Naming

```
app/[feature].[action]
```

| Example                                   | Use Case           |
| ----------------------------------------- | ------------------ |
| `app/auth.sign-up-welcome-email-function` | Send welcome email |
| `app/ticket.created`                      | New ticket created |
| `app/comment.posted`                      | New comment posted |
| `app/payment.succeeded`                   | Payment processed  |
| `app/admin-digest.ready`                  | Digest compiled    |

---

## ✅ Before Shipping

**Critical (prevents common production issues):**

- [ ] All operations wrapped in `step.run()` (prevents revenue loss)
- [ ] Timeouts set on `waitForEvent()` (prevents zombie workflows)
- [ ] Idempotency keys for side effects (prevents duplicate charges)
- [ ] No blocking of API responses (prevents conversion drops)

**Important:**

- [ ] Event defined in `src/lib/inngest.ts` with types
- [ ] Function in `src/features/[feature]/events/`
- [ ] Function registered in `route.ts`
- [ ] Concurrency limits set if needed
- [ ] Error cases handled with logging
- [ ] Tested locally with `inngest dev`

**Nice to have:**

- [ ] Descriptive step names
- [ ] Structured logging added
- [ ] Documentation updated

---

## 🚨 Common Mistakes

> **💡 Common Production Patterns:** These mistakes represent typical issues teams face. See [PITFALLS_AND_TIPS.md](../GUIDES/PITFALLS_AND_TIPS.md) for 14 pitfalls with detailed examples and fixes.

### ❌ Not Wrapping in Steps

**Common Impact:** Lost payments, duplicate emails, data inconsistencies

```typescript
// BAD - No retries
const data = await fetchData();

// GOOD - Auto retries
const data = await step.run("fetch", async () => {
  return await fetchData();
});
```

### ❌ Blocking API Responses

**Common Impact:** 5s response times, conversion rate drops

```typescript
// BAD - Slow
app.post("/signup", async (req, res) => {
  const user = await createUser();
  await sendEmail(user); // Blocks!
  res.json(user);
});

// GOOD - Fast
app.post("/signup", async (req, res) => {
  const user = await createUser();
  inngest.send(emailSendEvent.create({ data: { userId: user.id } }));
  res.json(user);
});
```

### ❌ Missing Timeout

**Common Impact:** Resource leaks, zombie workflows

```typescript
// BAD - Could wait forever
const result = await step.waitForEvent("wait", {
  event: "app/payment.succeeded",
});

// GOOD - Explicit timeout
const result = await step.waitForEvent("wait", {
  event: "app/payment.succeeded",
  timeout: "24h",
});
```

### ❌ No Type Safety

**Common Impact:** Production bugs instead of compile-time errors

```typescript
// BAD - Anything goes
inngest.send(eventEvent.create({ data: {} }));

// GOOD - Type safe
import { eventType, staticSchema } from "inngest";

export const eventExample = eventType("app/event", {
  schema: staticSchema<{ userId: string }>(),
});

export const inngest = new Inngest({
  id: "ticket-bounty",
  checkpointing: {
    maxRuntime: "300s",
  },
});
```

### ❌ Not Idempotent Operations

**Common Impact:** Duplicate charges, customer complaints, refunds

```typescript
// BAD - Retries charge customer multiple times
await step.run("charge", async () => {
  return await stripe.charges.create({ amount });
});

// GOOD - Idempotency key prevents duplicates
await step.run("charge", async () => {
  return await stripe.charges.create({
    amount,
    idempotency_key: orderId, // Critical!
  });
});
```

---

## 🎯 Pattern Templates

### Simple Workflow

```typescript
export const simpleWorkflow = inngest.createFunction(
  { id: "simple", triggers: [{ event: featureActionEvent }] },
  async ({ event, step }) => {
    await step.run("do-it", async () => {
      return await doSomething(event.data);
    });
  },
);
```

### Multi-Step Workflow

```typescript
export const multiStep = inngest.createFunction(
  { id: "multi-step", triggers: [{ event: processStartEvent }] },
  async ({ event, step }) => {
    // Step 1
    const a = await step.run("step-1", async () => await doA());

    // Step 2
    const b = await step.run("step-2", async () => await doB(a));

    // Step 3
    const c = await step.run("step-3", async () => await doC(b));

    return { a, b, c };
  },
);
```

### Conditional Workflow

```typescript
export const conditional = inngest.createFunction(
  { id: "conditional", triggers: [{ event: orderCreatedEvent }] },
  async ({ event, step }) => {
    if (event.data.amount > 1000) {
      await step.sendEvent(
        "high-value",
        orderHighValueEvent.create({ data: event.data }),
      );
    } else {
      await step.sendEvent(
        "standard",
        orderStandardEvent.create({ data: event.data }),
      );
    }
  },
);
```

### Wait-Based Workflow

```typescript
export const waitBased = inngest.createFunction(
  { id: "wait-based", triggers: [{ event: orderCreatedEvent }] },
  async ({ event, step }) => {
    // Send confirmation
    await step.run("send-email", async () => {
      return await sendConfirmation(event.data);
    });

    // Wait for payment
    const payment = await step.waitForEvent("wait-payment", {
      event: "app/payment.succeeded",
      timeout: "24h",
      if: "async.data.orderId == event.data.orderId",
    });

    if (payment) {
      await step.run("ship", async () => {
        return await shipOrder(event.data.orderId);
      });
    } else {
      await step.run("cancel", async () => {
        return await cancelOrder(event.data.orderId);
      });
    }
  },
);
```

---

## 📞 Quick Links

- **⭐ MUST READ**: [PITFALLS_AND_TIPS.md](../GUIDES/PITFALLS_AND_TIPS.md) - Save $$ by learning from production mistakes
- **Docs**: [BEST_PRACTICES.md](../GUIDES/BEST_PRACTICES.md)
- **Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Patterns**: [MESSAGING_PATTERNS.md](../GUIDES/MESSAGING_PATTERNS.md)
- **Routing**: [ROUTING_ARCHITECTURE.md](../GUIDES/ROUTING_ARCHITECTURE.md)
- **For Your App**: [FOR_YOUR_PROJECT.md](../LEARNING/FOR_YOUR_PROJECT.md)

---

## 🔗 Time Conversions

```typescript
"1s"; // 1 second
"30s"; // 30 seconds
"1m"; // 1 minute
"5m"; // 5 minutes
"1h"; // 1 hour
"24h"; // 24 hours (1 day)
"7d"; // 7 days
"1w"; // 1 week
```

---

## 🎓 Learning Order

1. This cheat sheet
2. `INNGEST_SUMMARY.md` (overview)
3. `INNGEST_BEST_PRACTICES.md` (detailed)
4. `INNGEST_QUICK_REFERENCE.md` (lookup)
5. `INNGEST_MESSAGING_PATTERNS.md` (advanced)
6. `INNGEST_FOR_YOUR_PROJECT.md` (apply to app)

---

**Print this page and keep it handy!** 🚀
