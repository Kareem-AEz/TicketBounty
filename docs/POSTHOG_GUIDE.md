# PostHog Integration Guide for Next.js (App Router)

This comprehensive guide covers integrating PostHog with Next.js using the App Router, following best practices for analytics, feature flags, experiments, and session replay.

## 1. Installation & Environment

Install the required packages. You need both the client-side library (`posthog-js`) and the server-side library (`posthog-node`) for a complete integration.

```bash
npm install posthog-js posthog-node
```

Add your environment variables to `.env.local`:

```bash
# Get these from PostHog Project Settings
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 2. Client-Side Setup (Analytics & Replay)

We need to create a client-side provider to wrap your application. This handles initialization, autocapture, and session replay.

### A. Create the Provider (Recommended)

To avoid hydration mismatches with Next.js App Router (especially when using structured data scripts), we initialize PostHog inside a `useEffect`. This ensures scripts are injected only after the page has hydrated.

Create `src/app/_providers/posthog-provider.tsx`:

```tsx
// src/app/_providers/posthog-provider.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We handle this manually in the tracker
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      // GDPR Compliance:
      // 1. We default to 'memory' persistence (cookieless) until consent.
      // 2. We don't automatically capture until we confirm.
      // However, to keep it simple with the banner, we usually rely on opt_in_capturing logic.
      // If you want strict GDPR, use 'memory' persistence by default:
      persistence: "memory", 
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### B. Handle Page Views (App Router)
Since Next.js App Router doesn't trigger standard browser navigation events, we need a component to listen for path changes.

Create `src/app/_providers/posthog-pageview-tracker.tsx`:

```tsx
// src/app/_providers/posthog-pageview-tracker.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    // Track pageview whenever pathname or search params change
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

### C. Auto-Identify Wrapper (Optional but Recommended)
To automatically link your authenticated users to their PostHog sessions without manually calling `identify` everywhere.

Create `src/app/_providers/posthog-auth-wrapper.tsx`:

```tsx
// src/app/_providers/posthog-auth-wrapper.tsx
"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { getAuth } from "@/features/auth/queries/get-auth";

export default function PostHogAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    const identifyUser = async () => {
      try {
        const { user } = await getAuth();
        if (user) {
          // Identify the user if they are not already identified as this user
          if (posthog.get_distinct_id() !== user.id) {
            posthog.identify(user.id, {
              email: user.email,
              username: user.username,
            });
          }
        }
      } catch (error) {
        console.error("Failed to identify user in PostHog:", error);
      }
    };

    identifyUser();
  }, [posthog]);

  return <>{children}</>;
}
```

### D. Add to Root Layout
Update `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx
import { PostHogProvider } from "./_providers/posthog-provider"
import PostHogPageViewTracker from "./_providers/posthog-pageview-tracker"
import PostHogAuthWrapper from "./_providers/posthog-auth-wrapper"
import { CookieBanner } from "@/components/privacy/cookie-banner";
import { Suspense } from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <PostHogProvider>
        <body>
          {/* Suspense is required for useSearchParams inside the tracker */}
          <Suspense fallback={null}>
            <PostHogPageViewTracker />
          </Suspense>
          <PostHogAuthWrapper>
             {children}
             <CookieBanner />
          </PostHogAuthWrapper>
        </body>
      </PostHogProvider>
    </html>
  )
}
```

---

## 3. Advanced Configuration: Reverse Proxy (Recommended)

Ad-blockers often block PostHog. To fix this, use Next.js Rewrites to proxy events through your own domain.

Update `next.config.ts` (or `.js`):

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // ... other config
};

export default nextConfig;
```

**Note:** Notice we used `/ingest` as the `api_host` in step 2A. This matches the rewrite source.

---

## 4. Server-Side Setup (Events & Flags)

For Server Components, API Routes, and Server Actions, use `posthog-node`.

Create `src/lib/posthog.ts`:

```ts
// src/lib/posthog.ts
import { PostHog } from 'posthog-node'

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1, // Flush immediately in serverless environments
    flushInterval: 0
  })
  return posthogClient
}
```

### Usage in Server Action / Component

```ts
// src/app/actions/example.ts
'use server'
import PostHogClient from "@/lib/posthog"

export async function doSomething(userId: string) {
  const posthog = PostHogClient()
  
  // 1. Capture Event
  posthog.capture({
    distinctId: userId,
    event: 'server_action_triggered',
    properties: { action_type: 'example' }
  })

  // 2. Check Feature Flag
  const isEnabled = await posthog.isFeatureEnabled('new-feature-key', userId)
  
  if (isEnabled) {
    // execute new logic
  }

  // IMPORTANT: Flush events before the serverless function spins down
  await posthog.shutdown() 
}
```

---

## 5. Feature Flags (Best Practices)

