# Umami Analytics Documentation

> **Privacy-friendly, production-ready analytics for Next.js**

## 📚 Documentation Structure

We have 3 documents, each serving a specific purpose:

### 📊 [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md)
**What:** Complete guide to how Umami is integrated into THIS project.  
**For:** Developers working on this codebase.  
**Use when:** You need to understand what's tracked, troubleshoot, or extend functionality.

**Contents:**
- File structure overview
- How tracking works (script loading, auto-tracking, events)
- Complete list of tracked events with properties
- Usage examples specific to this project
- Troubleshooting guide

---

### 🚀 [UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md)
**What:** Step-by-step setup instructions for NEW projects.  
**For:** Developers copying this setup to another codebase.  
**Use when:** You want to reuse these utilities in a different project.

**Contents:**
- Quick setup (5-minute guide)
- Copy instructions for core files
- Configuration steps (Next.js, auth adapters)
- Framework adaptations (React, Remix, Astro, etc.)
- Optional enhancements
- Verification steps

---

### 📦 [UMAMI_PACKAGE_README.md](./UMAMI_PACKAGE_README.md)
**What:** Quick reference and API documentation.  
**For:** Developers who need quick syntax lookups.  
**Use when:** You know what you want but need examples/syntax.

**Contents:**
- Package overview
- API reference (`trackEvent`, `identifyUser`, etc.)
- Quick usage examples
- Feature list
- Compatibility matrix

---

## 🎯 Quick Navigation

**I want to...**

| Goal | Read This |
|------|-----------|
| Understand this project's analytics | [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md) |
| Set up Umami in a new project | [UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md) |
| Look up syntax for `trackEvent()` | [UMAMI_PACKAGE_README.md](./UMAMI_PACKAGE_README.md) |
| See what events are tracked here | [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md) → Events Section |
| Debug tracking issues | [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md) → Troubleshooting |
| Copy to another project | [UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md) |
| Adapt for Next-Auth/Clerk | [UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md) → Step 4 |

---

## 📁 Files Overview

```
umami-analytics/
├── Core Implementation
│   ├── src/lib/umami.ts                 # Utilities (trackEvent, identifyUser)
│   └── src/components/analytics-tracker.tsx  # Auto-tracking component
│
├── Documentation
│   ├── UMAMI_README.md                  # This file (overview)
│   ├── UMAMI_ANALYTICS_GUIDE.md         # THIS project's implementation
│   ├── UMAMI_SETUP_GUIDE.md             # Setup for NEW projects
│   └── UMAMI_PACKAGE_README.md          # Quick reference
│
└── Event Tracking
    ├── src/features/auth/components/*   # Auth events
    ├── src/features/ticket/components/* # Ticket events with metadata
    ├── src/features/comment/components/* # Comment events with metadata
    └── src/components/header.tsx        # Navigation events
```

---

## ✨ Key Features

- ✅ **Privacy-Friendly** - No cookies, GDPR compliant
- ✅ **User Tracking** - Cross-session identification
- ✅ **Rich Metadata** - Event properties (bounty range, comment length, etc.)
- ✅ **Ad-Blocker Resistant** - Proxied via Next.js rewrites
- ✅ **Localhost Excluded** - Clean production data
- ✅ **TypeScript** - Fully typed with IntelliSense
- ✅ **Zero Dependencies** - Pure React/Next.js
- ✅ **Well Documented** - 1,200+ lines of docs with examples

---

## 🚀 Quick Start

### For This Project
Analytics are already set up! See [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md) to understand what's tracked.

### For New Projects
1. Read [UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md)
2. Copy 2 files (`umami.ts` + `analytics-tracker.tsx`)
3. Configure (3 changes: Next.js config, layout, auth hook)
4. Deploy and track! 📊

---

## 📊 What's Being Tracked

**11 unique events** across:
- 🔐 Authentication (sign-in, sign-up, sign-out)
- 🎫 Tickets (create/update with status, bounty, deadline)
- 💬 Comments (create/update with length, code detection)
- 🧭 Navigation (home, sign-in, sign-up links)
- 🗑️ System actions (delete confirmations)

Plus **user identification** with:
- User ID (cross-session tracking)
- Username & email (for support/debugging)
- Session timestamps

---

## 🤝 Contributing

Want to improve the analytics setup?
1. Read [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md) to understand current implementation
2. Make your changes
3. Update relevant documentation
4. Test in production

---

## 📚 External Resources

- **Umami Docs**: https://umami.is/docs
- **API Reference**: https://umami.is/docs/api
- **Event Tracking**: https://umami.is/docs/track-events
- **Next.js Script**: https://nextjs.org/docs/pages/api-reference/components/script

---

**Last Updated:** October 2025  
**Umami Version:** Cloud (Latest)  
**Lines of Code:** 441 (utilities + components)  
**Lines of Docs:** 1,200+ (you're reading part of it!)

