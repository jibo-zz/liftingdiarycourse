# Auth Coding Standards

## Authentication Provider

**This app uses [Clerk](https://clerk.com) exclusively for authentication** via the `@clerk/nuxt` module. Do not implement any custom auth logic, sessions, or alternative auth providers.

## Client-Side Auth

Use Clerk's composables to access auth state in Vue components and pages:

```ts
// Get the current user's auth state
const { isSignedIn, userId } = useAuth()

// Get the full user object
const { user } = useUser()
```

### Route Protection

Use Clerk's built-in middleware for protecting routes. Configure protected and public routes in `nuxt.config.ts` via the `clerk` key:

```ts
// nuxt.config.ts
clerk: {
  routerPushMode: 'replace',
}
```

For page-level guards, use the `useAuth` composable:

```ts
const { isSignedIn } = useAuth()
if (!isSignedIn.value) navigateTo('/sign-in')
```

### Auth UI Components

Use Clerk's pre-built UI components — do not build custom sign-in/sign-up forms:

```vue
<SignIn />
<SignUp />
<UserButton />
<UserProfile />
```

## Server-Side Auth

**Always use `getAuth` on the server to retrieve the authenticated user's identity.** Never trust a `userId` passed from the client.

```ts
// server/api/example.get.ts
export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // use userId to scope all data access
})
```

`event.context.auth()` is provided by `@clerk/nuxt`'s server middleware and is the only approved way to get the current user's ID on the server.

## Rules Summary

| Context | How to get user identity |
|---------|--------------------------|
| Vue component / page | `useAuth()` or `useUser()` |
| Server API route | `event.context.auth()` |
| Protecting a route | Clerk middleware or `useAuth()` guard |

- **Never** build custom session handling or JWT verification.
- **Never** trust a `userId` from query params, request body, or headers — always derive it from `event.context.auth()`.
- **Never** use a third-party auth library alongside Clerk.
