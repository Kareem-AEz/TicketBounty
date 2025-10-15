# Umami Analytics - Plug & Play Setup Guide

> **Copy these files to any Next.js project for instant Umami analytics**

## 📖 About This Document

**Purpose:** Step-by-step instructions for setting up Umami in a NEW project.  
**Audience:** Developers copying this analytics setup to another project.  
**When to use:** When you want to reuse these Umami utilities in a different codebase.

**Other Umami Docs:**
- 📦 **[UMAMI_PACKAGE_README.md](./UMAMI_PACKAGE_README.md)** - Quick reference & API docs
- 📊 **[UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md)** - THIS project's implementation

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Copy Core Files

```bash
# Copy the utility library (no changes needed)
cp src/lib/umami.ts YOUR_PROJECT/src/lib/umami.ts

# Copy the analytics tracker component
cp src/components/analytics-tracker.tsx YOUR_PROJECT/src/components/analytics-tracker.tsx
# Note: You'll need to adapt the useAuth hook to your auth system (see Step 4)
```

### Step 2: Configure Next.js Proxy

**File:** `next.config.ts` or `next.config.js`

```typescript
const nextConfig = {
  // ... other config

  rewrites: async () => {
    return [
      {
        source: "/stats/script.js", // Custom path (bypasses ad blockers)
        destination: "https://YOUR-UMAMI-INSTANCE.com/script.js",
        // Examples:
        // - Self-hosted: "https://analytics.yourdomain.com/script.js"
        // - Umami Cloud: "https://cloud.umami.is/script.js"
      },
    ];
  },
};

export default nextConfig;
```

### Step 3: Add Script to Root Layout

**File:** `app/layout.tsx` (App Router) or `pages/_app.tsx` (Pages Router)

#### App Router (Next.js 13+)

```tsx
import Script from "next/script";
import AnalyticsTracker from "@/components/analytics-tracker";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsTracker /> {/* Add this */}
        {children}

        {/* Add this before </body> */}
        <Script
          src="/stats/script.js"
          data-website-id="YOUR-WEBSITE-ID-FROM-UMAMI"
          strategy="afterInteractive"
          data-do-not-track="true"
        />
      </body>
    </html>
  );
}
```

#### Pages Router (Next.js 12 and below)

```tsx
import Script from "next/script";
import AnalyticsTracker from "@/components/analytics-tracker";

export default function App({ Component, pageProps }) {
  return (
    <>
      <AnalyticsTracker />
      <Component {...pageProps} />
      <Script
        src="/stats/script.js"
        data-website-id="YOUR-WEBSITE-ID-FROM-UMAMI"
        strategy="afterInteractive"
        data-do-not-track="true"
      />
    </>
  );
}
```

### Step 4: Adapt Analytics Tracker to Your Auth System

The `analytics-tracker.tsx` file uses a `useAuth()` hook. Simply update the import to match your auth system:

#### Option A: With Next-Auth

```tsx
// src/components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { disableAnalyticsForLocalhost, identifyUser } from "@/lib/umami";

export default function AnalyticsTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    disableAnalyticsForLocalhost();
  }, []);

  useEffect(() => {
    if (status !== "loading" && session?.user) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        session_start: new Date().toISOString(),
      });
    }
  }, [session, status]);

  return null;
}
```

#### Option B: With Clerk

```tsx
// src/components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { disableAnalyticsForLocalhost, identifyUser } from "@/lib/umami";

export default function AnalyticsTracker() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    disableAnalyticsForLocalhost();
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username,
        session_start: new Date().toISOString(),
      });
    }
  }, [user, isLoaded]);

  return null;
}
```

#### Option C: With Supabase

```tsx
// src/components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { disableAnalyticsForLocalhost, identifyUser } from "@/lib/umami";

export default function AnalyticsTracker() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    disableAnalyticsForLocalhost();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      identifyUser(user.id, {
        email: user.email,
        session_start: new Date().toISOString(),
      });
    }
  }, [user, isLoading]);

  return null;
}
```

#### Option D: No Auth System

```tsx
// src/components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { disableAnalyticsForLocalhost } from "@/lib/umami";

export default function AnalyticsTracker() {
  useEffect(() => {
    disableAnalyticsForLocalhost();
  }, []);

  return null;
}
```

---

## 📋 Full Setup Checklist

- [ ] Copy `src/lib/umami.ts` to your project (works as-is)
- [ ] Copy `src/components/analytics-tracker.tsx` to your project
- [ ] Update `analytics-tracker.tsx` to use your auth hook (simple import change)
- [ ] Add rewrite to `next.config.ts` with your Umami URL
- [ ] Add `<Script>` tag to root layout with your website ID
- [ ] Add `<AnalyticsTracker />` to root layout
- [ ] Test on localhost (should be disabled)
- [ ] Deploy and verify events in Umami dashboard

---

## 🎯 Using Analytics in Your Components

### Method 1: HTML Data Attributes (Recommended)

