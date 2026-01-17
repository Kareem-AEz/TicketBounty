# Inngest Routing Architecture: Scaling Beyond the Route Handler

How to organize and manage your `route.ts` as your app scales from dozens to hundreds of workflows.

---

## The Problem

```typescript
// src/app/api/inngest/route.ts - GETS MESSY FAST
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleAnyFunctionFailure,
    eventPasswordReset,
    eventSignUpWelcomeEmail,
    eventPrepareAdminDigest,
    eventSendAdminDigestEmail,
    eventSendAdminDigestDiscord,
    eventTicketCreated,
    eventTicketUpdated,
    eventCommentPosted,
    eventCommentUpdated,
    // ... 50 more functions ...
    eventPaymentProcessed,
    eventRefundInitiated,
    eventShippingUpdated,
    // ... chaos ensues
  ],
});
```

**Issues:**

- ❌ Hard to find specific functions
- ❌ Difficult to add/remove functions
- ❌ No organization by feature
- ❌ Poor code maintainability
- ❌ Merge conflicts in git
- ❌ **Real impact:** 30+ minutes wasted searching for functions, team conflicts on PRs

---

## Solution 1: Manual Organization by Feature (Recommended for <50 functions)

### Step 1: Create Feature Function Registries

```typescript
// src/features/auth/events/index.ts
export const AUTH_FUNCTIONS = [
  eventSignUpWelcomeEmail,
  eventEmailVerified,
  eventPasswordReset,
];

// src/features/admin/events/index.ts
export const ADMIN_FUNCTIONS = [
  eventPrepareAdminDigest,
  eventSendAdminDigestEmail,
  eventSendAdminDigestDiscord,
];

// src/features/ticket/events/index.ts
export const TICKET_FUNCTIONS = [
  eventTicketCreated,
  eventTicketUpdated,
  eventTicketAssigned,
  eventTicketClosed,
];

// src/features/comment/events/index.ts
export const COMMENT_FUNCTIONS = [
  eventCommentPosted,
  eventCommentUpdated,
  eventCommentDeleted,
];

// src/features/payment/events/index.ts
export const PAYMENT_FUNCTIONS = [
  eventPaymentProcessed,
  eventRefundInitiated,
  eventPaymentFailed,
];
```

### Step 2: Import and Combine in Route Handler

```typescript
// src/app/api/inngest/route.ts - CLEAN AND ORGANIZED
import { serve } from "inngest/next";
import { handleAnyFunctionFailure, inngest } from "@/lib/inngest";

// Import feature registries
import { AUTH_FUNCTIONS } from "@/features/auth/events";
import { ADMIN_FUNCTIONS } from "@/features/admin/events";
import { TICKET_FUNCTIONS } from "@/features/ticket/events";
import { COMMENT_FUNCTIONS } from "@/features/comment/events";
import { PAYMENT_FUNCTIONS } from "@/features/payment/events";

// Combine all functions
const ALL_FUNCTIONS = [
  handleAnyFunctionFailure, // Always first
  ...AUTH_FUNCTIONS,
  ...ADMIN_FUNCTIONS,
  ...TICKET_FUNCTIONS,
  ...COMMENT_FUNCTIONS,
  ...PAYMENT_FUNCTIONS,
];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: ALL_FUNCTIONS,
});
```

**Benefits:**

- ✅ Clean route handler
- ✅ Easy to find functions by feature
- ✅ Easy to add/remove entire feature modules
- ✅ No merge conflicts on route.ts when adding new features
- ✅ Scales to ~50 functions

---

## Solution 2: Semi-Automated Registry (50-150 functions)

Create a centralized registry that auto-discovers functions:

### Step 1: Create a Registry Factory

```typescript
// src/lib/inngest-registry.ts
export type FunctionRegistry = {
  [feature: string]: {
    name: string;
    functions: any[];
  };
};

let registry: FunctionRegistry = {};

export function registerFunctions(feature: string, functions: any[]) {
  registry[feature] = {
    name: feature,
    functions,
  };
}

export function getAllFunctions() {
  const all = [];
  for (const feature of Object.values(registry)) {
    all.push(...feature.functions);
  }
  return all;
}

export function getFunctionsForFeature(feature: string) {
  return registry[feature]?.functions ?? [];
}

export function getRegistry() {
  return registry;
}
```

### Step 2: Register Features in Each Feature Folder

```typescript
// src/features/auth/events/index.ts
import { registerFunctions } from "@/lib/inngest-registry";

export const AUTH_FUNCTIONS = [
  eventSignUpWelcomeEmail,
  eventEmailVerified,
  eventPasswordReset,
];

registerFunctions("auth", AUTH_FUNCTIONS);

// src/features/ticket/events/index.ts
import { registerFunctions } from "@/lib/inngest-registry";

export const TICKET_FUNCTIONS = [
  eventTicketCreated,
  eventTicketUpdated,
  eventTicketAssigned,
];

registerFunctions("ticket", TICKET_FUNCTIONS);

// ... repeat for other features
```

