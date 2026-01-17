# Inngest Documentation - Summary

You now have a comprehensive Inngest documentation suite. Here's what's included and how to use it.

---

## 📚 Documentation Files

### 1. **INNGEST_BEST_PRACTICES.md** (Comprehensive)

The main reference guide covering everything you need to know about Inngest:

- **Architecture principles** (event-driven, decoupling)
- **Project structure** (how to organize files by feature)
- **Event naming conventions** (hierarchical, domain-based)
- **Workflow patterns** (simple, multi-step, chaining, waiting)
- **Error handling** (retries, idempotency, global handlers)
- **Performance optimization** (concurrency, batching, parallelization)
- **Testing & observability** (logging, naming, debugging)
- **Common pitfalls** (anti-patterns to avoid)

**When to read**: Start here for deep understanding.

---

### 2. **INNGEST_QUICK_REFERENCE.md** (Lookup)

Fast lookup guide for common patterns:

- Event naming quick table
- Function structure template
- Common triggers (event, cron, multiple)
- Essential patterns with code snippets
- Concurrency control patterns
- Error handling patterns
- Registration checklist
- Troubleshooting guide
- File location reference

**When to read**: When you need to quickly look up syntax or patterns.

---

### 3. **INNGEST_MESSAGING_PATTERNS.md** (Advanced)

Deep dive into event-driven messaging patterns:

- **6 core patterns**: Command, Event, Saga, Fan-Out, Fan-In, Choreography
- **Messaging styles**: Fire & Forget, Request-Reply, Batch Processing
- **Event routing**: By type, conditional routing
- **Scaling considerations**: Concurrency, deduplication, rate limiting, DLQ
- **Real-world examples**: User signup, payment processing

**When to read**: When designing complex workflows or integrating new features.

---

## 🎯 Quick Start

### Step 1: Define Your Event

```typescript
// src/lib/inngest.ts
type Events = {
  "app/feature.action": {
    data: {
      userId: string;
      // your fields
    };
  };
};

export const inngest = new Inngest({
  id: "app-name",
  schemas: new EventSchemas().fromRecord<Events>(),
});
```

### Step 2: Create a Workflow Function

```typescript
// src/features/feature/events/event-action.ts
export const eventAction = inngest.createFunction(
  { id: "feature-action" },
  { event: "app/feature.action" },
  async ({ event, step }) => {
    const result = await step.run("do-something", async () => {
      return await doSomething(event.data);
    });
    return result;
  },
);
```

### Step 3: Register the Function

```typescript
// src/app/api/inngest/route.ts
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    eventAction,
    // other functions...
  ],
});
```

### Step 4: Emit Events

```typescript
// In your API route or server action
await inngest.send({
  name: "app/feature.action",
  data: { userId: "123" },
});
```

---

## 🏗️ Architecture at a Glance

```
┌─────────────────┐
│   API Handler   │  1. Handle request
└────────┬────────┘
         │
         │ inngest.send()
         ▼
┌─────────────────┐
│ Inngest Queue   │  2. Queue event
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Event-Triggered         │  3. Run workflow
│ Workflow Function       │
├─────────────────────────┤
│ • step.run()            │  ✓ Retries
│ • step.sleep()          │  ✓ Observability
│ • step.waitForEvent()   │  ✓ Durability
└─────────────────────────┘
```

---

## 📋 Common Tasks

### Sending an Email After User Signup

```typescript
// 1. Emit event on signup
app.post("/api/signup", async (req, res) => {
  const user = await db.users.create(req.body);
  await inngest.send({
    name: "app/auth.sign-up-welcome-email-function",
    data: { userId: user.id, email: user.email },
  });
  res.json({ success: true });
});

// 2. Workflow handles it
export const eventSignUpWelcome = inngest.createFunction(
  { id: "sign-up-welcome-email" },
  { event: "app/auth.sign-up-welcome-email-function" },
  async ({ event, step }) => {
    await step.run("send-email", async () => {
      return await mailer.sendWelcome(event.data);
    });
  },
);
```

### Running a Daily Task

```typescript
export const dailyDigest = inngest.createFunction(
  { id: "daily-digest" },
  { cron: "0 0 * * *" }, // Midnight every day
  async ({ step }) => {
    const data = await step.run("gather-data", async () => {
      return await gatherDigestData();
    });

    await step.run("send-digest", async () => {
      return await sendDigestEmail(data);
    });
  },
);
```

### Waiting for Multiple Events

```typescript
export const multiEventWorkflow = inngest.createFunction(
  { id: "multi-event" },
  { event: "app/process.started" },
  async ({ event, step }) => {
    // Wait for payment to complete
    const payment = await step.waitForEvent("wait-payment", {
      event: "app/payment.succeeded",
      timeout: "24h",
      if: "async.data.orderId == event.data.orderId",
    });

    if (payment) {
      await step.run("ship-order", async () => {
        return await shipOrder(event.data.orderId);
      });
    }
  },
);
```

