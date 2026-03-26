import { z } from 'zod'

const querySchema = z.object({
  q: z.string().default(''),
})

export default defineEventHandler(async (event) => {
  const query = querySchema.safeParse(getQuery(event))
  if (!query.success) throw createError({ statusCode: 400, message: 'Invalid query' })

  return searchExercises(query.data.q)
})
