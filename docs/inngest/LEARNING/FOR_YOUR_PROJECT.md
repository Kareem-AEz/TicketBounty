# Inngest Implementation Guide for Your Project

Specific recommendations, patterns, and refactoring suggestions for your "The Road to Next" ticket bounty application.

---

## Current State Analysis

### ✅ What You're Doing Right

1. **Good organization**: Events live in `features/[feature]/events/`
2. **Type safety**: Event types are defined in `src/lib/inngest.ts`
3. **Central handler**: All functions registered in `src/app/api/inngest/route.ts`
4. **Global error handling**: `handleAnyFunctionFailure` catches all failures
5. **Feature-based structure**: Workflows organized by business domain

### 🎯 Current Workflows

```
✓ app/password.password-reset-function          → src/features/password/events/
✓ app/auth.sign-up-welcome-email-function       → src/features/auth/events/
✓ app/admin-digest.ready                        → src/features/admin/events/
```

---

## 📋 Current Implementation Review

### 1. Event Schema (Excellent)

```typescript
// src/lib/inngest.ts
import { Inngest, eventType, staticSchema } from "inngest";

export const passwordResetFunctionEvent = eventType(
  "app/password.password-reset-function",
  {
    schema: staticSchema<PasswordResetFunctionData>(),
  },
);

export const authSignUpWelcomeEmailFunctionEvent = eventType(
  "app/auth.sign-up-welcome-email-function",
  {
    schema: staticSchema<SignUpWelcomeEmailFunctionData>(),
  },
);

export const adminDigestReadyEvent = eventType("app/admin-digest.ready", {
  schema: staticSchema<AdminDigestReadyEventData>(),
});

export const inngest = new Inngest({
  id: "ticket-bounty",
  checkpointing: {
    maxRuntime: "300s",
  },
});
```

**Recommendation**: Continue this pattern. Add new events here as features expand.

---

### 2. Admin Digest Workflow (Good Pattern)

Your admin digest shows a well-structured workflow:

```typescript
// ✓ Uses cron for scheduling
{ cron: "0 0 * * *" }

// ✓ Parallel data gathering with Promise.all
const [totalTickets, totalUsers, totalComments] = await Promise.all([
  step.run("count-tickets", ...),
  step.run("count-users", ...),
  step.run("count-comments", ...),
]);

// ✓ Event chaining
await step.sendEvent("app/admin-digest.ready", { ... });

// ✓ Multiple handlers react independently
eventSendAdminDigestEmail
eventSendAdminDigestDiscord
```

**Recommendation**: This is the pattern to follow for multi-step workflows.

---

## 🔄 Suggested Enhancements

### 1. Add Ticket Event Workflows

**Current gap**: No workflows for ticket CRUD operations

```typescript
// src/features/ticket/events/event-ticket-created.ts
export type TicketCreatedEventData = {
  data: {
    ticketId: string;
    userId: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
  };
};

export const eventTicketCreated = inngest.createFunction(
  {
    id: "ticket-created",
    concurrency: {
      key: "event.data.userId",
      limit: 5, // Prevent user from spamming
    },
  , triggers: [{ event: ticketCreatedEvent }] },
  async ({ event, step }) => {
    const { ticketId, userId, title } = event.data;

    // Notify user
    await step.run("send-confirmation", async () => {
      return await sendTicketConfirmationEmail({
        userId,
        ticketId,
        title,
      });
    });

    // Notify admins for high-priority
    if (event.data.priority === "urgent") {
      await step.sendEvent("notify-urgent", adminUrgentTicketCreatedEvent.create({ data: { ticketId, userId } }));
    }

    // Track analytics
    await step.run("track-creation", async () => {
      return await analytics.track("ticket.created", {
        ticketId,
        priority: event.data.priority,
      });
    });
  },
);

export const eventUrgentTicket = inngest.createFunction(
  { id: "urgent-ticket-notification" , triggers: [{ event: adminUrgentTicketCreatedEvent }] },
  async ({ event, step }) => {
    await step.run("notify-admins", async () => {
      return await notifyAdminsViaSlack({
        message: `🚨 Urgent ticket created: ${event.data.ticketId}`,
      });
    });
  },
);
```

