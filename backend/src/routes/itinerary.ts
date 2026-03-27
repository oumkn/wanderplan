import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { stream } from 'hono/streaming'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'
import { streamItinerary } from '../services/itinerary.js'

export const itineraryRouter = new Hono()

itineraryRouter.use('*', authMiddleware)

// Get itinerary
itineraryRouter.get('/:id/itinerary', async (c) => {
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

  const { data: days } = await db
    .from('itinerary_days')
    .select('*, activities(*)')
    .eq('trip_id', tripId)
    .order('day_number')

  return c.json({ data: { days: days ?? [] } })
})

// Stream itinerary generation
itineraryRouter.post('/:id/itinerary/generate', async (c) => {
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

  if (!trip.destination_country || !trip.start_date || !trip.end_date) {
    return c.json({ error: 'Trip missing destination or dates', code: 'INVALID_STATE' }, 400)
  }

  // Clear existing itinerary
  await db.from('itinerary_days').delete().eq('trip_id', tripId)

  return stream(c, async (s) => {
    s.onAbort(() => {
      console.log('Client disconnected from itinerary stream')
    })

    try {
      for await (const day of streamItinerary({
        destination: trip.destination_country,
        startDate: trip.start_date,
        endDate: trip.end_date,
        groupSize: trip.group_size ?? 2,
        travelStyles: trip.travel_styles ?? [],
      })) {
        // Save day to DB
        const { data: savedDay, error: dayError } = await db
          .from('itinerary_days')
          .upsert({
            trip_id: tripId,
            day_number: day.dayNumber,
            date: day.date,
            restaurant_name: day.restaurantName,
            restaurant_description: day.restaurantDescription,
            transport_note: day.transportNote,
          }, { onConflict: 'trip_id,day_number' })
          .select()
          .single()

        if (dayError || !savedDay) {
          console.error('Failed to save day:', dayError)
          continue
        }

        // Save activities
        if (day.activities?.length > 0) {
          await db.from('activities').insert(
            day.activities.map((a, idx) => ({
              day_id: savedDay.id,
              slot: a.slot,
              title: a.title,
              description: a.description,
              duration_minutes: a.durationMinutes,
              cost_estimate: a.costEstimate,
              sort_order: idx,
              latitude: a.latitude ?? null,
              longitude: a.longitude ?? null,
            }))
          )
        }

        // Stream day to client as SSE
        const { data: activities } = await db
          .from('activities')
          .select('*')
          .eq('day_id', savedDay.id)
          .order('sort_order')

        const payload = { ...savedDay, activities: activities ?? [] }
        await s.write(`data: ${JSON.stringify(payload)}\n\n`)
      }

      await s.write('event: done\ndata: {}\n\n')
    } catch (err) {
      console.error('Itinerary generation error:', err)
      await s.write(`event: error\ndata: ${JSON.stringify({ error: 'Generation failed' })}\n\n`)
    }
  })
})

// Regenerate a single day (SSE stream)
itineraryRouter.post('/:id/itinerary/days/:dayNumber/regenerate', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')
  const dayNumber = parseInt(c.req.param('dayNumber'), 10)

  const { data: trip, error } = await db
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single()

  if (error || !trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  // Get all other day numbers for context
  const { data: otherDays } = await db
    .from('itinerary_days')
    .select('day_number')
    .eq('trip_id', tripId)
    .neq('day_number', dayNumber)

  // Delete the day being regenerated
  await db
    .from('itinerary_days')
    .delete()
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)

  return stream(c, async (s) => {
    try {
      for await (const day of streamItinerary({
        destination: trip.destination_country,
        startDate: trip.start_date,
        endDate: trip.end_date,
        groupSize: trip.group_size ?? 2,
        travelStyles: trip.travel_styles ?? [],
        excludeDayNumbers: (otherDays ?? []).map((d) => d.day_number),
      })) {
        if (day.dayNumber !== dayNumber) continue

        const { data: savedDay } = await db
          .from('itinerary_days')
          .insert({
            trip_id: tripId,
            day_number: day.dayNumber,
            date: day.date,
            restaurant_name: day.restaurantName,
            restaurant_description: day.restaurantDescription,
            transport_note: day.transportNote,
          })
          .select()
          .single()

        if (!savedDay) continue

        if (day.activities?.length > 0) {
          await db.from('activities').insert(
            day.activities.map((a, idx) => ({
              day_id: savedDay.id,
              slot: a.slot,
              title: a.title,
              description: a.description,
              duration_minutes: a.durationMinutes,
              cost_estimate: a.costEstimate,
              sort_order: idx,
              latitude: a.latitude ?? null,
              longitude: a.longitude ?? null,
            }))
          )
        }

        const { data: activities } = await db
          .from('activities')
          .select('*')
          .eq('day_id', savedDay.id)
          .order('sort_order')

        const payload = { ...savedDay, activities: activities ?? [] }
        await s.write(`data: ${JSON.stringify(payload)}\n\n`)
        break
      }

      await s.write('event: done\ndata: {}\n\n')
    } catch (err) {
      console.error('Day regeneration error:', err)
      await s.write(`event: error\ndata: ${JSON.stringify({ error: 'Regeneration failed' })}\n\n`)
    }
  })
})

// Inline edit activity
itineraryRouter.patch(
  '/:id/itinerary/activities/:activityId',
  zValidator(
    'json',
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  async (c) => {
    const userId = c.get('userId')
    const tripId = c.req.param('id')
    const activityId = c.req.param('activityId')
    const body = c.req.valid('json')

    // Verify ownership via join
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
      .from('activities')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', activityId)
      .select()
      .single()

    if (error || !data) {
      return c.json({ error: 'Failed to update activity', code: 'DB_ERROR' }, 500)
    }

    return c.json({ data })
  }
)

// Geocode activities that are missing coordinates
itineraryRouter.post('/:id/itinerary/geocode', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')

  const { data: trip, error } = await db
    .from('trips')
    .select('id, destination_country')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single()

  if (error || !trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  // Fetch activities missing coordinates via join
  const { data: days } = await db
    .from('itinerary_days')
    .select('id, activities(id, title, latitude)')
    .eq('trip_id', tripId)

  const missing: { id: string; title: string }[] = []
  for (const day of days ?? []) {
    for (const act of (day.activities as { id: string; title: string; latitude: number | null }[]) ?? []) {
      if (act.latitude === null) missing.push({ id: act.id, title: act.title })
    }
  }

  if (missing.length === 0) {
    return c.json({ data: { geocoded: 0 } })
  }

  let geocoded = 0
  for (const activity of missing) {
    const query = encodeURIComponent(`${activity.title}, ${trip.destination_country}`)
    try {
      // Nominatim — free OpenStreetMap geocoding, no API key required
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WanderPlan/1.0' } }
      )
      const json = await res.json() as { lat: string; lon: string }[]
      if (json[0]) {
        await db
          .from('activities')
          .update({ latitude: parseFloat(json[0].lat), longitude: parseFloat(json[0].lon) })
          .eq('id', activity.id)
        geocoded++
      }
    } catch {
      // Skip on error, leave null
    }
    // Nominatim requires max 1 request/second
    await new Promise((r) => setTimeout(r, 1100))
  }

  return c.json({ data: { geocoded } })
})
