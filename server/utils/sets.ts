import { and, eq, max } from 'drizzle-orm'
import { db } from '../db'
import { sets } from '../db/schema'

export async function addSet(workoutExerciseId: number, data: { reps?: number; weight?: string }) {
  const result = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
  const nextSetNumber = (result[0]?.maxSetNumber ?? 0) + 1

  return db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: nextSetNumber,
      reps: data.reps ?? null,
      weight: data.weight ?? null,
    })
    .returning()
}

export function deleteSet(setId: number) {
  return db.delete(sets).where(eq(sets.id, setId)).returning()
}

export function deleteSetsByWorkoutExercise(workoutExerciseId: number) {
  return db.delete(sets).where(eq(sets.workoutExerciseId, workoutExerciseId)).returning()
}