**Add to schema**:

```typescript
"app/ticket.created": {
  data: {
    ticketId: string;
    userId: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
  };
};
"app/admin.urgent-ticket-created": {
  data: {
    ticketId: string;
    userId: string;
  };
};
```

### 2. Add Comment Notification Workflow

**Current gap**: Comments might need notifications to watchers

```typescript
// src/features/comment/events/event-comment-posted.ts
export type CommentPostedEventData = {
  data: {
    commentId: string;
    ticketId: string;
    authorId: string;
    content: string;
  };
};

export const eventCommentPosted = inngest.createFunction(
  { id: "comment-posted", triggers: [{ event: commentPostedEvent }] },
  async ({ event, step }) => {
    // Get ticket and watchers
    const ticket = await step.run("fetch-ticket", async () => {
      return await prisma.ticket.findUnique({
        where: { id: event.data.ticketId },
        include: {
          author: true,
          comments: { select: { authorId: true } },
        },
      });
    });

    // Notify ticket author (if not commenter)
    if (ticket.author.id !== event.data.authorId) {
      await step.run("notify-author", async () => {
        return await sendNotificationEmail({
          to: ticket.author.email,
          subject: `New comment on your ticket: ${ticket.title}`,
          content: event.data.content,
        });
      });
    }

    // Notify other commenters
    const otherCommenters = [
      ...new Set(
        ticket.comments
          .map((c) => c.authorId)
          .filter((id) => id !== event.data.authorId),
      ),
    ];

    await step.run("notify-watchers", async () => {
      return await Promise.all(
        otherCommenters.map((userId) =>
          sendNotificationEmail({
            userId,
            subject: `New comment on ticket: ${ticket.title}`,
            content: event.data.content,
          }),
        ),
      );
    });
  },
);
```

### 3. Add Account Update Workflows

**Current gap**: No notifications when users update their profile/password

```typescript
// src/features/accounts/events/event-password-changed.ts
export const eventPasswordChanged = inngest.createFunction(
  {
    id: "password-changed",
    triggers: [{ event: accountPasswordChangedEvent }],
  },
  async ({ event, step }) => {
    await step.run("send-confirmation", async () => {
      return await sendEmail({
        to: event.data.email,
        subject: "Your password was changed",
        body: "If this wasn't you, please contact support.",
      });
    });

    // Log security event
    await step.run("log-security", async () => {
      return await prisma.auditLog.create({
        data: {
          userId: event.data.userId,
          action: "PASSWORD_CHANGED",
          timestamp: new Date(),
        },
      });
    });
  },
);
```

---

## 🎨 Recommended Event Structure for Your App

```typescript
// src/lib/inngest.ts
import { eventType, staticSchema } from "inngest";

// Auth events
export const authSignUpWelcomeEmailFunctionEvent = eventType(
  "app/auth.sign-up-welcome-email-function",
  { schema: staticSchema<any>() },
);
export const authEmailVerifiedEvent = eventType("app/auth.email-verified", {
  schema: staticSchema<any>(),
});

// Password events
export const passwordPasswordResetFunctionEvent = eventType(
  "app/password.password-reset-function",
  { schema: staticSchema<any>() },
);
export const passwordPasswordChangedEvent = eventType(
  "app/password.password-changed",
  { schema: staticSchema<any>() },
);

// Account events
export const accountProfileUpdatedEvent = eventType(
  "app/account.profile-updated",
  { schema: staticSchema<any>() },
);
export const accountSettingsChangedEvent = eventType(
  "app/account.settings-changed",
  { schema: staticSchema<any>() },
);

// Ticket events
export const ticketCreatedEvent = eventType("app/ticket.created", {
  schema: staticSchema<any>(),
});
export const ticketUpdatedEvent = eventType("app/ticket.updated", {
  schema: staticSchema<any>(),
});
export const ticketAssignedEvent = eventType("app/ticket.assigned", {
  schema: staticSchema<any>(),
});
export const adminUrgentTicketCreatedEvent = eventType(
  "app/admin.urgent-ticket-created",
  { schema: staticSchema<any>() },
);

// Comment events
export const commentPostedEvent = eventType("app/comment.posted", {
  schema: staticSchema<any>(),
});
export const commentUpdatedEvent = eventType("app/comment.updated", {
  schema: staticSchema<any>(),
});

// Admin events
export const adminDigestReadyEvent = eventType("app/admin-digest.ready", {
  schema: staticSchema<any>(),
});
export const adminDailyMetricsEvent = eventType("app/admin.daily-metrics", {
  schema: staticSchema<any>(),
});
```