### Step 3: Clean Route Handler

```typescript
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest, handleAnyFunctionFailure } from "@/lib/inngest";
import { getAllFunctions } from "@/lib/inngest-registry";

// Import features to register them (side effects)
import "@/features/auth/events";
import "@/features/admin/events";
import "@/features/ticket/events";
import "@/features/comment/events";
import "@/features/payment/events";

const ALL_FUNCTIONS = [handleAnyFunctionFailure, ...getAllFunctions()];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: ALL_FUNCTIONS,
});
```

**Benefits:**

- ✅ Very clean route handler
- ✅ Functions auto-register when imported
- ✅ Easy to add new features (just import)
- ✅ Central registry for introspection
- ✅ Scales to ~150 functions

---

## Solution 3: Fully Automated with Glob Imports (150+ functions)

For very large apps, use dynamic imports:

### Step 1: Standardize File Naming

All workflow functions must follow this pattern:

```
src/features/[feature]/events/event-*.ts
```

Each file exports a default or named export of the function.

### Step 2: Create Auto-Discovery Loader

```typescript
// src/lib/inngest-loader.ts
import { importDir } from "some-import-library"; // or use glob + dynamic import

export async function loadAllFunctions() {
  // Method 1: Using Node.js glob (if server-side only)
  const { glob } = await import("glob");
  const files = await glob("src/features/**/events/event-*.ts", {
    absolute: true,
  });

  const functions = [];
  for (const file of files) {
    try {
      const module = await import(file);
      const func = module.default ?? Object.values(module)[0];
      if (func) functions.push(func);
    } catch (error) {
      console.warn(`Failed to load function from ${file}`, error);
    }
  }

  return functions;
}

// Method 2: Explicit path import (works with Next.js)
export function loadAllFunctionsSync() {
  const modules = require.context("@/features", true, /events\/event-.*\.ts$/);

  const functions = [];
  modules.keys().forEach((key) => {
    const module = modules(key);
    const func = module.default ?? Object.values(module)[0];
    if (func) functions.push(func);
  });

  return functions;
}
```

### Step 3: Use in Route Handler

```typescript
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest, handleAnyFunctionFailure } from "@/lib/inngest";
import { loadAllFunctionsSync } from "@/lib/inngest-loader";

const allFunctions = [handleAnyFunctionFailure, ...loadAllFunctionsSync()];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: allFunctions,
});
```

**Benefits:**

- ✅ Completely automated
- ✅ Add new workflows with zero changes to route.ts
- ✅ No manual registration needed
- ✅ Scales infinitely
- ✅ No merge conflicts ever

**Drawbacks:**

- ⚠️ Harder to debug which functions are loaded
- ⚠️ Less explicit about what's registered
- ⚠️ May have performance impact on startup

---

## Recommendation by App Size

| App Size | Functions | Solution                     | Complexity |
| -------- | --------- | ---------------------------- | ---------- |
| Small    | < 10      | Keep in route.ts             | Low        |
| Growing  | 10-50     | **Solution 1** (Recommended) | Low        |
| Medium   | 50-150    | **Solution 2**               | Medium     |
| Large    | 150+      | **Solution 3**               | High       |

---

## Best Practice: Hybrid Approach (Recommended)

Combine manual organization with optional auto-discovery:

```typescript
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest, handleAnyFunctionFailure } from "@/lib/inngest";

// Critical functions (always explicit)
import { AUTH_FUNCTIONS } from "@/features/auth/events";
import { PAYMENT_FUNCTIONS } from "@/features/payment/events";

// Feature functions (organized by feature)
import { TICKET_FUNCTIONS } from "@/features/ticket/events";
import { ADMIN_FUNCTIONS } from "@/features/admin/events";
import { COMMENT_FUNCTIONS } from "@/features/comment/events";

// Future-proof: add auto-discovery later if needed
// import { loadAdditionalFunctions } from "@/lib/inngest-loader";

const ALL_FUNCTIONS = [
  // Core functions (always first)
  handleAnyFunctionFailure,

  // Critical features (explicit for clarity)
  ...AUTH_FUNCTIONS,
  ...PAYMENT_FUNCTIONS,

  // Other features (organized by domain)
  ...TICKET_FUNCTIONS,
  ...ADMIN_FUNCTIONS,
  ...COMMENT_FUNCTIONS,

  // Future: auto-loaded functions
  // ...loadAdditionalFunctions(),
];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: ALL_FUNCTIONS,
});
```

---

