# The Road to Next

> A ticket management app that doesn't make you want to throw your laptop out the window

A full-stack ticket management application built with Next.js 16. It's got all the modern React stuff, smooth animations, collaborative discussions, and actually works properly. This project shows how to build real applications with Server Components, authentication, and interactions that feel good to use.

---

## What You Get Here

This is a complete ticket management system that actually works and doesn't look terrible. Built following Robin Wieruch's Next.js course, but with considerable polish because why not make things nice?

**What's working right now:** Sign up, create tickets with bounties and deadlines, discuss them with threaded comments, search and filter everything, switch between light and dark themes, and track what matters with privacy-friendly analytics.

### The Good Stuff

- **Authentication that works** — Sign up, sign in, stay signed in. Uses Lucia Auth so it's secure
- **Complete ticket system** — Create, edit, delete, search, filter, sort, paginate. With bounties and deadlines
- **Threaded discussions** — Comments on every ticket. Edit, delete, real conversations
- **Real database** — PostgreSQL with Prisma. Your data actually gets saved
- **Smart data fetching** — React Query handles caching, updates, and all the complicated stuff
- **URL state management** — Search params in the URL so you can bookmark filtered views
- **Dark mode** — Because staring at bright screens at 2am is painful
- **Nice animations** — Buttons appear with a subtle stagger. Timed at 68ms because details matter
- **Clean UI** — Uses shadcn/ui components, looks professional without trying too hard
- **Privacy-first analytics** — Know what's happening without creeping on your users
- **Keyboard friendly** — Tab through everything, screen readers work, focus indicators are visible

---

## The Tech Stack

### Main Technologies
```
Next.js 16 (beta)  ━━━  The React framework everyone's using (App Router)
React 19.2         ━━━  Latest React with React Compiler enabled
TypeScript 5       ━━━  JavaScript but with types (saves you from bugs)
Tailwind CSS 4     ━━━  CSS utility classes (no more writing CSS files)
```

### Data & State
```
Prisma ORM         ━━━  Makes database queries type-safe and easy
PostgreSQL         ━━━  The database that stores everything
React Query        ━━━  Server state management (caching, updates, mutations)
React Hook Form    ━━━  Client-side form management with validation
nuqs               ━━━  Type-safe URL search params (shareable filters)
Zod                ━━━  Schema validation that actually makes sense
```

### Authentication & Security
```
Lucia Auth         ━━━  Handles user sessions securely
@node-rs/argon2    ━━━  Password hashing (the fast, secure kind)
```

### UI & Interactions
```
shadcn/ui          ━━━  Pre-built components that look good
Motion             ━━━  Makes things move smoothly (spring physics)
next-themes        ━━━  Dark/light mode that remembers your choice
Sonner             ━━━  Toast notifications that don't get in the way
Lucide React       ━━━  Icons that are actually nice
```

### Analytics & Monitoring
```
Umami Analytics    ━━━  Privacy-friendly analytics (no cookies)
```

### Developer Experience
```
ESLint             ━━━  Catches mistakes before you deploy
Prettier           ━━━  Formats code consistently (no more style debates)
Turbopack          ━━━  Fast builds and hot reload
 ```

---

## How It's Organized

### File Structure (The Important Parts)
```
src/
├── features/              # Everything organized by what it does
│   ├── auth/             # Login, signup, session management
│   ├── accounts/         # User profile, password changes
│   ├── ticket/           # Tickets with search, filter, sort, status
│   └── comment/          # Threaded discussions on tickets
├── components/
│   ├── ui/               # Reusable components (buttons, inputs, etc.)
│   ├── sidebar/          # Left sidebar navigation
│   ├── theme/            # Dark/light mode switcher
│   └── analytics-tracker.tsx  # Privacy-friendly analytics
├── lib/
│   ├── umami.ts          # Analytics utilities (trackEvent, identifyUser)
│   ├── lucia.ts          # Authentication config
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
├── app/                  # The actual pages you see
│   ├── (authenticated)/  # Routes that require login
│   ├── sign-in/          # Login page
│   ├── sign-up/          # Registration page
│   └── layout.tsx        # Root layout with providers
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Sample data generator
```

