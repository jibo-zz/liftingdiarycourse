import { ilike } from 'drizzle-orm'
import { db } from '../db'
import { exercises } from '../db/schema'

export function searchExercises(query: string) {
  return db
    .select()
    .from(exercises)
    .where(ilike(exercises.name, `%${query}%`))
    .limit(10)
}

export function createExercise(name: string) {
  return db.insert(exercises).values({ name }).returning()
}