```tsx
// Simple event
<button data-umami-event="button-click">
  Click Me
</button>

// Event with properties
<button 
  data-umami-event="checkout"
  data-umami-event-plan="premium"
  data-umami-event-price="99"
>
  Buy Now
</button>
```

### Method 2: Programmatic Tracking

```tsx
import { trackEvent } from "@/lib/umami";

// In an event handler
const handleSearch = async (query: string) => {
  const results = await searchAPI(query);
  
  trackEvent("search", {
    query,
    results_count: results.length,
  });
};

// In a useEffect
useEffect(() => {
  trackEvent("page-view", {
    path: window.location.pathname,
  });
}, []);
```

### Method 3: Identify Users

```tsx
import { identifyUser } from "@/lib/umami";

// After successful login
const handleLogin = async (credentials) => {
  const user = await login(credentials);
  
  identifyUser(user.id, {
    email: user.email,
    plan: user.subscriptionPlan,
  });
};
```

---

## 🔧 Framework Adaptations

### React (Create React App)

```tsx
// src/lib/umami.ts - Same file, works as-is

// src/index.tsx or src/App.tsx
import { useEffect } from 'react';
import { disableAnalyticsForLocalhost } from './lib/umami';

function App() {
  useEffect(() => {
    disableAnalyticsForLocalhost();
    
    // Load Umami script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://YOUR-UMAMI-INSTANCE.com/script.js';
    script.setAttribute('data-website-id', 'YOUR-WEBSITE-ID');
    script.setAttribute('data-do-not-track', 'true');
    document.body.appendChild(script);
  }, []);

  return <div>Your App</div>;
}
```

### Remix

```tsx
// app/root.tsx
import { Scripts } from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <body>
        {/* Your app */}
        <Scripts />
        <script
          async
          src="https://YOUR-UMAMI-INSTANCE.com/script.js"
          data-website-id="YOUR-WEBSITE-ID"
          data-do-not-track="true"
        />
      </body>
    </html>
  );
}

// In a client component
import { trackEvent } from "~/lib/umami";
```

### Astro

```astro
---
// src/layouts/Layout.astro
---
<html>
  <body>
    <slot />
    <script
      async
      src="https://YOUR-UMAMI-INSTANCE.com/script.js"
      data-website-id="YOUR-WEBSITE-ID"
      data-do-not-track="true"
    ></script>
  </body>
</html>
```

### Vanilla JS/HTML

```html
<!-- index.html -->
<script src="/lib/umami.js"></script>
<script
  async
  src="https://YOUR-UMAMI-INSTANCE.com/script.js"
  data-website-id="YOUR-WEBSITE-ID"
  data-do-not-track="true"
></script>

<button data-umami-event="button-click">Click Me</button>

<script>
  // Programmatic tracking
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    window.umami.track('search', {
      query: e.target.query.value
    });
  });
</script>
```

---

## 🎨 Optional Enhancements

### Track Page Views Automatically

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/umami";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page-view", { path: pathname });
  }, [pathname]);

  return null;
}

// Add to layout.tsx
<PageViewTracker />
```

### Track Performance Metrics

```tsx
"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/umami";

export function PerformanceTracker() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.performance) {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      trackEvent("performance", {
        page_load_time: pageLoadTime,
        path: window.location.pathname,
      });
    }
  }, []);

  return null;
}
```

### Track Errors

```tsx
"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/umami";

export function ErrorTracker() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent("javascript-error", {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
      });
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return null;
}
```

---

## 📊 Environment Variables (Optional)

Create a `.env` file:

```bash
# Umami Configuration
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id-here
NEXT_PUBLIC_UMAMI_HOST_URL=https://your-umami-instance.com
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

Use in your code:

```tsx
// next.config.ts
rewrites: async () => [{
  source: "/stats/script.js",
  destination: `${process.env.NEXT_PUBLIC_UMAMI_HOST_URL}/script.js`,
}]

// layout.tsx
{process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && (
  <Script
    src="/stats/script.js"
    data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
    strategy="afterInteractive"
    data-do-not-track="true"
  />
)}
```

---

## ✅ Verification

### Test Localhost Exclusion

```bash
# Open browser console on localhost
localStorage.getItem('umami.disabled')
# Should return: "1"
```

### Test Event Tracking

```bash
# Open browser console on production
window.umami.track('test-event', { test: true })
# Check Umami dashboard for event
```

### Test User Identification

```bash
# Open browser console (when logged in)
window.umami.identify('test-user', { username: 'test' })
# Check Umami dashboard for session data
```

---

## 🎉 You're Done!

Your analytics are now:
- ✅ Privacy-friendly (no cookies, GDPR compliant)
- ✅ Ad-blocker resistant (via proxy)
- ✅ Localhost-excluded (clean data)
- ✅ User-tracking enabled (cross-session analytics)
- ✅ Fully typed (TypeScript support)

---

## 📚 Additional Resources

- [Umami Documentation](https://umami.is/docs)
- [Umami API Reference](https://umami.is/docs/api)
- [Next.js Script Optimization](https://nextjs.org/docs/pages/api-reference/components/script)