### Database Setup
Uses PostgreSQL with four main tables:
- **Users** — Stores user accounts (username, email, hashed passwords)
- **Sessions** — Keeps track of who's logged in
- **Tickets** — All your ticket data (title, content, status, bounty, deadline)
- **TicketComments** — Threaded discussions on each ticket

---

## The Nice Details

### Animations That Don't Annoy You
- Buttons appear in sequence with a 68ms delay (fast enough to feel snappy, slow enough to notice)
- Uses spring physics for smooth movement (not the jarring kind)
- Everything works with keyboard navigation
- Hover effects that respond but don't go crazy
- Dark mode transitions smoothly without flashing

### Language That Makes Sense
- Uses friendly words: "Inspect" instead of "View", "Refine" instead of "Edit"
- Loading messages that aren't boring: "Summoning your tickets..."
- Error messages that actually help: "The universe hiccupped" (with instructions on what to do)
- Button labels that tell you what they do

### Works for Everyone
- Proper HTML structure for screen readers
- Everything has labels for accessibility tools
- You can navigate the entire app with just your keyboard
- High contrast colors so text is actually readable
- Focus indicators that are visible but not obnoxious

### Analytics That Respect Your Users
Built-in privacy-friendly analytics with Umami. No cookies, no creepy tracking, just the insights you actually need.

**What's being tracked:**
- User journeys (sign-up → first ticket → engagement)
- 11 events with rich metadata (bounty ranges, comment lengths, ticket statuses)
- Cross-session user identification (so you can see who comes back)

**What's NOT being tracked:**
- Third-party cookies
- Personal browsing history
- Anything that would make privacy advocates nervous

