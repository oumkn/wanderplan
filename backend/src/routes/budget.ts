import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'
import { generateBudgetEstimates } from '../services/budget.js'
import { BUDGET_CATEGORIES } from '@wanderplan/shared'

export const budgetRouter = new Hono()

budgetRouter.use('*', authMiddleware)

// Generate budget estimates
budgetRouter.post('/:id/budget/generate', async (c) => {
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

  if (!trip.destination_country) {
    return c.json({ error: 'No destination selected', code: 'INVALID_STATE' }, 400)
  }

  try {
    const estimates = await generateBudgetEstimates({
      destination: trip.destination_country,
      startDate: trip.start_date,
      endDate: trip.end_date,
      groupSize: trip.group_size ?? 2,
      totalBudget: trip.budget_amount ?? 3000,
      travelStyles: trip.travel_styles ?? [],
    })

    // Delete existing budget items
    await db.from('budget_items').delete().eq('trip_id', tripId)

    // Insert all 7 categories
    const categories = BUDGET_CATEGORIES.map((cat) => {
      const estimate = estimates.find((e) => e.category === cat.value)
      return {
        trip_id: tripId,
        category: cat.value,
        estimated_amount: estimate?.estimatedAmount ?? 0,
        actual_amount: 0,
        currency: 'USD',
      }
    })

    const { data, error: insertError } = await db
      .from('budget_items')
      .insert(categories)
      .select()

    if (insertError) {
      return c.json({ error: 'Failed to save budget', code: 'DB_ERROR' }, 500)
    }

    return c.json({ data: { items: data } })
  } catch (err) {
    console.error('Budget generation error:', err)
    return c.json({ error: 'AI budget generation failed', code: 'AI_ERROR' }, 500)
  }
})

// Get budget
budgetRouter.get('/:id/budget', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')

  const { data: trip } = await db
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single()

  if (!trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  const { data } = await db
    .from('budget_items')
    .select('*')
    .eq('trip_id', tripId)

  return c.json({ data: { items: data ?? [] } })
})

// Update budget item actual amount
budgetRouter.patch(
  '/:id/budget/:itemId',
  zValidator('json', z.object({ actualAmount: z.number().min(0) })),
  async (c) => {
    const userId = c.get('userId')
    const tripId = c.req.param('id')
    const itemId = c.req.param('itemId')
    const { actualAmount } = c.req.valid('json')

    const { data: trip } = await db
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single()

    if (!trip) {
      return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
    }

    const { data, error } = await db
      .from('budget_items')
      .update({ actual_amount: actualAmount, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (error || !data) {
      return c.json({ error: 'Failed to update budget item', code: 'DB_ERROR' }, 500)
    }

    return c.json({ data })
  }
)
