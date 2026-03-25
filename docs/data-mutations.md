# Data Mutations Standards

## Overview

All data mutations (create, update, delete) must follow a strict two-layer pattern: a **server utility helper** that wraps the Drizzle ORM call, and a **Nuxt API route** that validates input, checks auth, and calls that helper.

---

## Layer 1: Server Utility Helpers (`server/utils/`)

All database mutation logic must be implemented as helper functions inside the **`/server/utils/`** directory — the same convention used for query helpers.

### Rules

- Every helper function must use **Drizzle ORM**. **Raw SQL is strictly forbidden.**
- Helpers must be grouped by domain (e.g., `server/utils/workouts.ts`, `server/utils/exercises.ts`).
- Each helper must accept a `userId` parameter and **always scope mutations to that `userId`** — never mutate rows belonging to another user.
- Helpers must not perform auth themselves — auth is the responsibility of the API route.

### Example structure

```
server/
  utils/
    workouts.ts     # Drizzle-based mutation helpers for workouts
    exercises.ts    # Drizzle-based mutation helpers for exercises
```

```ts
// server/utils/workouts.ts
import { eq, and } from 'drizzle-orm'
import { workouts } from '../db/schema'

export function createWorkout(db: DrizzleDb, userId: string, data: { name: string; date: string }) {
  return db.insert(workouts).values({ ...data, userId }).returning()
}

export function updateWorkout(db: DrizzleDb, userId: string, workoutId: string, data: { name?: string; date?: string }) {
  return db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
}

export function deleteWorkout(db: DrizzleDb, userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
}
```

---

## Layer 2: Nuxt 4 API Routes (`server/api/`)

All data mutations must be exposed through **Nuxt 4 API route handlers** in `server/api/`. These handlers are the only entry point for mutations from the client.

### Rules

- Use the appropriate HTTP method for each operation: `POST` for create, `PATCH` or `PUT` for update, `DELETE` for delete.
- File naming must reflect the method (e.g., `workouts.post.ts`, `workouts/[id].patch.ts`, `workouts/[id].delete.ts`).
- Every route **must** authenticate the user via Clerk's server-side helper. Never trust a client-supplied user ID.
- Every route **must** validate all incoming arguments with **Zod** before passing them to a helper, and make sure it's installed before using it.
- Route params (e.g., `[id]`) must be **typed** — use `getRouterParam` and parse/validate them explicitly. **`FormData` must never be used as a parameter type or body parser.**
- Body data must be read with `readBody` and validated through a Zod schema.

### Example structure

```
server/
  api/
    workouts.post.ts          # Create a workout
    workouts/
      [id].patch.ts           # Update a workout
      [id].delete.ts          # Delete a workout
```

### Examples

```ts
// server/api/workouts.post.ts
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1),
  date: z.string().date(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 422, message: 'Invalid input', data: parsed.error.flatten() })

  return createWorkout(db, userId, parsed.data)  // auto-imported from server/utils/workouts.ts
})
```

```ts
// server/api/workouts/[id].patch.ts
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().date().optional(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) throw createError({ statusCode: 400, message: 'Invalid route param' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 422, message: 'Invalid input', data: parsed.error.flatten() })

  return updateWorkout(db, userId, params.data.id, parsed.data)
})
```

```ts
// server/api/workouts/[id].delete.ts
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) throw createError({ statusCode: 400, message: 'Invalid route param' })

  return deleteWorkout(db, userId, params.data.id)
})
```

---

## Calling Mutations from the Client

Mutations must be triggered from the client using `$fetch` inside page or component `<script setup>`. Do not use `useAsyncData` for mutations — that is for data fetching only.

```ts
// app/pages/workouts.vue
<script setup lang="ts">
async function handleCreate() {
  await $fetch('/api/workouts', {
    method: 'POST',
    body: { name: 'Leg Day', date: '2026-03-25' },
  })
}

async function handleDelete(id: string) {
  await $fetch(`/api/workouts/${id}`, { method: 'DELETE' })
}
</script>
```

---

## Summary of Hard Rules

| Rule | Detail |
|------|--------|
| Mutations via server utils | All DB mutation logic lives in `server/utils/`, wrapping Drizzle ORM |
| No raw SQL | Drizzle ORM only — always |
| Mutations via API routes | All mutations exposed through `server/api/` handlers only |
| No `FormData` | Never use `FormData` as a body or param type — use typed JSON bodies |
| Typed route params | Always extract and validate route params with `getRouterParam` + Zod |
| Zod validation required | Every API route must validate all inputs (body + params) with Zod |
| Auth always server-side | User identity always from `event.context.auth()` — never from the client |
| Scope by `userId` | Every mutation must be scoped to the authenticated user's ID |