**The clever bits:**
- Proxied through `/spaghetti/u` to bypass ad blockers (because legitimate analytics shouldn't be blocked)
- Auto-excludes localhost (your dev testing won't pollute production data)
- Respects "Do Not Track" browser settings
- User data stays in your Umami instance, not scattered across the internet

**Implementation details:** Check `docs/UMAMI_*.md` for the full story — there's a 1,400-line documentation suite because we believe in explaining things properly. The analytics layer is fully reusable: copy two files, change one import, deploy. Works with Next-Auth, Clerk, Supabase, or whatever auth system you prefer.

*Analytics that answer "what happened?" without feeling like surveillance.*

---

## Getting It Running

### What You Need
- Node.js 18 or newer (check with `node --version`)
- PostgreSQL database (local or hosted, something like Neon works great)
- npm or yarn (whatever you prefer)

### Setup Steps
```bash
# Install everything
npm install

# Copy the environment file and fill in your database URL
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Set up the database
npx prisma generate
npx prisma db push
npm run seed          # Adds some example tickets and a test user

# Start the app
npm run dev           # Opens on http://localhost:3000
```

### Useful Commands
```bash
npm run dev          # Start development with Turbopack (fast hot reload)
npm run build        # Build for production
npm run start        # Run production build locally
npm run lint         # Check for code issues
npm run lint:fix     # Fix auto-fixable issues
npm run type         # Check TypeScript errors
npm run format       # Format code with Prettier
npm run seed         # Add sample data to database
```

---

## What's Working and What's Not

### ✅ Working Right Now
- [x] User authentication (sign up, sign in, sessions)
- [x] Full ticket management (create, edit, delete, view)
- [x] Ticket bounties and deadlines (manage priorities)
- [x] Ticket status workflow (OPEN → IN_PROGRESS → DONE)
- [x] Threaded comments (discuss tickets with the team)
- [x] Search and filtering (find tickets by content)
- [x] Sorting (by date, status, bounty)
- [x] Pagination (handle hundreds of tickets)
- [x] Account management (change password, update profile)
- [x] Database storage (everything gets saved)
- [x] Dark/light theme switching (remembers your preference)
- [x] URL state management (shareable filtered views)
- [x] Accessibility features (keyboard nav, screen readers)
- [x] Form validation (tells you when you mess up)
- [x] Clean UI design (looks professional)
- [x] Privacy-friendly analytics (tracks what matters, respects users)
- [x] Optimistic updates (instant feedback with React Query)
- [ ] Mobile responsive (mostly works, could be better)

### 🔄 Recently Added
- [x] React Compiler (automatic memoization, faster renders)
- [x] Comprehensive analytics (11 tracked events with metadata)
- [x] Documentation suite (1,400+ lines of guides)
- [x] Sidebar navigation (easier to get around)
- [x] Toast notifications (feedback that doesn't block you)

### 📋 Maybe Someday Features
- [ ] Team collaboration (share tickets with others)
- [ ] File attachments (add images, documents to tickets)
- [ ] Email notifications (get notified about updates)
- [ ] Ticket assignments (assign tickets to team members)
- [ ] Advanced reporting (charts, trends, productivity metrics)
- [ ] Mobile app (native iOS/Android)
- [ ] API access (integrate with other tools)
- [ ] Webhooks (trigger actions in other apps)

---

## The Approach

This project tries to prove that apps can work well AND feel good to use. Every little detail is considered, from how long animations take to what error messages say to how search params are handled.

**Code Quality:** Uses TypeScript everywhere, ESLint catches mistakes, Prettier formats consistently, and the React Compiler optimizes automatically. Feature-based organization makes finding things easy. Still improving but pretty solid.

**User Experience:** Small interactions that feel nice, works for people using assistive technology, looks clean and professional. Theme switching that doesn't flash. Loading states that inform without annoying. Always tweaking and improving.

**Architecture:** Code is organized by features (auth stuff with auth stuff, ticket stuff with ticket stuff, comment stuff with comment stuff). Makes it easier to find things and add new features. Server Actions for mutations, React Query for fetching, URL state for filters.

**Performance:** React Compiler for automatic optimization, React Query for smart caching, optimistic updates for instant feedback, Turbopack for fast builds. Feels snappy even with hundreds of tickets.

---

## Learning Journey

This project follows **[The Road to Next](https://www.road-to-next.com)** by Robin Wieruch — a really good course about building modern web apps with Next.js.

**What You'll Learn from This Code:**
- Server Components and Server Actions (the new React way)
- Authentication with Lucia (secure user sessions without the complexity)
- Database stuff with Prisma (type-safe queries that prevent bugs)
- React Query patterns (caching, optimistic updates, mutations)
- URL state management with nuqs (shareable filters)
- TypeScript patterns that actually help
- Building UIs that look professional
- Making apps accessible to everyone
- Privacy-friendly analytics (know what's happening without being creepy)
- Feature-based architecture (organize by what it does, not what it is)

---

## Contributing

Feel free to suggest improvements or report bugs. Just keep the code clean, maintain the whimsical tone, and make sure accessibility features still work.

**Good areas to help with:** Making things faster, improving accessibility, adding useful features that fit the current vibe, better mobile responsiveness, more test coverage.

**Please don't:** Add tracking that violates privacy, break keyboard navigation, remove animations without good reason, make error messages boring.

---

## Documentation

### Analytics Documentation
- **[Umami Overview](docs/UMAMI_README.md)** — Start here: understand the documentation structure
- **[Analytics Guide](docs/UMAMI_ANALYTICS_GUIDE.md)** — How analytics works in *this* project
- **[Setup Guide](docs/UMAMI_SETUP_GUIDE.md)** — Set up Umami in *new* projects
- **[Package Reference](docs/UMAMI_PACKAGE_README.md)** — API reference for reusable components

### React Patterns
- **[React Query Guide](REACT_QUERY_GUIDE.md)** — Server state management patterns
- **[nuqs Guide](docs/NUQS_GUIDE.md)** — Type-safe URL search params

### Project Documentation
- **[Project Overview](PROJECT.md)** — Architecture, patterns, and learning journey

---

*Built with care for the details. Every interaction is intentional, even at 2am.*
