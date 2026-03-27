import './env.js'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthRouter } from './routes/health.js'
import { tripsRouter } from './routes/trips.js'
import { destinationsRouter } from './routes/destinations.js'
import { itineraryRouter } from './routes/itinerary.js'
import { budgetRouter } from './routes/budget.js'
import { shareRouter } from './routes/share.js'

const app = new Hono()

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : ['http://localhost:3000']

app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)

app.use('*', logger())

app.route('/', healthRouter)
app.route('/api/v1/trips', tripsRouter)
app.route('/api/v1/trips', destinationsRouter)
app.route('/api/v1/trips', itineraryRouter)
app.route('/api/v1/trips', budgetRouter)
app.route('/api/v1/share', shareRouter)

app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500)
})

const port = parseInt(process.env.PORT ?? '3001', 10)
console.log(`WanderPlan API starting on port ${port}`)

serve({ fetch: app.fetch, port })

export default app
