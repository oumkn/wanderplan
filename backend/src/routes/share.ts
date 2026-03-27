import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'

export const shareRouter = new Hono()

// Public share route — no auth required
shareRouter.get('/:token', async (c) => {
  const token = c.req.param('token')

  const { data: trip, error } = await db
    .from('trips')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error || !trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  const [{ data: days }, { data: budget }] = await Promise.all([
    db
      .from('itinerary_days')
      .select('*, activities(*)')
      .eq('trip_id', trip.id)
      .order('day_number'),
    db.from('budget_items').select('*').eq('trip_id', trip.id),
  ])

  return c.json({
    data: {
      trip: {
        ...trip,
        itinerary: days ?? [],
        budget: budget ?? [],
      },
    },
  })
})

// PDF export — auth required
shareRouter.use('/pdf/*', authMiddleware)

shareRouter.get('/pdf/:tripId', async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('tripId')

  const { data: trip, error } = await db
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single()

  if (error || !trip) {
    return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
  }

  const [{ data: days }, { data: budget }] = await Promise.all([
    db
      .from('itinerary_days')
      .select('*, activities(*)')
      .eq('trip_id', tripId)
      .order('day_number'),
    db.from('budget_items').select('*').eq('trip_id', tripId),
  ])

  // Dynamic import to avoid issues in non-PDF contexts
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('WanderPlan Itinerary', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  const destination = trip.destination_flag
    ? `${trip.destination_flag} ${trip.destination_country}`
    : trip.destination_country ?? 'Unknown'
  doc.text(destination, pageWidth / 2, 30, { align: 'center' })

  doc.setFontSize(10)
  doc.text(
    `${trip.start_date} → ${trip.end_date} · ${trip.group_size} people`,
    pageWidth / 2,
    38,
    { align: 'center' }
  )

  let y = 50

  // Itinerary
  for (const day of days ?? []) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const dayHeader = `Day ${day.day_number} — ${day.date}`
    doc.text(dayHeader, 14, y)
    y += 6

    const dayActivities = (day.activities ?? []) as Array<{
      slot: string
      title: string
      description: string
      duration_minutes: number
      cost_estimate: number
    }>

    autoTable(doc, {
      startY: y,
      head: [['Time', 'Activity', 'Duration', 'Est. Cost']],
      body: dayActivities.map((a) => [
        a.slot.charAt(0).toUpperCase() + a.slot.slice(1),
        `${a.title}\n${a.description ?? ''}`,
        a.duration_minutes ? `${a.duration_minutes} min` : '—',
        a.cost_estimate ? `$${a.cost_estimate}` : '—',
      ]),
      theme: 'striped',
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4

    if (day.restaurant_name) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(`🍽 ${day.restaurant_name}: ${day.restaurant_description ?? ''}`, 14, y)
      y += 4
    }
    if (day.transport_note) {
      doc.setFont('helvetica', 'italic')
      doc.text(`🚌 ${day.transport_note}`, 14, y)
      y += 4
    }

    y += 4

    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }

  // Budget summary
  if ((budget ?? []).length > 0) {
    if (y > 200) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Budget Summary', 14, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Estimated', 'Actual']],
      body: (budget ?? []).map((item) => [
        item.category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        `$${item.estimated_amount ?? 0}`,
        `$${item.actual_amount ?? 0}`,
      ]),
      theme: 'striped',
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
  }

  const pdfBytes = doc.output('arraybuffer')

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="wanderplan-${trip.destination_country ?? 'trip'}.pdf"`,
    },
  })
})
