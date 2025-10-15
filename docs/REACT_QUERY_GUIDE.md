# 🚀 Complete React Query (TanStack Query) Guide for Next.js

> **Your comprehensive guide to mastering React Query with Next.js App Router**

---

## 📚 Table of Contents

1. [Core Concepts](#-core-concepts)
2. [Setup with Next.js](#-setup-with-nextjs)
3. [useQuery - Data Fetching](#-usequery---data-fetching)
4. [useMutation - Data Mutations](#-usemutation---data-mutations)
5. [useInfiniteQuery - Infinite Scroll](#-useinfinitequery---infinite-scroll)
6. [Query Invalidation & Refetching](#-query-invalidation--refetching)
7. [Optimistic Updates](#-optimistic-updates)
8. [Best Practices](#-best-practices)
9. [Common Pitfalls](#-common-pitfalls)
10. [Real-World Patterns](#-real-world-patterns)

---

## 🎯 Core Concepts

### What is React Query?

React Query is a **server-state management library** that handles:
- Data fetching
- Caching
- Synchronization
- Background updates
- Optimistic updates

### Key Terms

```typescript
// Query Key: Unique identifier for cached data
['todos']           // Simple key
['todos', { id: 1 }]  // With parameters
['users', userId, 'posts'] // Hierarchical

// Query Function: Returns a promise
const queryFn = () => fetch('/api/todos').then(res => res.json())

// Query Client: Manages all queries & cache
const queryClient = new QueryClient()
```

---

## 🔧 Setup with Next.js

### 1. Installation

```bash
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools # Dev tools (optional)
```

### 2. Create Query Provider (App Router)

```tsx
// src/app/_providers/react-query/react-query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ Create client inside component to avoid sharing between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection)
            retry: 3,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 3. Add to Root Layout

```tsx
// src/app/layout.tsx
import ReactQueryProvider from './_providers/react-query/react-query-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
```

---

## 📥 useQuery - Data Fetching

### Basic Usage

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'

async function getTodos() {
  const res = await fetch('/api/todos')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function TodoList() {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['todos'], // Unique key for this query
    queryFn: getTodos,   // Function that returns a promise
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.map((todo: any) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Important States

```tsx
const {
  data,            // The fetched data
  error,           // Error object if failed
  isLoading,       // First load (no cached data)
  isPending,       // Query is executing
  isFetching,      // Fetching (includes background refetch)
  isSuccess,       // Query succeeded
  isError,         // Query failed
  refetch,         // Manual refetch function
  status,          // 'pending' | 'error' | 'success'
} = useQuery({ ... })
```

### With Parameters

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId], // Include params in key
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    enabled: !!userId, // Only run if userId exists
  })

  return <div>{user?.name}</div>
}
```

### Dependent Queries

```tsx
function UserPosts({ userId }: { userId: string }) {
  // First query: Get user
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  // Second query: Get user's posts (depends on user)
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchPosts(user!.id),
    enabled: !!user, // Only run when user is available
  })

  return <div>...</div>
}
```

### Parallel Queries

```tsx
function Dashboard() {
  const users = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const posts = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
  const comments = useQuery({ queryKey: ['comments'], queryFn: fetchComments })

  // All three queries run in parallel!

  if (users.isLoading || posts.isLoading || comments.isLoading) {
    return <div>Loading...</div>
  }

  return <div>All data loaded!</div>
}
```

---

## ✏️ useMutation - Data Mutations

### Basic Usage

```tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createTodo(newTodo: { title: string }) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify(newTodo),
  })
  return res.json()
}

export default function TodoForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <button
      onClick={() => mutation.mutate({ title: 'New Todo' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Adding...' : 'Add Todo'}
    </button>
  )
}
```

### Mutation States

```tsx
const {
  mutate,        // Trigger mutation (fire and forget)
  mutateAsync,   // Trigger mutation (returns promise)
  isPending,     // Mutation in progress
  isError,       // Mutation failed
  isSuccess,     // Mutation succeeded
  data,          // Response data
  error,         // Error object
  reset,         // Reset mutation state
} = useMutation({ ... })
```

### With Callbacks

```tsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (variables) => {
    // Called before mutation
    console.log('About to update:', variables)
    
    // Return context for rollback
    return { previousData: 'something' }
  },
  onSuccess: (data, variables, context) => {
    // Called on success
    toast.success('Updated!')
  },
  onError: (error, variables, context) => {
    // Called on error
    toast.error(error.message)
  },
  onSettled: (data, error, variables, context) => {
    // Called after success or error
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### Async/Await Pattern

```tsx
async function handleSubmit() {
  try {
    const result = await mutation.mutateAsync({ title: 'New Todo' })
    console.log('Success:', result)
    router.push('/todos')
  } catch (error) {
    console.error('Failed:', error)
  }
}
```

---

## ♾️ useInfiniteQuery - Infinite Scroll

### Basic Setup

```tsx
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

type Comment = { id: string; content: string }
type CommentsPage = {
  data: Comment[]
  nextCursor?: { id: string; createdAt: number }
  hasMore: boolean
}

async function getComments({ pageParam }: { pageParam?: { id: string; createdAt: number } }) {
  const res = await fetch(`/api/comments?cursor=${JSON.stringify(pageParam)}`)
  return res.json() as Promise<CommentsPage>
}

export default function Comments() {
  const { ref, inView } = useInView() // Intersection observer

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['comments'],
    queryFn: getComments,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  })

  // Auto-load on scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const comments = data?.pages.flatMap(page => page.data) ?? []

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.content}</div>
      ))}
      
      {/* Trigger element for infinite scroll */}
      <div ref={ref}>
        {isFetchingNextPage && <div>Loading more...</div>}
        {!hasNextPage && <div>No more comments</div>}
      </div>
    </div>
  )
}
```

### Data Structure

```typescript
// useInfiniteQuery returns this structure:
{
  pages: [
    { data: [...], nextCursor: {...} },  // Page 1
    { data: [...], nextCursor: {...} },  // Page 2
    { data: [...], nextCursor: null },   // Page 3 (last)
  ],
  pageParams: [undefined, cursor1, cursor2]
}
```

---

## 🔄 Query Invalidation & Refetching

### Invalidate Queries

```tsx
const queryClient = useQueryClient()

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['todos'] })

// Invalidate all queries starting with 'todos'
queryClient.invalidateQueries({ queryKey: ['todos'], exact: false })

// Invalidate multiple queries
queryClient.invalidateQueries({ queryKey: ['todos'] })
queryClient.invalidateQueries({ queryKey: ['users'] })

// Refetch immediately
await queryClient.invalidateQueries({ 
  queryKey: ['todos'],
  refetchType: 'active' // Only refetch active queries
})

// Mark as stale without refetching
queryClient.invalidateQueries({ 
  queryKey: ['todos'],
  refetchType: 'none'
})
```

### Manual Refetch

```tsx
const { refetch } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
  enabled: false, // Don't auto-fetch
})

