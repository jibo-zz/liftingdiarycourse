import { z } from 'zod'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) throw createError({ statusCode: 400, message: 'Invalid route param' })

  const workout = await getWorkoutById(userId, params.data.id)
  if (!workout) throw createError({ statusCode: 404, message: 'Workout not found' })

  return workout
})
