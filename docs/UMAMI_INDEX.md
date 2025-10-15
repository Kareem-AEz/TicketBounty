# Umami Analytics - Documentation Index

## 🎯 Choose Your Path

```
┌─────────────────────────────────────────────────────────────┐
│                   UMAMI DOCUMENTATION                       │
└─────────────────────────────────────────────────────────────┘

        Working on           Setting up          Need quick
      THIS project?         NEW project?         reference?
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
    │ ANALYTICS     │    │  SETUP        │    │  PACKAGE      │
    │ GUIDE         │    │  GUIDE        │    │  README       │
    ├───────────────┤    ├───────────────┤    ├───────────────┤
    │ What's        │    │ Step-by-step  │    │ API docs      │
    │ tracked?      │    │ setup         │    │ Quick examples│
    │               │    │               │    │ Syntax lookup │
    │ How it works  │    │ Auth adapters │    │               │
    │               │    │               │    │               │
    │ Troubleshoot  │    │ Frameworks    │    │               │
    └───────────────┘    └───────────────┘    └───────────────┘
```

---

## 📖 The 3 Documents

### 1️⃣ [UMAMI_ANALYTICS_GUIDE.md](./UMAMI_ANALYTICS_GUIDE.md) - Implementation Guide
**425 lines** | **Read time: 10 min** | **Audience: This project's developers**

```
📊 THIS PROJECT'S IMPLEMENTATION
├── Overview & Features
├── File Structure
├── How It Works
│   ├── Script Loading
│   ├── Automatic Tracking
│   └── Event Tracking Methods
├── Usage Examples (4 real examples)
├── Events Being Tracked (11 events)
│   ├── Navigation (3)
│   ├── Authentication (3)
│   ├── Tickets (2 + metadata)
│   ├── Comments (2 + metadata)
│   └── System (1)
├── Analytics Dashboard Guide
├── Troubleshooting
└── Future Enhancements
```

**Start here if:** You're working on this codebase.

---

### 2️⃣ [UMAMI_SETUP_GUIDE.md](./UMAMI_SETUP_GUIDE.md) - Setup for New Projects
**550 lines** | **Read time: 15 min** | **Audience: Developers copying this to another project**

```
🚀 REUSABILITY GUIDE
├── Quick Setup (5 minutes)
│   ├── Step 1: Copy Files
│   ├── Step 2: Configure Proxy
│   ├── Step 3: Add Script
│   └── Step 4: Adapt Auth
├── Full Checklist
├── Usage in Components
│   ├── Method 1: HTML Attributes
│   ├── Method 2: Programmatic
│   └── Method 3: User Identification
├── Framework Adaptations
│   ├── React (CRA)
│   ├── Remix
│   ├── Astro
│   └── Vanilla JS
├── Optional Enhancements
│   ├── Page View Tracking
│   ├── Performance Metrics
│   └── Error Tracking
├── Environment Variables
└── Verification Steps
```

**Start here if:** You want to use this in a different project.

---

### 3️⃣ [UMAMI_PACKAGE_README.md](./UMAMI_PACKAGE_README.md) - Quick Reference
**233 lines** | **Read time: 5 min** | **Audience: Need quick syntax/examples**

```
📦 QUICK REFERENCE
├── Quick Start (3 steps)
├── Package Contents
├── Configuration
│   ├── Next.js Config
│   ├── Root Layout
│   └── Auth Adapter
├── API Reference
│   ├── trackEvent()
│   ├── identifyUser()
│   └── disableAnalyticsForLocalhost()
├── Usage Examples
│   ├── Button Clicks
│   ├── With Properties
│   └── Programmatic
├── Features List
└── Compatibility Matrix
```

**Start here if:** You know what you want, just need syntax.

---

## 🎓 Reading Guide

### Scenario 1: New to This Project
```
1. Read: UMAMI_ANALYTICS_GUIDE.md (Overview + How It Works)
2. Skim: Events Being Tracked section
3. Bookmark: UMAMI_PACKAGE_README.md for later reference
```

### Scenario 2: Copying to New Project  
```
1. Read: UMAMI_SETUP_GUIDE.md (all sections)
2. Keep open: UMAMI_PACKAGE_README.md (for syntax)
3. Reference: UMAMI_ANALYTICS_GUIDE.md (for inspiration)
```

### Scenario 3: Adding New Events
```
1. Check: UMAMI_ANALYTICS_GUIDE.md → Events Being Tracked
2. Look up: UMAMI_PACKAGE_README.md → Usage Examples
3. Implement & update: UMAMI_ANALYTICS_GUIDE.md
```

### Scenario 4: Debugging Issues
```
1. Go to: UMAMI_ANALYTICS_GUIDE.md → Troubleshooting
2. Test: Browser console commands
3. Verify: Umami dashboard
```

---

## 📏 Document Comparison

| Aspect | Analytics Guide | Setup Guide | Package README |
|--------|----------------|-------------|----------------|
| **Length** | 425 lines | 550 lines | 233 lines |
| **Scope** | THIS project | NEW projects | API reference |
| **Depth** | Deep | Detailed | Quick |
| **Examples** | Project-specific | Generic | Syntax-focused |
| **Updates** | When THIS changes | Rarely | Never (stable API) |

---

## 🔗 Cross-References

Each document links to the others at the top, so you can easily navigate:

```
ANALYTICS_GUIDE ←→ SETUP_GUIDE ←→ PACKAGE_README
       ↓                ↓                ↓
   [Project          [New              [API
  Implementation]   Projects]         Syntax]
```

---

## ✅ All Documentation Files

1. **UMAMI_README.md** (this file) - Overview of all docs
2. **UMAMI_INDEX.md** - Visual navigation guide
3. **UMAMI_ANALYTICS_GUIDE.md** - THIS project's implementation
4. **UMAMI_SETUP_GUIDE.md** - Setup for NEW projects
5. **UMAMI_PACKAGE_README.md** - Quick API reference

**Total:** 1,200+ lines of documentation  
**Coverage:** 100% of functionality documented  
**Examples:** 20+ code examples across all docs

---

**Pro tip:** Bookmark this page as your starting point for all Umami-related documentation!

