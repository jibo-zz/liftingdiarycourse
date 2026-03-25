# Data Fetching Standards

## CRITICAL: Server Components Only

**ALL data fetching must be done exclusively via server components (using `useAsyncData` or `useFetch` with server-side execution, or Nuxt's `<script setup>` with server-only composables).**

Data must NEVER be fetched via:
- Client-side composables or components (no `onMounted` fetches, no client-only `useFetch` calls)
- Any other client-side mechanism (e.g., direct `fetch()` calls outside of `useAsyncData`)

This is a hard rule — no exceptions.

## Database Query Structure

All database queries must be implemented as helper functions inside the **`/server/utils/`** directory. This is the Nuxt 4 recommended location for shared server-side utilities, which are auto-imported within the `server/` directory.

### Rules for helper functions

- Every helper function must use **Drizzle ORM** to query the database. **Raw SQL is strictly forbidden.**
- Helper functions should be grouped by domain (e.g., `server/utils/workouts.ts`, `server/utils/exercises.ts`).
- Each helper function must accept a `userId` parameter and **always filter queries by that `userId`**.

### Example structure

```
server/
  utils/
    workouts.ts     # Drizzle-based helpers for workout queries
    exercises.ts    # Drizzle-based helpers for exercise queries
```

```ts
// server/utils/workouts.ts
import { eq } from 'drizzle-orm'
import { workouts } from '../db/schema'

export function getUserWorkouts(db: DrizzleDb, userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId))
}
```

## Data Ownership & Security

This is non-negotiable: **a logged-in user must only ever be able to access their own data.**

Every helper function and every server-side data fetch must:

1. Retrieve the authenticated user's ID (via Clerk's `getAuth` or equivalent server-side helper).
2. Pass that `userId` to the relevant helper function.
3. Filter all queries by `userId` — never return rows belonging to another user.

**Never trust client-supplied user IDs.** Always derive the user identity from the server-side session.

## How It All Connects

`server/utils/` helpers are auto-imported **only within the Nitro server context** (`server/api/`, `server/middleware/`, etc.) — they are NOT available in `app/pages/`. The correct pattern is:

1. Create a `server/api/` route that calls the helper (auth is checked here via `getAuth`)
2. Call that route from the page using `$fetch` inside `useAsyncData` — during SSR Nuxt short-circuits the HTTP call, so no client-side fetch ever occurs

### Example

```ts
// server/api/workouts.get.ts
export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return getUserWorkouts(userId)  // auto-imported from server/utils/workouts.ts
})
```

```ts
// app/pages/workouts.vue
<script setup lang="ts">
const { data: workouts } = await useAsyncData('workouts', () =>
  $fetch('/api/workouts'),
  { server: false }
)
</script>
```

> **Why `server: false`?** During SSR, Nuxt's internal `$fetch` calls do not forward the browser's session cookies. Clerk authenticates via cookies, so any API route that calls `event.context.auth()` will receive no `userId` and return a `401`. Always set `server: false` on `useAsyncData` calls so the fetch runs client-side where the Clerk session is available.