---

## ✅ Checklist: Before Shipping

- [ ] Event is defined in `src/lib/inngest.ts` with types
- [ ] Function is in `src/features/[feature]/events/event-*.ts`
- [ ] All operations wrapped in `step.run()`
- [ ] Long-running workflows have `timeout` set
- [ ] Function registered in `src/app/api/inngest/route.ts`
- [ ] Event name follows `app/[feature].[action]` convention
- [ ] Concurrency limits added if needed
- [ ] Error cases are handled
- [ ] Step names are descriptive
- [ ] Tested locally with Inngest dev server

---

## 🔍 Troubleshooting

**Q: Function never executes**
A: Check if it's registered in `serve({ functions: [...] })`

**Q: No retries on failure**
A: Operations must be wrapped in `step.run()` to get automatic retries

**Q: Slow API responses**
A: Emit event instead of awaiting completion - fire and forget!

**Q: Duplicate operations**
A: Add idempotency checks or use idempotency keys

**Q: Function times out**
A: Add explicit `timeout` to `waitForEvent()`

See full troubleshooting in **INNGEST_QUICK_REFERENCE.md**.

---

## 🚀 Your Codebase Structure

```
src/
├── lib/inngest.ts
│   └── Event schema definitions & Inngest client
│
├── features/
│   ├── auth/
│   │   ├── events/
│   │   │   ├── event-sign-up-welcome-email.ts
│   │   │   └── event-types.ts
│   │   ├── emails/
│   │   ├── actions/
│   │   └── queries/
│   │
│   ├── admin/
│   │   ├── events/
│   │   │   ├── prepare-admin-digest.ts
│   │   │   ├── send-digest-email.ts
│   │   │   └── send-digest-discord.ts
│   │   ├── emails/
│   │   └── utils/
│   │
│   └── [feature]/
│       ├── events/          ← ALL workflows go here
│       ├── emails/          ← Email templates
│       ├── actions/
│       └── utils/
│
└── app/api/inngest/
    └── route.ts            ← Register all functions here
```

---

## 📖 Learning Path

1. **⭐ Start Here**: Read **[PITFALLS_AND_TIPS.md](../GUIDES/PITFALLS_AND_TIPS.md)** - Learn from common production patterns and mistakes
2. **Quick Start**: Read **[SUMMARY.md](./SUMMARY.md)** - High-level overview (this document)
3. **Practice**: Build your first workflow using **[CHEATSHEET.md](../QUICK_REFERENCE/CHEATSHEET.md)**
4. **Deepen**: Read full **[BEST_PRACTICES.md](../GUIDES/BEST_PRACTICES.md)** for all patterns
5. **Advanced**: Explore **[MESSAGING_PATTERNS.md](../GUIDES/MESSAGING_PATTERNS.md)** for complex scenarios
6. **Reference**: Bookmark **[CHEATSHEET.md](../QUICK_REFERENCE/CHEATSHEET.md)** for daily use

---

## 🔗 Key Concepts

- **Event**: A notification that something happened or should happen
- **Workflow Function**: Code that reacts to events with automatic retries and observability
- **Step**: An atomic operation within a workflow (gets retried on failure)
- **Concurrency**: Limits on how many workflows can run simultaneously
- **Idempotency**: Safe to retry without side effects
- **Dead Letter Queue**: Failed messages for manual review

---

## 📞 When to Emit Events

✅ **DO emit events for:**

- Sending emails/notifications
- Integrating with external services
- Long-running operations
- Tasks that can fail and retry
- Decoupled workflows
- Scheduled jobs

❌ **DON'T emit events for:**

- Critical path user data
- Synchronous database writes
- Real-time API responses
- Data that must complete before responding

---

## 🎓 Best Practices Summary

1. **Decouple with events** - Don't call external services directly
2. **Use steps for everything** - Every operation needs step.run()
3. **Name clearly** - Events and steps should be self-documenting
4. **Handle errors** - Set up global failure handler
5. **Think async-first** - Emit event, return response immediately
6. **Design for retries** - Make functions idempotent
7. **Monitor observability** - Use structured logging
8. **Set timeouts** - Long-running workflows need boundaries
9. **Control concurrency** - Prevent resource exhaustion
10. **Test thoroughly** - Use Inngest dev server locally

---

## 📚 External Resources

- [Inngest Official Docs](https://www.inngest.com/docs)
- [GitHub Repository](https://github.com/inngest/inngest-js)
- [Blog & Patterns](https://www.inngest.com/blog)
- [TypeScript SDK](https://github.com/inngest/inngest-js)

---

**Last Updated**: November 2025
**Framework**: Next.js + TypeScript
**Status**: Ready for production use ✓
