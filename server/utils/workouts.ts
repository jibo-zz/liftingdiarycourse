import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'

export function getWorkoutById(userId: string, workoutId: number) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .then(rows => rows[0] ?? null)
}

export function updateWorkout(userId: string, workoutId: number, data: { name?: string; startedAt?: string }) {
  return db
    .update(workouts)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.startedAt !== undefined ? { startedAt: new Date(data.startedAt) } : {}),
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
}

import { db } from '../db'
import { workouts, workoutExercises, sets } from '../db/schema'

export function getWorkoutExercisesWithSets(workoutId: number) {
  return db.query.workoutExercises.findMany({
    where: eq(workoutExercises.workoutId, workoutId),
    with: {
      exercise: true,
      sets: { orderBy: [asc(sets.setNumber)] },
    },
    orderBy: [asc(workoutExercises.order)],
  })
}

export async function addExerciseToWorkout(workoutId: number, exerciseId: number) {
  const existing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
  const order = (existing[0]?.count ?? 0) + 1
  return db.insert(workoutExercises).values({ workoutId, exerciseId, order }).returning()
}

export function removeExerciseFromWorkout(workoutId: number, workoutExerciseId: number) {
  return db
    .delete(workoutExercises)
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workoutExercises.workoutId, workoutId)))
    .returning()
}

export function createWorkout(userId: string, data: { name: string; startedAt: string }) {
  return db
    .insert(workouts)
    .values({ userId, name: data.name, startedAt: new Date(data.startedAt) })
    .returning()
}

export function getUserWorkoutsWithStats(userId: string, date: string) {
  const start = new Date(date)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)

  return db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseCount: sql<number>`count(distinct ${workoutExercises.exerciseId})::int`,
      setCount: sql<number>`count(${sets.id})::int`,
      totalReps: sql<number>`coalesce(sum(${sets.reps}), 0)::int`,
      totalVolume: sql<number>`coalesce(sum(${sets.reps} * ${sets.weight}), 0)::numeric`,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, userId), gte(workouts.startedAt, start), lt(workouts.startedAt, end)))
    .groupBy(workouts.id, workouts.name, workouts.startedAt, workouts.completedAt)
}