---

## 📂 Folder Structure Refactor

**Current structure** (good):

```
src/features/
├── admin/
│   ├── emails/
│   ├── events/
│   └── services/
├── auth/
│   ├── emails/
│   ├── events/
│   └── actions/
└── password/
    ├── emails/
    ├── events/
    └── actions/
```

**Proposed additions**:

```
src/features/
├── ticket/
│   ├── events/
│   │   ├── event-ticket-created.ts
│   │   ├── event-ticket-updated.ts
│   │   ├── event-ticket-assigned.ts
│   │   └── event-types.ts
│   ├── emails/
│   ├── actions/
│   └── queries/
├── comment/
│   ├── events/
│   │   ├── event-comment-posted.ts
│   │   └── event-types.ts
│   ├── actions/
│   └── queries/
└── [others]/
```

---

## 🔌 Integration Points

### 1. API Route - Emit Ticket Created Event

```typescript
// In your ticket creation server action
export async function createTicket(data: CreateTicketInput) {
  const ticket = await prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      userId: userId,
      priority: data.priority,
    },
  });

  // Emit event for background processing
  await inngest.send(
    ticketCreatedEvent.create({
      data: {
        ticketId: ticket.id,
        userId: ticket.userId,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
      },
    }),
  );

  return ticket;
}
```

### 2. Comment Creation

```typescript
// In comment creation server action
export async function addComment(ticketId: string, content: string) {
  const comment = await prisma.ticketComment.create({
    data: {
      ticketId,
      content,
      authorId: userId,
    },
  });

  await inngest.send(
    commentPostedEvent.create({
      data: {
        commentId: comment.id,
        ticketId,
        authorId: userId,
        content,
      },
    }),
  );

  return comment;
}
```

### 3. Password Update

```typescript
// In password update action
export async function updatePassword(newPassword: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await inngest.send(
    accountPasswordChangedEvent.create({
      data: {
        userId,
        email: user.email,
        timestamp: new Date(),
      },
    }),
  );
}
```

---

## ⚡ Performance Considerations

### 1. Concurrency Limits for Your App

```typescript
// High-volume events that could overwhelm
export const eventCommentPosted = inngest.createFunction(
  {
    id: "comment-posted",
    concurrency: {
      key: "event.data.ticketId",
      limit: 10, // Max 10 notifications per ticket
    },
  },
  // ...
);

// User-specific limits
export const eventTicketCreated = inngest.createFunction(
  {
    id: "ticket-created",
    concurrency: {
      key: "event.data.userId",
      limit: 5, // Max 5 ticket creations per user
    },
  },
  // ...
);
```

### 2. Batch Digest Processing

Instead of sending individual emails, batch them:

```typescript
export const batchDigestNotifications = inngest.createFunction(
  { id: "batch-digest-notifications", triggers: [{ cron: "0 8 * * *" }] }, // 8am daily
  async ({ step }) => {
    const pending = await step.run("fetch-pending", async () => {
      return await prisma.notification.findMany({
        where: { sent: false, type: "digest" },
        include: { recipient: true },
      });
    });

    // Group by user
    const grouped = groupBy(pending, "recipientId");

    await step.run("send-digests", async () => {
      return await Promise.all(
        Object.entries(grouped).map(([userId, notifications]) =>
          sendDigestEmail(userId, notifications),
        ),
      );
    });
  },
);
```

