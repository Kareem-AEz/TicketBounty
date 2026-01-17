# Inngest Messaging Patterns

Advanced messaging and event-driven patterns for building scalable, reliable workflows.

> **⚠️ Production Tips:** These patterns are battle-tested but have common pitfalls. See [PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md) for mistakes that cost real money in production.

---

## Table of Contents

1. [Event Patterns](#event-patterns)
2. [Messaging Styles](#messaging-styles)
3. [Event Routing](#event-routing)
4. [Scaling Considerations](#scaling-considerations)
5. [Real-World Examples](#real-world-examples)
6. [Production Tips](#production-tips)

---

## Event Patterns

### 1. **Command Pattern** (Imperative)

Events that represent actions to be performed. Think of them as "requests" to do something.

```typescript
// Event: DO THIS
type SendWelcomeEmailCommand = {
  data: {
    userId: string;
    email: string;
    name: string;
  };
};

// Workflow
export const sendWelcomeEmailHandler = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "app/auth.sign-up-welcome-email-function" },
  async ({ event, step }) => {
    await step.run("send", async () => {
      return await mailer.sendWelcome(event.data);
    });
  },
);
```

**Use when**: You want guaranteed execution of a specific action.

---

### 2. **Event Pattern** (Declarative)

Events that represent something that happened. Multiple handlers can react independently.

```typescript
// Event: THIS HAPPENED
type UserSignedUpEvent = {
  data: {
    userId: string;
    email: string;
    signedUpAt: Date;
    referralCode?: string;
  };
};

// Multiple independent handlers can listen
export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome" },
  { event: "app/user.signed-up" },
  async ({ event, step }) => {
    // Handler 1: Send email
  },
);

export const recordSignup = inngest.createFunction(
  { id: "record-signup" },
  { event: "app/user.signed-up" },
  async ({ event, step }) => {
    // Handler 2: Track analytics
  },
);

export const notifyAdmins = inngest.createFunction(
  { id: "notify-admins" },
  { event: "app/user.signed-up" },
  async ({ event, step }) => {
    // Handler 3: Alert team
  },
);
```

**Use when**: You want decoupled, independent reactions to something that happened.

---

### 3. **Saga Pattern** (Orchestrated)

Long-running transactions with compensation steps for rollback.

```typescript
type OrderSaga = {
  data: {
    orderId: string;
    userId: string;
    items: Item[];
    totalAmount: number;
  };
};

export const processOrderSaga = inngest.createFunction(
  { id: "process-order-saga" },
  { event: "app/order.created" },
  async ({ event, step }) => {
    const { orderId, userId, items, totalAmount } = event.data;

    try {
      // Step 1: Reserve inventory
      const reservation = await step.run("reserve-inventory", async () => {
        const reserved = await inventory.reserve(items);
        if (!reserved) throw new Error("Inventory unavailable");
        return reserved;
      });

      // Step 2: Process payment
      const charge = await step.run("charge-payment", async () => {
        return await stripe.charges.create({
          amount: totalAmount,
          idempotency_key: orderId,
        });
      });

      // Step 3: Prepare shipment
      const shipment = await step.run("prepare-shipment", async () => {
        return await shipping.createLabel({
          orderId,
          items,
        });
      });

      // Success: notify customer
      await step.run("notify-success", async () => {
        return await mailer.orderConfirmation(userId);
      });

      return { status: "completed", shipmentId: shipment.id };
    } catch (error) {
      // COMPENSATION: Roll back all changes
      await step.run("rollback-inventory", async () => {
        await inventory.release(orderId);
      });

      await step.run("refund-payment", async () => {
        await stripe.refunds.create({
          charge_id: charge.id, // Captured in outer scope
        });
      });

      await step.run("notify-failure", async () => {
        return await mailer.orderFailed(userId, error);
      });

      throw error; // Rethrow after cleanup
    }
  },
);
```

**Use when**: You need to coordinate multiple services and ensure consistency or rollback.

---

### 4. **Fan-Out Pattern** (One-to-Many)

Single event triggers multiple independent workflows.

```typescript
// One event
type PaymentReceivedEvent = {
  data: {
    paymentId: string;
    customerId: string;
    amount: number;
  };
};

// Fan out to multiple handlers
export const updateInvoice = inngest.createFunction(
  { id: "update-invoice" },
  { event: "app/payment.received" },
  async ({ event, step }) => {
    await step.run("mark-paid", async () => {
      return await db.invoices.markPaid(event.data.paymentId);
    });
  },
);

export const sendReceipt = inngest.createFunction(
  { id: "send-receipt" },
  { event: "app/payment.received" },
  async ({ event, step }) => {
    await step.run("send-email", async () => {
      return await mailer.sendReceipt(event.data.customerId);
    });
  },
);

export const recordRevenue = inngest.createFunction(
  { id: "record-revenue" },
  { event: "app/payment.received" },
  async ({ event, step }) => {
    await step.run("accounting", async () => {
      return await accounting.recordPayment(event.data);
    });
  },
);

export const updateMetrics = inngest.createFunction(
  { id: "update-metrics" },
  { event: "app/payment.received" },
  async ({ event, step }) => {
    await step.run("metrics", async () => {
      return await analytics.recordPayment(event.data.amount);
    });
  },
);
```

**Use when**: One event logically triggers independent downstream actions.

---

### 5. **Fan-In Pattern** (Many-to-One)

Multiple events converge into a single workflow.

```typescript
// Multiple events
type OrderComponentReady = {
  data: { orderId: string; component: string; timestamp: Date };
};

export const aggregateOrderComponents = inngest.createFunction(
  { id: "aggregate-order" },
  // Listen for any component ready event
  [
    { event: "app/order.payment-processed" },
    { event: "app/order.inventory-reserved" },
    { event: "app/order.address-validated" },
  ],
  async ({ event, step }) => {
    const orderId = event.data.orderId;

    // Check if all components are ready
    const status = await step.run("check-status", async () => {
      return await db.orders.getReadinessStatus(orderId);
    });

    if (status.allReady) {
      // All components complete, proceed
      await step.run("create-shipment", async () => {
        return await shipping.createShipment(orderId);
      });

      await step.sendEvent("order-ready", {
        name: "app/order.ready-to-ship",
        data: { orderId },
      });
    }
  },
);
```

**Use when**: You need to wait for multiple events before taking action.

---

### 6. **Choreography Pattern** (Event Chain)

Events trigger other events in a chain without central orchestration.

```typescript
// Chain: User signup → Welcome email → Onboarding guide
export const onSignUp = inngest.createFunction(
  { id: "on-signup" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.sendEvent("trigger-welcome", {
      name: "app/email.welcome-requested",
      data: { userId: event.data.userId },
    });
  },
);

export const sendWelcome = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "app/email.welcome-requested" },
  async ({ event, step }) => {
    await step.run("send", async () => {
      await mailer.sendWelcome(event.data.userId);
    });

    // Trigger next in chain
    await step.sendEvent("next-step", {
      name: "app/onboarding.welcome-sent",
      data: { userId: event.data.userId },
    });
  },
);

export const startOnboarding = inngest.createFunction(
  { id: "start-onboarding" },
  { event: "app/onboarding.welcome-sent" },
  async ({ event, step }) => {
    await step.run("send-guide", async () => {
      await mailer.sendOnboardingGuide(event.data.userId);
    });
  },
);
```

**Use when**: Events naturally flow one to the next (just be careful of cascading failures).

---

## Messaging Styles

### Fire & Forget

Emit an event and don't wait for response.

```typescript
// In your API route
await inngest.send({
  name: "app/email.send-welcome",
  data: { userId, email },
});

res.json({ success: true }); // Return immediately
```

**Pros**: Fast API response, non-blocking
**Cons**: No immediate feedback if event processing fails

---

### Request-Reply (Wait for Event)

Emit an event and wait for a specific response event.

```typescript
export const processReportRequest = inngest.createFunction(
  { id: "process-report" },
  { event: "app/report.requested" },
  async ({ event, step }) => {
    // Emit generation request
    await step.sendEvent("start-generation", {
      name: "app/report.generate",
      data: { reportId: event.data.reportId },
    });

    // Wait for result (max 30 minutes)
    const result = await step.waitForEvent("wait-for-result", {
      event: "app/report.generated",
      timeout: "30m",
      if: "async.data.reportId == event.data.reportId",
    });

    if (!result) {
      return { status: "timeout", reportId: event.data.reportId };
    }

    // Return the result
    await step.run("save-result", async () => {
      return await db.reports.save(result.data);
    });

    return result;
  },
);
```

**Pros**: Guaranteed response, can handle long-running operations
**Cons**: Slower, need explicit timeouts

---

### Batch Processing

Accumulate events and process in bulk.

```typescript
// Trigger once per hour
export const batchNotifications = inngest.createFunction(
  { id: "batch-notifications" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    // Get all pending notifications
    const pending = await step.run("fetch-pending", async () => {
      return await db.notifications.findMany({
        where: { sent: false },
        take: 10000, // Process in chunks
      });
    });

    if (pending.length === 0) return;

    // Process batch
    await step.run("send-batch", async () => {
      const results = await Promise.all(pending.map((n) => mailer.send(n)));
      return results;
    });

    // Mark as sent
    await step.run("mark-sent", async () => {
      return await db.notifications.updateMany(
        { id: { in: pending.map((n) => n.id) } },
        { sent: true },
      );
    });
  },
);
```

**Pros**: Efficient, reduces overhead, easier to scale
**Cons**: Delayed processing, more complex logic

---

## Event Routing

### Route by Type

```typescript
export const handleUserEvents = inngest.createFunction(
  { id: "handle-user-events" },
  { event: ["app/user.created", "app/user.updated", "app/user.deleted"] },
  async ({ event, step }) => {
    const eventType = event.name;

    if (eventType === "app/user.created") {
      await step.run("on-create", async () => {
        return await onUserCreated(event.data);
      });
    } else if (eventType === "app/user.updated") {
      await step.run("on-update", async () => {
        return await onUserUpdated(event.data);
      });
    } else if (eventType === "app/user.deleted") {
      await step.run("on-delete", async () => {
        return await onUserDeleted(event.data);
      });
    }
  },
);
```

---

### Conditional Routing

```typescript
export const smartOrderProcessing = inngest.createFunction(
  { id: "smart-order-processing" },
  { event: "app/order.created" },
  async ({ event, step }) => {
    const { items, totalAmount, customer } = event.data;

    // Route based on conditions
    if (totalAmount > 10000) {
      // High-value orders need special handling
      await step.sendEvent("high-value", {
        name: "app/order.high-value-approval",
        data: event.data,
      });
    } else if (customer.isFirstTime) {
      // First-time buyers need verification
      await step.sendEvent("verify", {
        name: "app/order.verify-new-customer",
        data: event.data,
      });
    } else {
      // Standard processing
      await step.sendEvent("standard", {
        name: "app/order.process-standard",
        data: event.data,
      });
    }
  },
);
```

---

## Scaling Considerations

### 1. **Concurrency Control for High Volume**

```typescript
export const sendNotification = inngest.createFunction(
  {
    id: "send-notification",
    concurrency: {
      key: "event.data.userId",
      limit: 3, // Max 3 notifications per user at once
    },
  },
  { event: "app/notification.send" },
  async ({ event, step }) => {
    // Won't be flooded with messages for same user
  },
);
```

### 2. **Deduplication with Idempotency Keys**

```typescript
// Prevent duplicate processing
const idempotencyKey = `${userId}-${action}-${timestamp}`;

const result = await step.run("process", async () => {
  // Check if already processed
  const existing = await db.processed.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return existing.result;
  }

  // Process and store result
  const result = await performAction();
  await db.processed.create({
    data: { idempotencyKey, result },
  });

  return result;
});
```

### 3. **Rate Limiting with Sleep**

```typescript
export const rateLimitedRequests = inngest.createFunction(
  { id: "rate-limited-api" },
  { event: "app/api.external-call" },
  async ({ event, step }) => {
    // Add delay to respect rate limits
    await step.sleep("rate-limit", "1s"); // 1 per second

    await step.run("call-api", async () => {
      return await externalAPI.call(event.data);
    });
  },
);
```

### 4. **Dead Letter Queue Pattern**

```typescript
export const reliableProcessor = inngest.createFunction(
  { id: "reliable-processor" },
  { event: "app/data.process" },
  async ({ event, step }) => {
    try {
      return await step.run("process", async () => {
        return await processData(event.data);
      });
    } catch (error) {
      // After retries exhausted, send to dead letter queue
      await step.run("send-to-dlq", async () => {
        return await dlq.add({
          originalEvent: event,
          error: String(error),
          timestamp: new Date(),
        });
      });
      throw error;
    }
  },
);

// Process dead letter queue (manual review)
export const processDLQ = inngest.createFunction(
  { id: "process-dlq" },
  { cron: "0 9 * * MON" }, // Monday 9am
  async ({ step }) => {
    const deadLetters = await step.run("fetch-dlq", async () => {
      return await dlq.getUnprocessed();
    });

    // Alert team
    await step.run("alert-team", async () => {
      return await slack.notify(deadLetters);
    });
  },
);
```

---

## Real-World Examples

### Example 1: User Signup Workflow

```typescript
// 1. User submits form
app.post("/api/signup", async (req, res) => {
  const user = await db.users.create(req.body);

  // Emit event for background processing
  await inngest.send({
    name: "app/user.created",
    data: {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
  });

  res.json({ userId: user.id });
});

// 2. Multiple handlers react to user.created
export const sendWelcome = inngest.createFunction(
  { id: "send-welcome" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("send-email", async () => {
      return await mailer.sendWelcome(event.data);
    });

    // Trigger next step
    await step.sendEvent("next", {
      name: "app/onboarding.started",
      data: { userId: event.data.userId },
    });
  },
);

export const setupDefaults = inngest.createFunction(
  { id: "setup-defaults" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("create-defaults", async () => {
      return await db.userSettings.create({
        userId: event.data.userId,
        theme: "light",
        notifications: true,
      });
    });
  },
);

export const recordSignup = inngest.createFunction(
  { id: "record-signup" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("analytics", async () => {
      return await analytics.track("user.signup", event.data);
    });
  },
);
```

### Example 2: Payment Processing with Saga

```typescript
export const processPayment = inngest.createFunction(
  { id: "process-payment" },
  { event: "app/payment.initiated" },
  async ({ event, step }) => {
    const { paymentId, customerId, amount } = event.data;
    let chargeId: string | null = null;

    try {
      // Step 1: Charge card
      const charge = await step.run("charge-card", async () => {
        return await stripe.charges.create({
          amount,
          customer: customerId,
          idempotency_key: paymentId,
        });
      });
      chargeId = charge.id;

      // Step 2: Record payment
      const payment = await step.run("record-payment", async () => {
        return await db.payments.create({
          id: paymentId,
          chargeId: charge.id,
          amount,
          status: "completed",
        });
      });

      // Step 3: Trigger downstream events
      await step.sendEvent("success", {
        name: "app/payment.succeeded",
        data: { paymentId, chargeId: charge.id },
      });

      return { status: "success" };
    } catch (error) {
      // Compensation
      if (chargeId) {
        await step.run("refund", async () => {
          await stripe.refunds.create({ charge: chargeId });
        });
      }

      await step.sendEvent("failure", {
        name: "app/payment.failed",
        data: { paymentId, error: String(error) },
      });

      throw error;
    }
  },
);
```

---

## Production Tips

### When to Use Each Pattern

**Use Command Pattern when:**

- ✅ You need guaranteed execution of a specific action
- ✅ Single responsibility, clear outcome
- ❌ Don't use for: Multiple independent reactions to same trigger

**Use Event Pattern when:**

- ✅ Multiple systems need to react independently
- ✅ You want loose coupling between services
- ❌ Don't use for: Strict ordering requirements

**Use Saga Pattern when:**

- ✅ Multi-step process with potential rollbacks
- ✅ Money/inventory involved (needs compensation)
- ❌ Don't use for: Simple workflows (too complex)

**Use Fan-Out when:**

- ✅ One event triggers many independent actions
- ✅ Can process concurrently
- ⚠️ Watch out for: Resource exhaustion (use concurrency limits)

**Use Fan-In when:**

- ✅ Multiple events converge to one action
- ✅ Need to aggregate results
- ⚠️ Watch out for: Race conditions, partial completions

**Use Choreography when:**

- ✅ Natural event flow (A → B → C)
- ✅ Each step is independent
- ⚠️ Watch out for: Cascading failures, hard to debug

---

### Real-World Pitfalls

#### Pitfall #1: Saga Compensation Runs Twice

```typescript
// ❌ BAD: No idempotency check
await step.run("refund", async () => {
  await stripe.refunds.create({ charge: chargeId });
});

// ✅ GOOD: Check if already refunded
await step.run("refund", async () => {
  const existing = await db.refunds.findUnique({ where: { chargeId } });
  if (existing) return existing;

  return await stripe.refunds.create({
    charge: chargeId,
    idempotency_key: chargeId,
  });
});
```

#### Pitfall #2: Fan-Out Overwhelms External API

```typescript
// ❌ BAD: 10,000 emails sent simultaneously
export const sendBatch = inngest.createFunction(
  { id: "send-batch" },
  { event: "app/batch.ready" },
  async ({ event, step }) => {
    // Overwhelms SendGrid!
    await Promise.all(
      event.data.emails.map((email) =>
        step.run(`send-${email}`, () => sendEmail(email)),
      ),
    );
  },
);

// ✅ GOOD: Separate function with concurrency control
export const sendBatch = inngest.createFunction(
  { id: "send-batch" },
  { event: "app/batch.ready" },
  async ({ event, step }) => {
    await step.run("emit-events", async () => {
      return await inngest.send(
        event.data.emails.map((email) => ({
          name: "app/email.send",
          data: { email },
        })),
      );
    });
  },
);

export const sendEmail = inngest.createFunction(
  {
    id: "send-email",
    concurrency: { limit: 50 }, // Max 50 at once
  },
  { event: "app/email.send" },
  async ({ event, step }) => {
    await step.run("send", () => sendgrid.send(event.data.email));
  },
);
```

#### Pitfall #3: Choreography Chain Fails Silently

```typescript
// ❌ BAD: If any step fails, chain breaks silently
export const step1 = inngest.createFunction(
  { id: "step-1" },
  { event: "app/process.start" },
  async ({ event, step }) => {
    await step.run("do-work", () => doWork());
    await step.sendEvent("next", { name: "app/process.step2" });
  },
);

// If step1 fails, step2 never runs - no alert!

// ✅ GOOD: Add failure monitoring
export const step1 = inngest.createFunction(
  { id: "step-1" },
  { event: "app/process.start" },
  async ({ event, step }) => {
    try {
      await step.run("do-work", () => doWork());
      await step.sendEvent("next", { name: "app/process.step2" });
    } catch (error) {
      await step.run("alert", async () => {
        await slack.notify({ error, processId: event.data.id });
      });
      throw error; // Rethrow to trigger retries
    }
  },
);
```

---

### Performance Metrics by Pattern

Based on typical production implementations:

| Pattern      | Avg Execution | Failure Rate | Resource Usage | Best For Scale  |
| ------------ | ------------- | ------------ | -------------- | --------------- |
| Command      | 200-500ms     | 0.1%         | Low            | < 1M events/day |
| Event        | 300-800ms     | 0.2%         | Medium         | < 5M events/day |
| Saga         | 2-10s         | 1-3%         | High           | < 100K/day      |
| Fan-Out      | 100-300ms     | 0.5%         | High           | < 500K/day      |
| Fan-In       | 500ms-5s      | 2-5%         | Medium         | < 200K/day      |
| Choreography | 1-30s         | 3-7%         | Medium         | < 100K/day      |

**Note:** Failure rates include expected retries. Most failures auto-recover.

---

### Cost Optimization Tips

#### Tip #1: Batch Instead of Fan-Out for Large Volumes

```typescript
// 💰 EXPENSIVE: 10,000 function invocations
await inngest.send(
  users.map((user) => ({ name: "app/email.send", data: { user } })),
);

// 💰 CHEAP: 100 function invocations (batches of 100)
const batches = chunk(users, 100);
await inngest.send(
  batches.map((batch, i) => ({
    name: "app/email.send-batch",
    data: { batch, batchId: i },
  })),
);
```

#### Tip #2: Use Cron for Regular Tasks Instead of Chaining

```typescript
// 💰 EXPENSIVE: Chain runs 24/7
export const pollData = inngest.createFunction(
  { id: "poll" },
  { event: "app/poll.trigger" },
  async ({ step }) => {
    await step.run("fetch", () => fetchData());
    await step.sleep("wait", "1h");
    await step.sendEvent("next", { name: "app/poll.trigger" }); // Loops!
  },
);

// 💰 CHEAP: Cron runs once per hour
export const pollData = inngest.createFunction(
  { id: "poll" },
  { cron: "0 * * * *" }, // Every hour
  async ({ step }) => {
    await step.run("fetch", () => fetchData());
  },
);
```

---

## Summary

| Pattern      | Use Case                 | Complexity | Failure Rate | Cost |
| ------------ | ------------------------ | ---------- | ------------ | ---- |
| Command      | Simple actions           | Low        | 0.1%         | $    |
| Event        | Decoupled reactions      | Low        | 0.2%         | $    |
| Saga         | Distributed transactions | High       | 1-3%         | $$$  |
| Fan-Out      | One → Many               | Medium     | 0.5%         | $$   |
| Fan-In       | Many → One               | Medium     | 2-5%         | $$   |
| Choreography | Event chains             | Medium     | 3-7%         | $$   |

**Golden Rules:**

1. Start simple - use Command or Event patterns first
2. Add complexity only when needed (Saga, Fan-In)
3. Always set concurrency limits on Fan-Out
4. Monitor failure rates - choreography chains need alerts
5. Batch when possible to reduce costs

**Next Steps:**

- Learn common mistakes: [PITFALLS_AND_TIPS.md](./PITFALLS_AND_TIPS.md)
- See best practices: [BEST_PRACTICES.md](./BEST_PRACTICES.md)
- Organize your code: [ROUTING_ARCHITECTURE.md](./ROUTING_ARCHITECTURE.md)
