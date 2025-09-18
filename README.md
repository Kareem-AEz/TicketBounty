# The Road to Next

> A ticket management app that doesn't make you want to throw your laptop out the window

A full-stack ticket management application built with Next.js 15. It's got all the modern React stuff, some nice animations, and actually works properly. This project shows how to build real applications with Server Components, authentication, and interactions that feel good to use.

---

## What You Get Here

This is a complete ticket management system that actually works and doesn't look terrible. Built following Robin Wieruch's Next.js course, but with extra polish because why not make things nice?

**What's working right now:** You can sign up, sign in, create tickets, edit them, delete them, and everything is saved to a real database.

### The Good Stuff

- **Authentication that works** — Sign up, sign in, stay signed in. Uses Lucia Auth so it's secure
- **All the CRUD operations** — Create, read, update, delete tickets. Form validation included
- **Real database** — PostgreSQL with Prisma. Your data actually gets saved
- **Nice animations** — Buttons appear with a subtle stagger. Timed at 68ms because details matter
- **Clean UI** — Uses shadcn/ui components, looks professional without trying too hard
- **Keyboard friendly** — Tab through everything, screen readers work, focus indicators are visible

---

## The Tech Stack

### Main Technologies
```
Next.js 15.5.3      ━━━  The React framework everyone's using
React 19.1.1        ━━━  Latest React with all the new features
TypeScript 5        ━━━  JavaScript but with types (saves you from bugs)
Tailwind CSS 4      ━━━  CSS utility classes (no more writing CSS files)
```

### Other Important Stuff
```
Lucia Auth          ━━━  Handles user sessions securely
Prisma ORM          ━━━  Makes database queries type-safe and easy
PostgreSQL          ━━━  The database that stores everything
Motion              ━━━  Makes things move smoothly
shadcn/ui           ━━━  Pre-built components that look good
```

---

## How It's Organized

### File Structure (The Important Parts)
```
src/
├── features/              # Everything organized by what it does
│   ├── auth/             # All the login/signup stuff
│   ├── ticket/           # All the ticket management stuff
│   └── accounts/         # User profile stuff
├── components/ui/        # Reusable components (buttons, inputs, etc.)
├── lib/                  # Utility functions and config
└── app/                  # The actual pages you see
```

### Database Setup
Uses PostgreSQL with three main tables:
- **Users** — Stores user accounts
- **Sessions** — Keeps track of who's logged in (*Note: This is a learning example, not production-ready*)
- **Tickets** — All your ticket data

---

## The Nice Details

### Animations That Don't Annoy You
- Buttons appear in sequence with a 68ms delay (fast enough to feel snappy, slow enough to notice)
- Uses spring physics for smooth movement (not the jarring kind)
- Everything works with keyboard navigation
- Hover effects that respond but don't go crazy

### Language That Makes Sense
- Uses friendly words: "Inspect" instead of "View", "Refine" instead of "Edit"
- Loading messages that aren't boring: "Summoning your tickets..."
- Error messages that actually help: "The universe hiccupped" (with instructions on what to do)

### Works for Everyone
- Proper HTML structure for screen readers
- Everything has labels for accessibility tools
- You can navigate the entire app with just your keyboard
- High contrast colors so text is actually readable

---

## Getting It Running

### What You Need
- Node.js 18 or newer (check with `node --version`)
- PostgreSQL database (local or hosted)
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
npm run seed          # Adds some example tickets

# Start the app
npm run dev           # Opens on http://localhost:3000
```

### Useful Commands
```bash
npm run dev          # Start development (with hot reload)
npm run build        # Build for production
npm run lint         # Check for code issues
npm run type         # Check TypeScript errors
npm run seed         # Add sample data to database
```

---

## What's Working and What's Not

### ✅ Working Right Now
- [x] User authentication (sign up, sign in, sessions)
- [x] Full ticket management (create, edit, delete, view)
- [x] Database storage (everything gets saved)
- [ ] Mobile responsive (mostly works, could be better)
- [x] Accessibility features (keyboard nav, screen readers)
- [x] Form validation (tells you when you mess up)
- [x] Clean UI design (looks professional)

### 🔄 Currently Working On
- [x] Search and filtering (find your tickets easily)
- [ ] Real-time updates (see changes instantly)
- [x] Performance improvements (making it faster)
- [x] User profile features (manage your account)
- [x] Better ticket workflows (status management)

### 📋 Maybe Someday Features
- [ ] Team collaboration (share tickets with others)
- [ ] File attachments (add images, documents)
- [ ] Reporting and analytics (see your productivity)
- [ ] Mobile app (native iOS/Android)
- [ ] API access (integrate with other tools)

---

## The Approach

This project tries to prove that apps can work well AND feel good to use. Every little detail is considered, from how long animations take to what error messages say.

**Code Quality:** Uses TypeScript everywhere, ESLint catches mistakes, and everything is formatted consistently. Still improving but pretty solid.

**User Experience:** Small interactions that feel nice, works for people using assistive technology, looks clean and professional. Always tweaking and improving.

**Architecture:** Code is organized by features (auth stuff with auth stuff, ticket stuff with ticket stuff). Makes it easier to find things and add new features.

---

## Learning Journey

This project follows **[The Road to Next](https://www.road-to-next.com)** by Robin Wieruch — a really good course about building modern web apps with Next.js.

**What You'll Learn from This Code:**
- Server Components and Server Actions (the new React way)
- Authentication with Lucia (secure user sessions)
- Database stuff with Prisma (type-safe queries)
- TypeScript patterns that actually help
- Building UIs that look professional
- Making apps accessible to everyone

---

## Contributing

Feel free to suggest improvements or report bugs. Just keep the code clean and make sure accessibility features still work.

**Good areas to help with:** Making things faster, improving accessibility, adding useful features that fit the current vibe.

---

*Built with care for the details. Every interaction is intentional, even at 2am.*