# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server at http://localhost:3000
pnpm build         # Build for production
pnpm preview       # Preview production build
```

## Architecture

This is a **Nuxt 4** application (Vue 3 + TypeScript) using:

- **`@clerk/nuxt`** — authentication (Clerk)
- **`@nuxtjs/tailwindcss`** — styling
- **`@nuxt/eslint`** — linting

The app entry point is `app/app.vue`. Nuxt 4 uses the `app/` directory convention (pages go in `app/pages/`, components in `app/components/`, composables in `app/composables/`, etc.).

Clerk auth is configured via environment variables — `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NUXT_CLERK_SECRET_KEY` must be set in `.env`.
