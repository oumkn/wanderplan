'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiGet } from '@/lib/api'
import { DayCard } from '@/components/itinerary/day-card'
import { StreamingIndicator } from '@/components/itinerary/streaming-indicator'
import { toast } from 'sonner'

interface Activity {
  id: string
  slot: string
  title: string
  description: string | null
  duration_minutes: number | null
  cost_estimate: number | null
}

interface Day {
  id: string
  day_number: number
  date: string
  restaurant_name: string | null
  restaurant_description: string | null
  transport_note: string | null
  activities: Activity[]
}

async function getAuthHeader(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return `Bearer ${session?.access_token ?? ''}`
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function* readStream(url: string, authHeader: string, body?: unknown): AsyncGenerator<Day> {
  const res = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok || !res.body) throw new Error('Stream request failed')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.startsWith('event: done') || line.startsWith('event: error')) return
      if (line.startsWith('data: ')) {
        try {
          const day = JSON.parse(line.slice(6)) as Day
          if (day.day_number) yield day
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

export default function ItineraryPage({ params }: { params: { tripId: string } }) {
  const { tripId } = params
  const [days, setDays] = useState<Day[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamingDay, setStreamingDay] = useState<number | null>(null)
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null)
  const [newDayNumbers, setNewDayNumbers] = useState<Set<number>>(new Set())
  const [tripStatus, setTripStatus] = useState<string | null>(null)
  const generatingRef = useRef(false)

  const generate = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    setStreaming(true)
    setDays([])
    setNewDayNumbers(new Set())
    try {
      const auth = await getAuthHeader()
      for await (const day of readStream(`/api/v1/trips/${tripId}/itinerary/generate`, auth)) {
        setStreamingDay(day.day_number + 1)
        setNewDayNumbers((prev) => new Set(Array.from(prev).concat(day.day_number)))
        setDays((prev) => {
          const without = prev.filter((d) => d.day_number !== day.day_number)
          return [...without, day].sort((a, b) => a.day_number - b.day_number)
        })
      }
      setStreamingDay(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate itinerary')
    } finally {
      setStreaming(false)
      setStreamingDay(null)
      generatingRef.current = false
    }
  }, [tripId])

  // On mount: fetch trip status + check if itinerary exists, else generate
  useEffect(() => {
    const authHeader = getAuthHeader()
    authHeader.then(async (auth) => {
      const [tripData, res] = await Promise.all([
        apiGet<{ status: string }>(`/api/v1/trips/${tripId}`),
        fetch(`${API_URL}/api/v1/trips/${tripId}/itinerary`, { headers: { Authorization: auth } }),
      ])
      setTripStatus(tripData.status)

      const json = await res.json()
      const existingDays: Day[] = json.data?.days ?? []

      if (existingDays.length > 0) {
        setDays(existingDays)
      } else {
        generate()
      }
    })
  }, [tripId, generate])

  async function handleRegenerate(dayNumber: number) {
    setRegeneratingDay(dayNumber)
    try {
      const auth = await getAuthHeader()
      for await (const day of readStream(
        `/api/v1/trips/${tripId}/itinerary/days/${dayNumber}/regenerate`,
        auth
      )) {
        setNewDayNumbers((prev) => new Set(Array.from(prev).concat(day.day_number)))
        setDays((prev) => {
          const without = prev.filter((d) => d.day_number !== day.day_number)
          return [...without, day].sort((a, b) => a.day_number - b.day_number)
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate day')
    } finally {
      setRegeneratingDay(null)
    }
  }

  const showContinue = !streaming && days.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/trips" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Itinerary</h1>
          {streaming && (
            <p className="mt-2 text-sm text-gray-500">
              Generating your day-by-day plan…
            </p>
          )}
        </div>

        <div className="space-y-4">
          {days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              tripId={tripId}
              onRegenerate={handleRegenerate}
              isRegenerating={regeneratingDay === day.day_number}
              isNew={newDayNumbers.has(day.day_number)}
            />
          ))}

          {streaming && streamingDay && (
            <StreamingIndicator dayNumber={streamingDay} />
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {showContinue && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Link
              href={`/map/${tripId}`}
              className="flex items-center justify-center gap-2 flex-1 h-12 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              🗺️ View on Map
            </Link>
            {tripStatus !== 'complete' && (
              <Link
                href={`/budget/${tripId}`}
                className="flex items-center justify-center flex-1 h-12 rounded-xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 transition-colors"
              >
                Continue to Budget →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
