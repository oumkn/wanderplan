import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'
import { generateDestinations } from '../services/destinations.js'

export const destinationsRouter = new Hono()

destinationsRouter.use('*', authMiddleware)

// Trigger AI destination discovery
destinationsRouter.post('/:id/discover', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')

  const { data: trip, error: tripError } = await db
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single()

  if (tripError || !trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  if (!trip.nationality || !trip.start_date || !trip.end_date) {
    return c.json({ error: 'Trip is missing required onboarding data', code: 'INVALID_STATE' }, 400)
  }

  try {
    const destinations = await generateDestinations({
      nationality: trip.nationality,
      travelStyles: trip.travel_styles ?? [],
      startDate: trip.start_date,
      endDate: trip.end_date,
      groupSize: trip.group_size ?? 2,
      budgetAmount: trip.budget_amount ?? 3000,
    })

    // Delete any previous destinations for this trip
    await db.from('destinations').delete().eq('trip_id', tripId)

    // Insert new destinations
    const { data, error } = await db
      .from('destinations')
      .insert(
        destinations.map((d) => ({
          trip_id: tripId,
          country_name: d.countryName,
          country_code: d.countryCode,
          flag_emoji: d.flagEmoji,
          visa_type: d.visaType,
          best_months: d.bestMonths,
          vibe_tags: d.vibeTags,
          cost_range_low: d.costRangeLow,
          cost_range_high: d.costRangeHigh,
          cost_currency: d.costCurrency,
          rank: d.rank,
        }))
      )
      .select()

    if (error) {
      return c.json({ error: 'Failed to save destinations', code: 'DB_ERROR' }, 500)
    }

    return c.json({ data: { destinations: data } })
  } catch (err) {
    console.error('Destination discovery error:', err)
    return c.json({ error: 'AI destination discovery failed', code: 'AI_ERROR' }, 500)
  }
})

// Select a destination
destinationsRouter.post(
  '/:id/select-destination',
  zValidator('json', z.object({ destinationId: z.string().uuid() })),
  async (c) => {
    const userId = c.get('userId')
    const tripId = c.req.param('id')
    const { destinationId } = c.req.valid('json')

    // Verify trip ownership
    const { data: trip, error: tripError } = await db
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single()

    if (tripError || !trip) {
      return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
    }

    // Get the destination
    const { data: destination, error: destError } = await db
      .from('destinations')
      .select('*')
      .eq('id', destinationId)
      .eq('trip_id', tripId)
      .single()

    if (destError || !destination) {
      return c.json({ error: 'Destination not found', code: 'NOT_FOUND' }, 404)
    }

    // Mark selected, update trip
    await db
      .from('destinations')
      .update({ selected: false })
      .eq('trip_id', tripId)

    await db
      .from('destinations')
      .update({ selected: true })
      .eq('id', destinationId)

    const { data: updatedTrip } = await db
      .from('trips')
      .update({
        destination_country: destination.country_name,
        destination_flag: destination.flag_emoji,
        visa_type: destination.visa_type,
        status: 'planning',
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId)
      .select()
      .single()

    return c.json({ data: { trip: updatedTrip, destination } })
  }
)
