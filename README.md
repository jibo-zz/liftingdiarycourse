# Lifting Diary

A workout tracking web application built with Nuxt 4 and Vue 3. Log workouts, track exercises and sets, and visualize your training history on a calendar dashboard.

## Tech Stack

- **Nuxt 4** (Vue 3 + TypeScript)
- **Clerk** — authentication
- **Drizzle ORM** + **Neon** (PostgreSQL) — database
- **Nuxt UI** + **Tailwind CSS v4** — UI components and styling
- **Zod** — schema validation

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Environment Variables

Create a `.env` file in the project root:

```env
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NUXT_CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_neon_postgres_connection_string
```

### Install & Run

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server at http://localhost:3000
pnpm build         # Build for production
pnpm preview       # Preview production build
```

## Project Structure

```
app/
  pages/
    index.vue                        # Landing / sign-in page
    dashboard/
      index.vue                      # Workout calendar dashboard
      workout/
        new.vue                      # Create new workout
        [workoutId].vue              # Edit workout — add exercises & sets
  components/                        # Shared Vue components
  composables/                       # Shared composables
server/
  db/                                # Drizzle schema & database client
  api/                               # Nuxt server API routes
docs/                                # Project conventions & architecture docs
```

## Features

- Sign up / sign in via Clerk authentication
- Create and manage workouts
- Add exercises and sets (weight, reps) to each workout
- Calendar view on the dashboard showing workout history
- Dark / light / system color mode toggle