---

## 🧪 Testing Your Workflows

### Local Development

```bash
# In one terminal, start Inngest dev server
inngest dev

# In another, run your Next.js app
npm run dev
```

### Manual Testing

```typescript
// Add to a test page or API route
export async function testWorkflow() {
  await inngest.send(
    ticketCreatedEvent.create({
      data: {
        ticketId: "test-123",
        userId: "user-456",
        title: "Test Ticket",
        description: "Testing workflow",
        priority: "high",
      },
    }),
  );

  return { success: true };
}
```

---

## 📊 Monitoring & Observability

### 1. Dashboard Metrics

Track in Inngest Cloud dashboard:

- Function success/failure rates
- Average execution time
- Event throughput
- Retry patterns

### 2. Structured Logging

```typescript
import logger from "@/lib/logger";

export const eventTicketCreated = inngest.createFunction(
  { id: "ticket-created", triggers: [{ event: ticketCreatedEvent }] },
  async ({ event, step }) => {
    logger.info(
      { ticketId: event.data.ticketId, userId: event.data.userId },
      "Processing ticket creation",
    );

    try {
      await step.run("send-email", async () => {
        logger.debug({ ticketId: event.data.ticketId }, "Sending email");
        return await sendEmail(event.data);
      });
    } catch (error) {
      logger.error(
        { ticketId: event.data.ticketId, error: String(error) },
        "Failed to process ticket creation",
      );
      throw error;
    }
  },
);
```

---

## 🚀 Implementation Roadmap

### Phase 1: Current (Already Done ✓)

- ✓ Auth events (signup, password reset)
- ✓ Admin digest (daily reports)
- ✓ Global error handler

### Phase 2: Next (Recommended)

- [ ] Ticket creation events
- [ ] Comment notification workflow
- [ ] Account update notifications
- [ ] Add concurrency limits

### Phase 3: Enhanced (Future)

- [ ] Ticket assignment notifications
- [ ] Batch digest emails
- [ ] Analytics tracking for all events
- [ ] Webhook integrations (Slack, Discord)
- [ ] Dead letter queue for failed events

### Phase 4: Advanced (Later)

- [ ] Workflow chains (multi-step processes)
- [ ] Event replay for debugging
- [ ] Custom dashboards
- [ ] Performance optimizations

---

## ✅ Implementation Checklist

### For Each New Workflow

- [ ] Define event type in `src/lib/inngest.ts`
- [ ] Create function file in `src/features/[feature]/events/event-*.ts`
- [ ] Wrap all operations in `step.run()`
- [ ] Add error handling and logging
- [ ] Set concurrency limits if needed
- [ ] Register in `src/app/api/inngest/route.ts`
- [ ] Test locally with Inngest dev server
- [ ] Add to documentation/roadmap
- [ ] Deploy and monitor in Inngest Cloud

---

## 🎯 Success Metrics

After implementing these recommendations:

- ✓ Reduced API response times (fire & forget pattern)
- ✓ Reliable email/notification delivery (automatic retries)
- ✓ Better observability (structured logging)
- ✓ Scalable architecture (concurrency controls)
- ✓ Maintainable codebase (organized, typed)

---

## 📞 Support & Resources

- **Inngest Dev Server**: `inngest dev` - local testing
- **Inngest Cloud**: Monitor production workflows
- **Documentation**: `/docs/INNGEST_BEST_PRACTICES.md`
- **Quick Reference**: `/docs/INNGEST_QUICK_REFERENCE.md`
- **Patterns Guide**: `/docs/INNGEST_MESSAGING_PATTERNS.md`

---

## 🎓 Next Steps

1. Read through `INNGEST_BEST_PRACTICES.md` for full context
2. Implement ticket creation workflow (Phase 2, step 1)
3. Add comment notification workflow
4. Review and optimize with concurrency controls
5. Monitor metrics in Inngest Cloud

Good luck with your implementation! 🚀
