import { z } from 'zod'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  workoutExerciseId: z.coerce.number().int().positive(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = paramsSchema.safeParse({
    id: getRouterParam(event, 'id'),
    workoutExerciseId: getRouterParam(event, 'workoutExerciseId'),
  })
  if (!params.success) throw createError({ statusCode: 400, message: 'Invalid route params' })

  const workout = await getWorkoutById(userId, params.data.id)
  if (!workout) throw createError({ statusCode: 404, message: 'Workout not found' })

  await deleteSetsByWorkoutExercise(params.data.workoutExerciseId)
  return removeExerciseFromWorkout(params.data.id, params.data.workoutExerciseId)
})
