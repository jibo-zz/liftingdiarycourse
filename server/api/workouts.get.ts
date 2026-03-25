export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth()

  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { date } = getQuery(event)

  if (!date || typeof date !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing required query param: date' })
  }

  return getUserWorkoutsWithStats(userId, date)
})
