import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'

export const tripsRouter = new Hono()

tripsRouter.use('*', authMiddleware)

// Create trip
tripsRouter.post(
  '/',
  zValidator(
    'json',
    z.object({
      nationality: z.string().min(1),
      travelStyles: z.array(z.string()).min(1),
      startDate: z.string(),
      endDate: z.string(),
      groupSize: z.number().int().min(1).max(20),
      budgetAmount: z.number().min(0),
      budgetCurrency: z.string().default('USD'),
    })
  ),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const { data, error } = await db
      .from('trips')
      .insert({
        user_id: userId,
        nationality: body.nationality,
        travel_styles: body.travelStyles,
        start_date: body.startDate,
        end_date: body.endDate,
        group_size: body.groupSize,
        budget_amount: body.budgetAmount,
        budget_currency: body.budgetCurrency,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Create trip error:', error)
      return c.json({ error: 'Failed to create trip', code: 'DB_ERROR' }, 500)
    }

    return c.json({ data }, 201)
  }
)

// List trips
tripsRouter.get('/', async (c) => {
  const userId = c.get('userId')

  const { data, error } = await db
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: 'Failed to fetch trips', code: 'DB_ERROR' }, 500)
  }

  return c.json({ data })
})

// Get single trip with nested data
tripsRouter.get('/:id', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')

  const { data: trip, error } = await db
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single()

  if (error || !trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  const [{ data: destinations }, { data: days }, { data: budget }] = await Promise.all([
    db.from('destinations').select('*').eq('trip_id', tripId).order('rank'),
    db
      .from('itinerary_days')
      .select('*, activities(*)')
      .eq('trip_id', tripId)
      .order('day_number'),
    db.from('budget_items').select('*').eq('trip_id', tripId),
  ])

  return c.json({
    data: {
      ...trip,
      destinations: destinations ?? [],
      itinerary: days ?? [],
      budget: budget ?? [],
    },
  })
})

// Update trip
tripsRouter.patch(
  '/:id',
  zValidator(
    'json',
    z.object({
      nationality: z.string().optional(),
      travelStyles: z.array(z.string()).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      groupSize: z.number().int().min(1).max(20).optional(),
      budgetAmount: z.number().min(0).optional(),
      status: z.enum(['draft', 'planning', 'complete']).optional(),
    })
  ),
  async (c) => {
    const userId = c.get('userId')
    const tripId = c.req.param('id')
    const body = c.req.valid('json')

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.nationality !== undefined) updateData.nationality = body.nationality
    if (body.travelStyles !== undefined) updateData.travel_styles = body.travelStyles
    if (body.startDate !== undefined) updateData.start_date = body.startDate
    if (body.endDate !== undefined) updateData.end_date = body.endDate
    if (body.groupSize !== undefined) updateData.group_size = body.groupSize
    if (body.budgetAmount !== undefined) updateData.budget_amount = body.budgetAmount
    if (body.status !== undefined) updateData.status = body.status

    const { data, error } = await db
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !data) {
      return c.json({ error: 'Failed to update trip', code: 'DB_ERROR' }, 500)
    }

    return c.json({ data })
  }
)

// Delete trip
tripsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')

  const { error } = await db
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', userId)

  if (error) {
    return c.json({ error: 'Failed to delete trip', code: 'DB_ERROR' }, 500)
  }

  return c.json({ data: { success: true } })
})