// Later...
<button onClick={() => refetch()}>Refresh</button>
```

### Refetch Intervals

```tsx
// Poll every 5 seconds
useQuery({
  queryKey: ['notifications'],
  queryFn: getNotifications,
  refetchInterval: 5000,
})

// Poll only when window is focused
useQuery({
  queryKey: ['notifications'],
  queryFn: getNotifications,
  refetchInterval: 5000,
  refetchIntervalInBackground: false,
})
```

---

## ⚡ Optimistic Updates

### Pattern 1: Simple (Show Pending State)

```tsx
const addTodoMutation = useMutation({
  mutationFn: createTodo,
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

// In render:
<ul>
  {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
  
  {/* Show pending item with reduced opacity */}
  {addTodoMutation.isPending && (
    <li style={{ opacity: 0.5 }}>
      {addTodoMutation.variables?.title}
    </li>
  )}
</ul>
```

### Pattern 2: Advanced (With Rollback)

```tsx
const updateTodoMutation = useMutation({
  mutationFn: updateTodo,
  
  onMutate: async (newTodo) => {
    // 1. Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    
    // 2. Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos'])
    
    // 3. Optimistically update cache
    queryClient.setQueryData(['todos'], (old: Todo[]) => 
      old.map(todo => todo.id === newTodo.id ? newTodo : todo)
    )
    
    // 4. Return context for rollback
    return { previousTodos }
  },
  
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context?.previousTodos)
  },
  
  onSettled: () => {
    // Always refetch after success or error
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### Pattern 3: Infinite Query Optimistic Update

```tsx
const handleUpsertComment = (newComment: Comment) => {
  queryClient.setQueryData(
    ['comments', ticketId],
    (oldData: InfiniteData<CommentsPage>) => {
      if (!oldData) return oldData

      // Check if editing existing comment
      const commentExists = oldData.pages.some(page =>
        page.data.some(comment => comment.id === newComment.id)
      )

      if (commentExists) {
        // Update existing
        return {
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(comment =>
              comment.id === newComment.id ? newComment : comment
            ),
          })),
          pageParams: oldData.pageParams,
        }
      } else {
        // Add new to first page
        const [firstPage, ...restPages] = oldData.pages
        return {
          pages: [
            { ...firstPage, data: [newComment, ...firstPage.data] },
            ...restPages,
          ],
          pageParams: oldData.pageParams,
        }
      }
    }
  )
}
```

---

## ✅ Best Practices

### 1. Query Keys Structure

```tsx
// ❌ BAD: Inconsistent keys
['user']
['users', userId]
['user-profile', userId]

// ✅ GOOD: Consistent hierarchy
['users']                    // All users
['users', userId]            // Specific user
['users', userId, 'posts']   // User's posts
['users', userId, 'posts', postId] // Specific post
```

### 2. Query Functions

```tsx
// ❌ BAD: Inline function
useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/api/todos').then(r => r.json()),
})

// ✅ GOOD: Separate function
const getTodos = async () => {
  const res = await fetch('/api/todos')
  if (!res.ok) throw new Error('Failed to fetch todos')
  return res.json()
}

useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})
```

### 3. Type Safety

```tsx
type Todo = {
  id: string
  title: string
  completed: boolean
}

const { data } = useQuery<Todo[]>({
  queryKey: ['todos'],
  queryFn: getTodos,
})

// data is typed as Todo[] | undefined
```

### 4. Error Handling

```tsx
// Global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      throwOnError: false,
    },
    mutations: {
      onError: (error) => {
        toast.error(error.message)
      },
    },
  },
})

// Per-query error handling
useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
  retry: 1,
  onError: (error) => {
    console.error('Failed to fetch todos:', error)
  },
})
```

### 5. Stale Time Configuration

```tsx
// Stale time = how long data is considered fresh
useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
  staleTime: 60 * 1000, // 1 minute
  // Data won't refetch for 1 minute unless manually invalidated
})

// Common values:
staleTime: 0                  // Always stale (default)
staleTime: 60 * 1000          // 1 minute
staleTime: 5 * 60 * 1000      // 5 minutes
staleTime: Infinity           // Never stale
```

### 6. Server Components + React Query

```tsx
// app/page.tsx (Server Component)
async function HomePage() {
  const todos = await getTodos() // Server-side fetch

  return <TodoList initialData={todos} />
}

// TodoList.tsx (Client Component)
'use client'

export function TodoList({ initialData }: { initialData: Todo[] }) {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    initialData, // Hydrate with SSR data
  })

  return <ul>{data.map(todo => ...)}</ul>
}
```

---

## ⚠️ Common Pitfalls

### 1. Sharing QueryClient Across Requests (Next.js)

```tsx
// ❌ BAD: Client created at module level
const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
// This shares cache between all users! Security issue!

// ✅ GOOD: Create new client per request
export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 2. Forgetting to Return Promise in invalidateQueries

```tsx
// ❌ BAD: Mutation completes before refetch
useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
    // isPending becomes false immediately
  },
})

// ✅ GOOD: Wait for refetch
useMutation({
  mutationFn: createTodo,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['todos'] })
    // isPending stays true until refetch completes
  },
})
```

### 3. Not Using Query Keys Correctly

```tsx
// ❌ BAD: Dynamic data in key without deps
useQuery({
  queryKey: ['todos'],
  queryFn: () => getTodos(userId), // userId not in key!
})