### Client-Side (React Hooks)
Use the `useFeatureFlagEnabled` hook.

```tsx
'use client'
import { useFeatureFlagEnabled } from 'posthog-js/react'

export function MyComponent() {
  const isNewFeature = useFeatureFlagEnabled('new-dashboard-ui')

  if (isNewFeature) return <NewDashboard />
  return <OldDashboard />
}
```

### Server-Side (Preventing Flicker)
For critical UI changes, evaluate flags on the server and pass them to the client to avoid layout shifts.

1. Fetch flag in Server Component/Page.
2. Pass as prop to Client Component.

```tsx
// app/page.tsx (Server Component)
import PostHogClient from "@/lib/posthog"
import { ClientComponent } from "./client-component"
import { cookies } from "next/headers"

export default async function Page() {
  const posthog = PostHogClient()
  // Assuming you store a distinctId in cookies or auth session
  const distinctId = (await cookies()).get('distinct_id')?.value || 'anonymous_id'
  
  const showNewFeature = await posthog.isFeatureEnabled('new-feature', distinctId)
  await posthog.shutdown()

  return <ClientComponent showNewFeature={showNewFeature} />
}
```

---

## 6. Identifying Users (Auth Integration)

This is **critical** for accurate tracking.

### A. Automatic Identification
We use the `PostHogAuthWrapper` (see section 2D) to automatically identify users on the client side whenever the auth session is valid.

### B. Manual Identification (Sign Up / Login Actions)
For immediate server-side events (like "User Signed Up"), handle it in your Server Action.

```ts
// src/features/auth/actions/sign-up.ts
// ... inside your sign up action
const posthog = PostHogClient();
posthog.capture({
  distinctId: user.id,
  event: "user_signed_up",
  properties: { method: "email" },
});
await posthog.shutdown();
```

### C. Reset on Sign Out
Always reset to clear the session when the user logs out.

```tsx
// src/features/auth/components/sign-out-button.tsx
const handleSignOut = () => {
  posthog.reset(); // Resets the device ID to a new anonymous ID
  // ... other sign out logic
};
```

---

## 7. GDPR & Cookie Consent

To be GDPR compliant, you must obtain user consent before setting non-essential cookies. We have implemented a setup that defaults to **cookieless** tracking (memory persistence) until the user consents.

### A. Configuration
In `src/app/_providers/posthog-provider.tsx`, we initialize PostHog with `persistence: 'memory'`. This means no cookies are stored by default, and user data is lost on page reload (safe for privacy).

```tsx
// src/app/_providers/posthog-provider.tsx
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  // ... other config
  persistence: 'memory', // Default to in-memory (cookieless)
});
```

### B. Cookie Banner Component
We created `src/components/privacy/cookie-banner.tsx` to handle consent.

-   **Decline**: Keeps `persistence: 'memory'` (and calls `opt_out_capturing` to be sure).
-   **Accept**: Switches to `persistence: 'localStorage+cookie'` and calls `opt_in_capturing`.

```tsx
// src/components/privacy/cookie-banner.tsx
const handleAccept = () => {
  posthog.opt_in_capturing();
  posthog.set_config({ persistence: 'localStorage+cookie' }); // Enable cookies
  setShowBanner(false);
};
```

### C. Usage
The banner is automatically included in your `RootLayout`, so it appears on every page for users who haven't made a choice yet.

---

## 8. Pro Tips & "Don't Do"s

### ✅ DO:
1.  **Use Proxying:** Always set up the rewrite proxy. It dramatically increases data accuracy (20-40% more events captured).
2.  **Wait for Shutdown (Server):** In Vercel/Serverless, always `await posthog.shutdown()` at the end of your server action/route handler. If you don't, events may be lost when the lambda freezes.
3.  **Identify Early:** Identify the user as soon as you have their ID.
4.  **Group Analytics:** If you are B2B, use `posthog.group('company', companyId)` to track usage at an organization level.

### ❌ DON'T:
1.  **Don't** use `posthog-js` (the client library) inside Server Components. It is strictly for the browser. Use `posthog-node`.
2.  **Don't** set `capture_pageview: true` in App Router. It will often miss soft navigations or capture duplicate views. Use the manual tracker component shown above.
3.  **Don't** forget `use client` on components using `usePostHog` or `useFeatureFlagEnabled`.
4.  **Don't** evaluate feature flags inside `useEffect` if they determine layout. It causes a "pop" effect. Evaluate server-side or use a loading skeleton while the flag loads.

### 💡 Pro Tip: Experiments
Experiments are just Feature Flags with structured variants.
1. Create Experiment in PostHog.
2. Use `posthog.getFeatureFlag('experiment-key')` to get the variant (`control`, `test-a`, etc.).
3. **Important**: Always capture the event that is your "Goal" in PostHog for the experiment to calculate significance.
