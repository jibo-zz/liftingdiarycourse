import { z } from 'zod'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  startedAt: z.string().datetime().optional(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) throw createError({ statusCode: 400, message: 'Invalid route param' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 422, message: 'Invalid input', data: parsed.error.flatten() })

  const [updated] = await updateWorkout(userId, params.data.id, parsed.data)
  if (!updated) throw createError({ statusCode: 404, message: 'Workout not found' })

  return updated
})