// ✅ GOOD: Include dependencies in key
useQuery({
  queryKey: ['todos', userId],
  queryFn: () => getTodos(userId),
})
```

### 4. Overusing React Query

```tsx
// ❌ BAD: Using React Query for local state
const { data: count } = useQuery({
  queryKey: ['count'],
  queryFn: () => Promise.resolve(0),
})

// ✅ GOOD: Use useState for local state
const [count, setCount] = useState(0)
```

### 5. Not Canceling Queries in Optimistic Updates

```tsx
// ❌ BAD: Race condition possible
onMutate: async (newTodo) => {
  queryClient.setQueryData(['todos'], ...)
  // Ongoing fetch might overwrite this!
}

// ✅ GOOD: Cancel ongoing fetches
onMutate: async (newTodo) => {
  await queryClient.cancelQueries({ queryKey: ['todos'] })
  queryClient.setQueryData(['todos'], ...)
}
```

---

## 💼 Real-World Patterns

### Pattern 1: Search with Debounce

```tsx
import { useDebouncedValue } from '@/hooks/use-debounced-value'

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedValue(searchTerm, 300)

  const { data: results } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => search(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  })

  return (
    <>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <SearchResults results={results} />
    </>
  )
}
```

### Pattern 2: Pagination

```tsx
function PaginatedPosts() {
  const [page, setPage] = useState(0)

  const { data, isPreviousData } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    keepPreviousData: true, // Keep old data while fetching
  })

  return (
    <div>
      <PostsList posts={data?.posts} />
      
      <button 
        onClick={() => setPage(old => Math.max(0, old - 1))}
        disabled={page === 0}
      >
        Previous
      </button>
      
      <button
        onClick={() => setPage(old => old + 1)}
        disabled={!data?.hasMore}
      >
        Next
      </button>
    </div>
  )
}
```

### Pattern 3: Prefetching

```tsx
function PostsList() {
  const queryClient = useQueryClient()

  return posts.map(post => (
    <Link
      key={post.id}
      href={`/posts/${post.id}`}
      onMouseEnter={() => {
        // Prefetch on hover
        queryClient.prefetchQuery({
          queryKey: ['post', post.id],
          queryFn: () => fetchPost(post.id),
        })
      }}
    >
      {post.title}
    </Link>
  ))
}
```

### Pattern 4: Dependent Mutations

```tsx
function CreatePostWithImage() {
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
  })

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      // 1. Upload image first
      const imageUrl = await uploadImageMutation.mutateAsync(data.image)
      
      // 2. Then create post with image URL
      await createPostMutation.mutateAsync({
        ...data,
        imageUrl,
      })
      
      toast.success('Post created!')
    } catch (error) {
      toast.error('Failed to create post')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 🎓 Pro Tips

### 1. DevTools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add to your app
<QueryClientProvider client={queryClient}>
  <YourApp />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>

// Press: Toggle button in corner
// - See all queries
- View cache
- Refetch manually
- See query timeline
```

### 2. Query Options Factory

```tsx
// queries/todos.ts
export const todoQueries = {
  all: () => ['todos'] as const,
  lists: () => [...todoQueries.all(), 'list'] as const,
  list: (filters: string) => [...todoQueries.lists(), { filters }] as const,
  details: () => [...todoQueries.all(), 'detail'] as const,
  detail: (id: string) => [...todoQueries.details(), id] as const,
}

// Usage
useQuery({
  queryKey: todoQueries.detail(id),
  queryFn: () => getTodo(id),
})

// Easy invalidation
queryClient.invalidateQueries({ queryKey: todoQueries.all() })
```

### 3. Custom Hooks

```tsx
// hooks/use-todos.ts
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// Usage
function TodoList() {
  const { data: todos } = useTodos()
  const createMutation = useCreateTodo()
  
  return ...
}
```

---

## 📖 Quick Reference

### Query States

```
pending → fetching → success ✅
pending → fetching → error ❌

isLoading = isPending && isFetching (first load)
isFetching = currently fetching (any fetch)
isPending = no data yet
```

### Common Options

```tsx
{
  staleTime: 60000,           // 1 min fresh
  gcTime: 300000,             // 5 min cache
  retry: 3,                   // 3 retries
  retryDelay: attempt => attempt * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: false,
  enabled: true,
}
```

### Cheat Sheet

```tsx
// Fetch data
useQuery({ queryKey, queryFn })

// Mutate data
useMutation({ mutationFn, onSuccess })

// Infinite scroll
useInfiniteQuery({ queryKey, queryFn, getNextPageParam })

// Invalidate
queryClient.invalidateQueries({ queryKey })

// Manual refetch
queryClient.refetchQueries({ queryKey })

// Set data
queryClient.setQueryData(queryKey, newData)

// Get data
queryClient.getQueryData(queryKey)
```

---

## 🎯 When to Use What?

| Scenario | Tool | Why |
|----------|------|-----|
| Fetch list | `useQuery` | Simple data fetching |
| Create/Update/Delete | `useMutation` | Modify server data |
| Infinite scroll | `useInfiniteQuery` | Paginated data |
| Real-time data | `useQuery` + `refetchInterval` | Polling |
| Form submission | `useMutation` | Server action |
| Search | `useQuery` + debounce | Conditional fetch |
| Prefetch | `queryClient.prefetchQuery` | Optimize UX |

---

## 🚀 Next Steps

1. ✅ Install React Query in your project
2. ✅ Set up QueryClientProvider
3. ✅ Replace a fetch with useQuery
4. ✅ Try a mutation with useMutation
5. ✅ Experiment with DevTools
6. ✅ Build infinite scroll with useInfiniteQuery
7. ✅ Try optimistic updates

---

**Happy Querying! 🎉**

*For more, check:*
- [Official Docs](https://tanstack.com/query/latest)
- [Examples](https://tanstack.com/query/latest/docs/framework/react/examples/react/basic)
- [GitHub](https://github.com/TanStack/query)

