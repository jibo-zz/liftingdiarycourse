import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).max(255),
})

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid body' })

  try {
    return await createExercise(parsed.data.name)
  }
  catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === '23505') throw createError({ statusCode: 409, message: 'Exercise already exists' })
    throw e
  }
})
