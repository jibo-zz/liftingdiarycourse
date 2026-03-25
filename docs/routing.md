# Routing Coding Standards

## Route Structure

All application routes must be nested under `/dashboard`. There are no top-level routes — every page the user interacts with after logging in lives under this prefix.

```
/dashboard              → app/pages/dashboard/index.vue
/dashboard/[subpage]    → app/pages/dashboard/[subpage]/index.vue (or [subpage].vue)
```

## Route Protection

All `/dashboard` routes are protected and must only be accessible to authenticated (logged-in) users.

Route protection is handled via **Nuxt 4 middleware** — not in page components or layouts.

### Middleware Setup

Create a named middleware file at `app/middleware/auth.ts`:

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { userId } = useAuth()

  if (!userId.value) {
    return navigateTo('/sign-in')
  }
})
```

`useAuth()` is provided by `@clerk/nuxt` and is available globally — no import needed.

### Applying Middleware to Pages

Apply the `auth` middleware in every page under `/dashboard` using `definePageMeta`:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})
</script>
```

This must appear in every `app/pages/dashboard/**/*.vue` file. Do not rely on layout-level or global middleware for route protection.

## Nuxt 4 File-Based Routing Conventions

| File path | Route |
|-----------|-------|
| `app/pages/dashboard/index.vue` | `/dashboard` |
| `app/pages/dashboard/workout/[workoutId].vue` | `/dashboard/workout/:workoutId` |
| `app/pages/dashboard/settings.vue` | `/dashboard/settings` |

- Use `index.vue` for the index route of a directory segment.
- Use `[param].vue` for dynamic segments.
- Keep page files focused on layout and data orchestration — delegate logic to composables.
