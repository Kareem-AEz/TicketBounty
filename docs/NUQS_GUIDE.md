# nuqs Implementation Guide

A practical guide for type-safe search params management in Next.js using nuqs.

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Setup & Configuration](#setup--configuration)
3. [Implementation Patterns](#implementation-patterns)
4. [Best Practices](#best-practices)
5. [Common Pitfalls](#common-pitfalls)
6. [Tips & Tricks](#tips--tricks)
7. [Real-World Examples](#real-world-examples)

---

## Quick Start

### Installation

```bash
npm install nuqs
```

### Adapter Setup (Required!)

```tsx
// src/app/layout.tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

---

## Setup & Configuration

### 1. Define Your Search Params Schema

**Create a single source of truth** for all search params:

```tsx
// src/lib/search-params.ts
import {
  createSearchParamsCache,
  Options,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server"; // ⚠️ Import from 'nuqs/server' for server components

// Step 1: Define global options (DRY principle)
export const searchOptions: Options = {
  shallow: false, // Critical: enables server re-renders
  history: "replace", // Prevents history clutter
  limitUrlUpdates: {
    // Built-in debounce
    method: "debounce",
    timeMs: 350,
  },
};

// Step 2: Define parsers with validation & defaults
export const searchParsers = {
  query: parseAsString.withDefault("").withOptions(searchOptions),
  sort: parseAsStringLiteral(["newest", "bounty"] as const)
    .withDefault("newest")
    .withOptions(searchOptions),
  page: parseAsInteger.withDefault(1).withOptions(searchOptions),
};

// Step 3: Create cache for server components
export const searchParamsCache = createSearchParamsCache(searchParsers);

// Step 4: Export derived types
export type ParsedSearchParams = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
```

**Why this pattern?**

- ✅ Single source of truth
- ✅ Automatic type inference
- ✅ Consistent behavior across all params
- ✅ Easy to maintain and extend

---

## Implementation Patterns

### Server Components (Pages)

```tsx
// src/app/tickets/page.tsx
import { searchParamsCache } from "@/lib/search-params";
import { type SearchParams } from "nuqs/server";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+
};

export default async function Page({ searchParams }: PageProps) {
  // ⚠️ CRITICAL: Call parse() to populate the cache
  const params = await searchParamsCache.parse(searchParams);

  // Option 1: Use parsed values directly
  const { query, sort } = params;

  return (
    <>
      <h1>Search: {query}</h1>
      <NestedServerComponent />
    </>
  );
}

// Access in deeply nested Server Components (no prop drilling!)
function NestedServerComponent() {
  const query = searchParamsCache.get("query");
  const sort = searchParamsCache.get("sort");
  // or: const { query, sort } = searchParamsCache.all()

  return <div>...</div>;
}
```

### Client Components (Forms/Inputs)

#### Single Parameter

```tsx
// src/components/search-input.tsx
"use client";
import { useQueryState } from "nuqs";
import { searchParsers } from "@/lib/search-params";

export default function SearchInput() {
  const [query, setQuery] = useQueryState("query", searchParsers.query);

  return (
    <input value={query ?? ""} onChange={(e) => setQuery(e.target.value)} />
  );
}
```

#### Multiple Parameters

```tsx
"use client";
import { useQueryStates } from "nuqs";
import { searchParsers } from "@/lib/search-params";

export default function Filters() {
  const [params, setParams] = useQueryStates(searchParsers);

  // Update single param
  setParams({ query: "bug" });

  // Update multiple params atomically
  setParams({ query: "bug", sort: "bounty", page: 1 });

  return <div>...</div>;
}
```

#### Type-Safe Select Components

```tsx
"use client";
import { useQueryState } from "nuqs";
import { searchParsers, type ParsedSearchParams } from "@/lib/search-params";

const OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Bounty", value: "bounty" },
] as const satisfies Array<{
  label: string;
  value: ParsedSearchParams["sort"]; // ← Derives type automatically
}>;

export default function SortSelect() {
  const [sort, setSort] = useQueryState("sort", searchParsers.sort);

  // Type-safe handler
  const handleChange = (value: ParsedSearchParams["sort"]) => {
    setSort(value);
  };

  return (
    <select
      value={sort}
      onChange={(e) =>
        handleChange(e.target.value as ParsedSearchParams["sort"])
      }
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

---

## Best Practices

### 1. ✅ Always Export Parsers

```tsx
// ❌ BAD: Parsers are inline, can't be reused
export const searchParamsCache = createSearchParamsCache({
  query: parseAsString.withDefault(""),
});

// ✅ GOOD: Parsers exported, reusable in client components
export const searchParsers = {
  query: parseAsString.withDefault(""),
};
export const searchParamsCache = createSearchParamsCache(searchParsers);
```

### 2. ✅ Use a Single Options Object

```tsx
// ❌ BAD: Options repeated everywhere
query: parseAsString.withDefault('').withOptions({ shallow: false }),
sort: parseAsStringLiteral(['newest']).withOptions({ shallow: false }),

// ✅ GOOD: Define once, apply everywhere
const options: Options = { shallow: false, history: 'replace' }
query: parseAsString.withDefault('').withOptions(options),
sort: parseAsStringLiteral(['newest']).withOptions(options),
```

### 3. ✅ Always Use `.withDefault()`

```tsx
// ❌ BAD: No default, value can be null
query: parseAsString;

// ✅ GOOD: Always has a value
query: parseAsString.withDefault("");
sort: parseAsStringLiteral(["newest", "bounty"]).withDefault("newest");
```

### 4. ✅ Import from Correct Package

```tsx
// Server Components & Shared Code
import { parseAsString, createSearchParamsCache } from "nuqs/server";

// Client Components
import { useQueryState, useQueryStates } from "nuqs";
```

### 5. ✅ Derive Types, Don't Duplicate

```tsx
// ❌ BAD: Manual type definition (can go out of sync)
type SearchParams = {
  query: string;
  sort: "newest" | "bounty";
};

// ✅ GOOD: Derived from cache (always in sync)
type ParsedSearchParams = Awaited<ReturnType<typeof searchParamsCache.parse>>;
```

---

## Common Pitfalls

### ❌ Pitfall #1: Forgetting `shallow: false`

**Problem:** URL updates but Server Components don't re-render

```tsx
// ❌ BAD: Default is shallow: true (client-only)
const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));
// URL changes, but server components show stale data!

// ✅ GOOD: Notify server to re-render
const [query, setQuery] = useQueryState(
  "query",
  parseAsString.withDefault("").withOptions({ shallow: false }),
);
```

### ❌ Pitfall #2: Forgetting to Call `.parse()`

**Problem:** Nested Server Components can't access search params

```tsx
// ❌ BAD: Cache not populated
export default async function Page({ searchParams }) {
  return <NestedComponent />; // Can't access params here!
}

// ✅ GOOD: Parse in page component
export default async function Page({ searchParams }) {
  await searchParamsCache.parse(searchParams); // ← Populates cache
  return <NestedComponent />; // Now .get() works!
}
```

### ❌ Pitfall #3: Type Mismatch with UI Libraries

**Problem:** `Select.onValueChange` expects `(value: string)` but nuqs needs literal types

```tsx
// ❌ BAD: Type error
<Select onValueChange={setSort} /> // setSort expects 'newest' | 'bounty', not string

// ✅ GOOD: Add typed handler
const handleSort = (value: ParsedSearchParams['sort']) => setSort(value)
<Select onValueChange={handleSort} />

// Or use type assertion (safe if your options are controlled)
<Select onValueChange={(v) => setSort(v as ParsedSearchParams['sort'])} />
```

### ❌ Pitfall #4: Missing NuqsAdapter

**Problem:** Hooks don't work without the adapter

```tsx
// ❌ BAD: No adapter in layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// ✅ GOOD: Wrap with NuqsAdapter
import { NuqsAdapter } from "nuqs/adapters/next/app";
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

### ❌ Pitfall #5: Not Wrapping in Suspense

**Problem:** Next.js warning about missing Suspense boundary

```tsx
// ❌ BAD: Client component with nuqs hooks not in Suspense
export default function Page() {
  return <ClientWithSearchParams />;
}

// ✅ GOOD: Wrap in Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientWithSearchParams />
    </Suspense>
  );
}
```

---

## Tips & Tricks

### 💡 Tip #1: Use Built-in Parsers

nuqs provides many parsers out of the box:

```tsx
import {
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsStringLiteral,
  parseAsArrayOf,
  parseAsJson,
  parseAsIsoDateTime,
  parseAsTimestamp,
} from "nuqs/server";

// Examples
tags: parseAsArrayOf(parseAsString).withDefault([]);
// ?tags=react,nextjs,typescript → ['react', 'nextjs', 'typescript']

filter: parseAsJson<{ min: number; max: number }>().withDefault({
  min: 0,
  max: 100,
});
// ?filter={"min":0,"max":100}

date: parseAsIsoDateTime.withDefault(new Date());
// ?date=2024-01-01T00:00:00.000Z
```

### 💡 Tip #2: Custom Parsers

Create your own validation:

```tsx
import { createParser } from "nuqs";

const parseAsTicketStatus = createParser({
  parse(value: string) {
    const valid = ["open", "in-progress", "done"] as const;
    return valid.includes(value as any)
      ? (value as (typeof valid)[number])
      : null;
  },
  serialize(value) {
    return value;
  },
}).withDefault("open");
```

### 💡 Tip #3: URL Key Mapping

Map internal names to different URL params:

```tsx
import { type UrlKeys } from "nuqs/server";

const parsers = { videoId: parseAsString };
const urlKeys: UrlKeys<typeof parsers> = { videoId: "v" };

const cache = createSearchParamsCache(parsers, { urlKeys });
// URL: ?v=dQw4w9WgXcQ (not ?videoId=...)
```

### 💡 Tip #4: Type-Safe Link Generation

```tsx
import { createSerializer } from 'nuqs/server'

const serialize = createSerializer(searchParsers)

// Generate URLs
<Link href={serialize('/tickets', { query: 'bug', sort: 'bounty' })}>
  Bugs by Bounty
</Link>
// → /tickets?query=bug&sort=bounty

// Merge with existing params
serialize('/tickets?page=2', { sort: 'newest' })
// → /tickets?page=2&sort=newest

// Remove params with null
serialize('/tickets?sort=bounty', { sort: null })
// → /tickets
```

### 💡 Tip #5: Clearing Values

```tsx
const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));

// Clear from URL
setQuery(null); // ?query=hello → (removed)

// Reset to default (also removes if default)
setQuery(""); // ?query=hello → (removed because '' is the default)
```

### 💡 Tip #6: History Management

```tsx
// Don't create back button entries (good for filters)
{
  history: "replace";
}

// Create back button entries (good for navigation)
{
  history: "push";
} // default
```

### 💡 Tip #7: Transitions & Loading States

```tsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useQueryState(
  "query",
  parseAsString.withOptions({
    shallow: false,
    startTransition, // ← Pass transition function
  }),
);

if (isPending) return <Spinner />;
```

---

## Real-World Examples

### Complete Search & Filter Implementation

```tsx
// src/lib/search-params.ts
import {
  createSearchParamsCache,
  Options,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const ticketSearchOptions: Options = {
  shallow: false,
  history: "replace",
  limitUrlUpdates: {
    method: "debounce",
    timeMs: 350,
  },
};

export const ticketSearchParsers = {
  query: parseAsString.withDefault("").withOptions(ticketSearchOptions),
  sort: parseAsStringLiteral(["newest", "bounty", "priority"] as const)
    .withDefault("newest")
    .withOptions(ticketSearchOptions),
  status: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions(ticketSearchOptions),
  page: parseAsInteger.withDefault(1).withOptions(ticketSearchOptions),
};

export const searchParamsCache = createSearchParamsCache(ticketSearchParsers);

export type ParsedSearchParams = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
```

```tsx
// src/app/tickets/page.tsx
import { searchParamsCache } from "@/lib/search-params";
import { type SearchParams } from "nuqs/server";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParamsCache.parse(searchParams);

  return (
    <div>
      <Suspense fallback={<Spinner />}>
        <SearchInput />
        <SortSelect />
        <StatusFilter />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <TicketsList params={params} />
      </Suspense>
    </div>
  );
}
```

```tsx
// src/components/search-input.tsx
"use client";
import { useQueryState } from "nuqs";
import { ticketSearchParsers } from "@/lib/search-params";

export default function SearchInput() {
  const [query, setQuery] = useQueryState("query", ticketSearchParsers.query);

  return (
    <input
      type="text"
      value={query ?? ""}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search tickets..."
    />
  );
}
```

```tsx
// src/components/sort-select.tsx
"use client";
import { useQueryState } from "nuqs";
import {
  ticketSearchParsers,
  type ParsedSearchParams,
} from "@/lib/search-params";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Bounty", value: "bounty" },
  { label: "Priority", value: "priority" },
] as const satisfies Array<{
  label: string;
  value: ParsedSearchParams["sort"];
}>;

export default function SortSelect() {
  const [sort, setSort] = useQueryState("sort", ticketSearchParsers.sort);

  const handleSort = (value: ParsedSearchParams["sort"]) => {
    setSort(value);
  };

  return (
    <select
      value={sort}
      onChange={(e) => handleSort(e.target.value as ParsedSearchParams["sort"])}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

---

## Quick Reference

### Must-Have Checklist

- [ ] `NuqsAdapter` in root layout
- [ ] Import from `nuqs/server` for server code
- [ ] Export parsers separately from cache
- [ ] Add `.withDefault()` to all parsers
- [ ] Set `shallow: false` for server re-renders
- [ ] Call `.parse()` in page component
- [ ] Wrap client components in `<Suspense>`
- [ ] Use `ParsedSearchParams` type for type safety

### Common Options

```tsx
{
  shallow: false,           // Enable server re-renders
  history: 'replace',       // Don't clutter history
  scroll: false,            // Don't scroll to top
  limitUrlUpdates: {        // Debounce/throttle
    method: 'debounce',
    timeMs: 350
  },
  startTransition,          // For loading states
}
```

### Useful Imports

```tsx
// Server
import {
  createSearchParamsCache,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
  parseAsInteger,
  parseAsArrayOf,
  type Options,
  type SearchParams,
  type UrlKeys,
} from "nuqs/server";

// Client
import { useQueryState, useQueryStates } from "nuqs";

// Adapter
import { NuqsAdapter } from "nuqs/adapters/next/app";
```

---

## Resources

- **Official Docs**: https://nuqs.47ng.com
- **GitHub**: https://github.com/47ng/nuqs
- **Examples**: https://github.com/47ng/nuqs/tree/next/packages/examples

---

**Pro Tip**: Bookmark this guide and refer to it when implementing search params in your Next.js projects!
