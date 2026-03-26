import { z } from 'zod'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  workoutExerciseId: z.coerce.number().int().positive(),
})

const bodySchema = z.object({
  reps: z.number().int().positive().optional(),
  weight: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = paramsSchema.safeParse({
    id: getRouterParam(event, 'id'),
    workoutExerciseId: getRouterParam(event, 'workoutExerciseId'),
  })
  if (!params.success) throw createError({ statusCode: 400, message: 'Invalid route params' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid body' })

  const workout = await getWorkoutById(userId, params.data.id)
  if (!workout) throw createError({ statusCode: 404, message: 'Workout not found' })

  return addSet(params.data.workoutExerciseId, parsed.data)
})
