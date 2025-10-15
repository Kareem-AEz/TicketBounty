# Umami Analytics Integration Guide

> **Complete documentation for Umami analytics implementation in this Next.js app**

## 📖 About This Document

**Purpose:** Understanding how Umami is integrated into THIS specific project.  
**Audience:** Developers working on this codebase.  
**When to use:** When you need to understand what events are tracked, how tracking works, or how to troubleshoot issues in this project.

**Other Umami Docs:**
- 📦 **[UMAMI_PACKAGE_README.md](./UMAMI_PACKAGE_README.md)** - Quick reference & package overview
- 🚀 **[UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md)** - Step-by-step setup for NEW projects

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [How It Works](#how-it-works)
4. [Usage Examples](#usage-examples)
5. [Events Being Tracked](#events-being-tracked)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This app uses **Umami** - a privacy-friendly, open-source alternative to Google Analytics.

**Key Features:**
- ✅ No cookies (privacy-friendly)
- ✅ GDPR compliant
- ✅ User identification (cross-session tracking)
- ✅ Custom event tracking with metadata
- ✅ Automatic localhost exclusion
- ✅ Do Not Track support

---

## 📁 File Structure

```
src/
├── lib/
│   └── umami.ts                      # Utility functions for tracking
├── components/
│   └── analytics-tracker.tsx         # Auto-tracking component
├── app/
│   └── layout.tsx                    # Umami script integration
└── features/
    ├── auth/
    │   └── components/
    │       ├── sign-in-form.tsx      # "sign-in-submit" event
    │       ├── sign-up-form.tsx      # "sign-up-submit" event
    │       └── sign-out-button.tsx   # "sign-out" event
    ├── ticket/
    │   └── components/
    │       └── ticket-upsert-form.tsx # "ticket-create/update" with metadata
    └── comment/
        └── components/
            └── comment-form.tsx       # "comment-create/update" with metadata
```

---

## ⚙️ How It Works

### 1. Script Loading (`layout.tsx`)

```tsx
<Script
  src="/spaghetti/u"                           // Proxied path (bypasses ad blockers)
  data-website-id="62c38894-..."               // Your Umami website ID
  strategy="afterInteractive"                  // Load after page is interactive
  data-do-not-track="true"                     // Respect user's DNT setting
/>
```

**Why `/spaghetti/u`?**  
The path is proxied via `next.config.ts` to bypass ad blockers:
```ts
rewrites: async () => [{
  source: "/spaghetti/u",
  destination: "https://cloud.umami.is/script.js",
}]
```

### 2. Automatic Tracking (`analytics-tracker.tsx`)

Mounted once in `layout.tsx`, this component:

1. **Disables analytics on localhost**
   - Checks hostname on mount
   - Sets `umami.disabled` flag in localStorage
   - Prevents dev activity from polluting analytics

2. **Identifies authenticated users**
   - Runs when user signs in/out
   - Links events to specific user ID
   - Enables retention & user journey analysis

### 3. Event Tracking (Two Methods)

#### Method A: HTML Data Attributes (Recommended)

```tsx
<button 
  data-umami-event="ticket-create"
  data-umami-event-status="OPEN"
  data-umami-event-has-bounty="true"
>
  Create Ticket
</button>
```

#### Method B: Programmatic (For Dynamic Events)

```tsx
import { trackEvent } from '@/lib/umami';

const handleSearch = async (query: string) => {
  const results = await searchTickets(query);
  
  trackEvent('search', {
    query,
    results_count: results.length,
    has_filters: filters.length > 0
  });
};
```

---

## 💡 Usage Examples

### Example 1: Track Form Submission

```tsx
import { trackEvent } from '@/lib/umami';

const handleSubmit = async (data: FormData) => {
  try {
    await createTicket(data);
    
    trackEvent('ticket-create-success', {
      has_bounty: data.bounty > 0,
      has_deadline: !!data.deadline
    });
  } catch (error) {
    trackEvent('ticket-create-error', {
      error_message: error.message
    });
  }
};
```

### Example 2: Track User Actions

```tsx
// In a client component
"use client";

import { trackEvent } from '@/lib/umami';

export default function TicketCard({ ticket }) {
  const handleShare = () => {
    navigator.share({ url: window.location.href });
    
    trackEvent('ticket-share', {
      ticket_id: ticket.id,
      share_method: 'native'
    });
  };

  return (
    <button onClick={handleShare}>Share</button>
  );
}
```

### Example 3: Track Page Views

```tsx
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/umami';

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent('page-view', {
      path: pathname,
      referrer: document.referrer
    });
  }, [pathname]);

  return null;
}
```

### Example 4: Identify User After Sign-Up

```tsx
import { identifyUser } from '@/lib/umami';

const handleSignUp = async (credentials) => {
  const user = await createUser(credentials);
  
  // Identify user for cross-session tracking
  identifyUser(user.id, {
    username: user.username,
    email: user.email,
    signup_method: 'email',
    signup_date: new Date().toISOString()
  });
};
```

---

## 📊 Events Being Tracked

### Navigation Events
| Event | Properties | Trigger |
|-------|-----------|---------|
| `home-route` | None | Click on logo/home link |
| `sign-in-route` | None | Click "Sign In" button |
| `sign-up-route` | None | Click "Sign Up" button |

### Authentication Events
| Event | Properties | Trigger |
|-------|-----------|---------|
| `sign-in-submit` | None | Submit sign-in form |
| `sign-up-submit` | None | Submit sign-up form |
| `sign-out` | None | Click sign-out button |

### Ticket Events
| Event | Properties | Trigger |
|-------|-----------|---------|
| `ticket-create` | `status`, `has_bounty`, `bounty_range`, `has_deadline` | Create new ticket |
| `ticket-update` | `status`, `has_bounty`, `bounty_range`, `has_deadline` | Update existing ticket |

**Property Details:**
- `status`: `"OPEN"` \| `"IN_PROGRESS"` \| `"DONE"`
- `has_bounty`: `"true"` \| `"false"`
- `bounty_range`: `"none"` \| `"low"` (<$50) \| `"medium"` ($50-$200) \| `"high"` (>$200)
- `has_deadline`: `"true"` \| `"false"`

### Comment Events
| Event | Properties | Trigger |
|-------|-----------|---------|
| `comment-create` | `length`, `has_code` | Create new comment |
| `comment-update` | `length`, `has_code` | Update existing comment |

**Property Details:**
- `length`: `"short"` (<50) \| `"medium"` (50-200) \| `"long"` (>200 chars)
- `has_code`: `"true"` \| `"false"` (detects ``` in content)

### System Events
| Event | Properties | Trigger |
|-------|-----------|---------|
| `delete-confirm` | None | Confirm deletion action |

---

## 📈 Analytics Dashboard

### What You Can Track in Umami

#### 1. **User Journeys**
See individual user paths from sign-up to engagement:
```
User #abc123:
- Jan 1: sign-up-submit
- Jan 1: ticket-create (status: OPEN, bounty: low)
- Jan 2: comment-create (length: medium)
- Jan 3: sign-in-submit (returned after 2 days ✓)
```

#### 2. **Conversion Funnels**
```
Landing Page       → 100 visitors
Click Sign Up      → 60 visitors (60% CTR)
Submit Sign Up     → 45 users (75% conversion)
Create First Ticket→ 30 users (67% activation)
```

#### 3. **Feature Usage**
- Do tickets with bounties get more engagement?
- What's the most common bounty range?
- Do users prefer setting deadlines?
- What's the optimal comment length?

#### 4. **Retention Metrics**
- How many users return after 7 days?
- Which cohort has best retention?
- When do users typically churn?

---

## 🔧 Troubleshooting

### Events Not Showing Up

**1. Check if Umami script loaded:**
```js
// In browser console
console.log(window.umami); 
// Should output: { track: ƒ, identify: ƒ }
```

**2. Check if localhost is disabled:**
```js
// In browser console
localStorage.getItem('umami.disabled');
// Should be "1" on localhost, null in production
```

**3. Verify website ID:**
```tsx
// In layout.tsx
data-website-id="62c38894-1534-4cd7-81a4-1764a97ad356"
// Must match your Umami dashboard
```

### User Identification Not Working

**Check auth state:**
```tsx
// In browser console (on production)
const { user } = useAuth();
console.log(user); // Should show user object when logged in
```

**Manually identify:**
```js
// In browser console
window.umami.identify('test-user-id', { test: true });
```

### Localhost Analytics Still Tracking

**Manually disable:**
```js
// In browser console
localStorage.setItem('umami.disabled', '1');
// Reload page
```

**Check hostname detection:**
```js
// In browser console
console.log(window.location.hostname);
// Should be "localhost" or "127.0.0.1" in development
```

---

## 🚀 Future Enhancements

### 1. Revenue Tracking
```tsx
trackEvent('bounty-claimed', {
  revenue: 50.00,
  currency: 'USD',
  ticket_id: 'abc123'
});
```

### 2. A/B Testing
```tsx
const variant = Math.random() > 0.5 ? 'A' : 'B';

trackEvent('page-load', {
  ab_test: 'homepage-layout',
  variant
});
```

### 3. Performance Tracking
```tsx
trackEvent('page-load-time', {
  duration: performance.timing.loadEventEnd - performance.timing.navigationStart,
  path: window.location.pathname
});
```

### 4. Error Tracking
```tsx
window.addEventListener('error', (event) => {
  trackEvent('javascript-error', {
    message: event.message,
    filename: event.filename,
    line: event.lineno
  });
});
```

---

## 📚 Additional Resources

- **Umami Docs**: https://umami.is/docs
- **API Reference**: https://umami.is/docs/api
- **Event Tracking**: https://umami.is/docs/track-events
- **User Identification**: https://umami.is/docs/tracker-functions

---

## ✅ Checklist

- [x] Umami script loaded in `layout.tsx`
- [x] Analytics tracker mounted globally
- [x] Localhost tracking disabled
- [x] Do Not Track enabled
- [x] User identification on auth
- [x] Navigation events tracked
- [x] Form submission events tracked
- [x] Ticket events with metadata tracked
- [x] Comment events with metadata tracked
- [ ] Set up Goals in Umami dashboard
- [ ] Create custom reports
- [ ] Configure alerts/notifications

---

**Last Updated:** January 2025  
**Umami Version:** Latest (Cloud)  
**Integration Type:** Client-side tracking with SSR support

