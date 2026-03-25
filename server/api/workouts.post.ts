import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1),
  startedAt: z.iso.datetime(),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 422, message: 'Invalid input', data: parsed.error.flatten() })

  return createWorkout(userId, parsed.data)
})