## Adding a New Feature (Solution 1 Style)

### Template: Adding Booking Feature

1. Create feature folder:

```
src/features/booking/events/
  ├── event-booking-created.ts
  ├── event-booking-confirmed.ts
  └── index.ts
```

2. Export functions:

```typescript
// src/features/booking/events/index.ts
export const BOOKING_FUNCTIONS = [eventBookingCreated, eventBookingConfirmed];
```

3. Update route.ts:

```typescript
// src/app/api/inngest/route.ts
import { BOOKING_FUNCTIONS } from "@/features/booking/events"; // Add this line

const ALL_FUNCTIONS = [
  handleAnyFunctionFailure,
  ...AUTH_FUNCTIONS,
  ...ADMIN_FUNCTIONS,
  ...TICKET_FUNCTIONS,
  ...COMMENT_FUNCTIONS,
  ...BOOKING_FUNCTIONS, // Add this line
];
```

That's it! No more. Clean and maintainable.

---

## Monitoring & Debugging

### Option 1: List All Functions

```typescript
// Create a debug endpoint
app.get("/api/inngest/functions", (req, res) => {
  const allFunctions = ALL_FUNCTIONS.map((fn) => ({
    id: fn.id,
    triggers: fn.triggers,
    concurrency: fn.config?.concurrency,
  }));

  res.json({
    totalFunctions: allFunctions.length,
    functions: allFunctions,
  });
});
```

### Option 2: Register Hooks

```typescript
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: ALL_FUNCTIONS,
  onServerStarted: () => {
    console.log(`Inngest: Registered ${ALL_FUNCTIONS.length} functions`);
  },
});
```

---

## Your Implementation Path

### Now (Current State: 6 functions)

Keep Solution 1 (Manual Organization)

```typescript
// src/features/*/events/index.ts
export const [FEATURE]_FUNCTIONS = [/* ... */];

// src/app/api/inngest/route.ts
import { [FEATURE]_FUNCTIONS } from "@/features/[feature]/events";
const ALL_FUNCTIONS = [
  handleAnyFunctionFailure,
  ...[FEATURE]_FUNCTIONS,
  // ...
];
```

### Later (50+ functions)

Upgrade to Solution 2 (Registry) if needed

### At Scale (150+ functions)

Upgrade to Solution 3 (Auto-discovery)

---

## Summary

| Aspect      | Manual         | Registry | Auto-Discovery |
| ----------- | -------------- | -------- | -------------- |
| Clarity     | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐ | ⭐⭐⭐         |
| Scalability | ⭐⭐⭐         | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐     |
| Maintenance | ⭐⭐⭐⭐       | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐     |
| Best For    | < 50 functions | 50-150   | 150+           |

**Recommendation:** Start with **Solution 1** (Manual) now. Upgrade to **Solution 2** (Registry) when you hit ~40-50 functions.

---

## Common Pitfalls & Tips

### ❌ Pitfall #1: Forgetting to Register New Functions

**The Mistake:**

```typescript
// You create a new function file
// src/features/booking/events/event-booking-created.ts
export const eventBookingCreated = inngest.createFunction(/* ... */);

// But forget to add it to route.ts
// Now the function never executes in production!
```

**The Fix:**

- ✅ Keep a checklist: Create function → Export → Register → Test
- ✅ Add a comment in route.ts as a reminder
- ✅ Use TypeScript to enforce registration (advanced)

```typescript
// Create a type-safe registry
type RegisteredFunctions =
  | (typeof AUTH_FUNCTIONS)[number]
  | (typeof TICKET_FUNCTIONS)[number]
  // ... more types
  | typeof eventBookingCreated; // TypeScript error if missing!
```

---

### ❌ Pitfall #2: Import Order Breaking Functions

**The Mistake:**

```typescript
// ❌ BAD: Global failure handler not first
const ALL_FUNCTIONS = [
  ...AUTH_FUNCTIONS,
  ...TICKET_FUNCTIONS,
  handleAnyFunctionFailure, // Should be first!
];
```

**Why It Matters:** Failure handler should catch errors from ALL functions.

**The Fix:**

```typescript
// ✅ GOOD: Failure handler always first
const ALL_FUNCTIONS = [
  handleAnyFunctionFailure, // Always first
  ...AUTH_FUNCTIONS,
  ...TICKET_FUNCTIONS,
];
```

---

### ❌ Pitfall #3: Circular Dependencies

**The Mistake:**

```typescript
// src/features/auth/events/index.ts
import { TICKET_FUNCTIONS } from "@/features/ticket/events";

// src/features/ticket/events/index.ts
import { AUTH_FUNCTIONS } from "@/features/auth/events";

// Result: Build error!
```

**The Fix:**

- ✅ Never import between feature registries
- ✅ Only import in route.ts
- ✅ Keep features independent

---

### ❌ Pitfall #4: Auto-Discovery Loading Wrong Files

**The Mistake:**

```typescript
// Auto-discovery pattern matches test files!
const files = glob("src/features/**/events/**/*.ts");
// Loads: event-booking-created.test.ts (WRONG!)
```

**The Fix:**

```typescript
// ✅ GOOD: Explicit pattern
const files = glob("src/features/**/events/event-*.ts", {
  ignore: ["**/*.test.ts", "**/*.spec.ts"],
});
```

---

### 💡 Pro Tips

#### Tip #1: Use Comments to Track Function Count

```typescript
// src/app/api/inngest/route.ts
const ALL_FUNCTIONS = [
  handleAnyFunctionFailure, // 1

  // Auth (3 functions)
  ...AUTH_FUNCTIONS, // 2-4

  // Tickets (7 functions)
  ...TICKET_FUNCTIONS, // 5-11

  // Total: 11 functions
];

console.log(`Registered ${ALL_FUNCTIONS.length} functions`);
// Verify count matches expectations!
```

#### Tip #2: Create a Debug Endpoint

```typescript
// src/app/api/inngest/debug/route.ts (only in development)
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  return Response.json({
    totalFunctions: ALL_FUNCTIONS.length,
    functions: ALL_FUNCTIONS.map((fn) => ({
      id: fn.id,
      triggers: fn.triggers,
    })),
  });
}
```

#### Tip #3: Alphabetize for Easy Scanning

```typescript
// ✅ GOOD: Easy to scan
const ALL_FUNCTIONS = [
  handleAnyFunctionFailure,
  ...ADMIN_FUNCTIONS, // A
  ...AUTH_FUNCTIONS, // A
  ...BOOKING_FUNCTIONS, // B
  ...COMMENT_FUNCTIONS, // C
  ...PAYMENT_FUNCTIONS, // P
  ...TICKET_FUNCTIONS, // T
];
```

#### Tip #4: Group by Criticality

```typescript
// ✅ BEST: Critical functions are obvious
const ALL_FUNCTIONS = [
  // === CRITICAL FUNCTIONS ===
  handleAnyFunctionFailure,
  ...PAYMENT_FUNCTIONS,
  ...AUTH_FUNCTIONS,

  // === IMPORTANT FUNCTIONS ===
  ...TICKET_FUNCTIONS,
  ...BOOKING_FUNCTIONS,

  // === NICE-TO-HAVE FUNCTIONS ===
  ...ANALYTICS_FUNCTIONS,
  ...NOTIFICATION_FUNCTIONS,
];
```

---

## Migration Guide

### From Unorganized to Solution 1

**Step 1:** Create feature index files

```bash
# For each feature
touch src/features/auth/events/index.ts
touch src/features/ticket/events/index.ts
```

**Step 2:** Export arrays from each feature

```typescript
// src/features/auth/events/index.ts
export const AUTH_FUNCTIONS = [eventSignUpWelcomeEmail, eventPasswordReset];
```

**Step 3:** Update route.ts

```typescript
// Import all registries
import { AUTH_FUNCTIONS } from "@/features/auth/events";
import { TICKET_FUNCTIONS } from "@/features/ticket/events";

const ALL_FUNCTIONS = [
  handleAnyFunctionFailure,
  ...AUTH_FUNCTIONS,
  ...TICKET_FUNCTIONS,
];
```

**Time required:** 15-30 minutes for 20 functions

---

### From Solution 1 to Solution 2

**When to migrate:** 40-50 functions, too many manual imports

**Benefits:**

- Automatic registration
- Less boilerplate
- Cleaner route.ts

**Time required:** 1-2 hours

---

## Testing Your Setup

### Verify All Functions Are Registered

```typescript
// Add this temporarily to route.ts
console.log("Registered functions:", ALL_FUNCTIONS.length);
ALL_FUNCTIONS.forEach((fn) => {
  console.log(`  - ${fn.id}`);
});
```

### Check for Duplicates

```typescript
// Detect duplicate IDs
const ids = ALL_FUNCTIONS.map((fn) => fn.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length > 0) {
  console.error("Duplicate function IDs:", duplicates);
  throw new Error("Duplicate function IDs detected!");
}
```

### Verify Function Count

```typescript
// Assert expected count
const EXPECTED_COUNT = 23;
if (ALL_FUNCTIONS.length !== EXPECTED_COUNT) {
  console.warn(
    `Expected ${EXPECTED_COUNT} functions, got ${ALL_FUNCTIONS.length}`,
  );
}
```

---

**Recommendation:** Start with **Solution 1** (Manual) now. Upgrade to **Solution 2** (Registry) when you hit ~40-50 functions.
