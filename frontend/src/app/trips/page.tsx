'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { apiGet } from '@/lib/api'

interface Trip {
  id: string
  destination_country: string | null
  destination_flag: string | null
  start_date: string | null
  end_date: string | null
  group_size: number
  status: string
  created_at: string
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Trip[]>('/api/v1/trips')
      .then(setTrips)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🌍 My Trips</h1>
            <p className="text-gray-500 mt-1">All your planned adventures</p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TripCard({ trip }: { trip: Trip }) {
  const href =
    trip.status === 'draft'
      ? '/onboarding'
      : trip.status === 'planning' && !trip.destination_country
      ? `/discover/${trip.id}`
      : trip.destination_country && trip.status === 'planning'
      ? `/itinerary/${trip.id}`
      : `/itinerary/${trip.id}`

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    planning: 'bg-indigo-100 text-indigo-700',
    complete: 'bg-green-100 text-green-700',
  }

  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-2xl mb-1">{trip.destination_flag ?? '🗺️'}</div>
            <h3 className="font-semibold text-gray-900">
              {trip.destination_country ?? 'Destination TBD'}
            </h3>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[trip.status] ?? statusColors.draft}`}
          >
            {trip.status}
          </span>
        </div>

        <div className="space-y-1.5 text-sm text-gray-500">
          {trip.start_date && trip.end_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {trip.start_date} → {trip.end_date}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🏖️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h2>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Start planning your first adventure. It only takes a few minutes.
      </p>
      <Link
        href="/onboarding"
        className="inline-flex items-center h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
      >
        Plan my first trip
      </Link>
    </div>
  )
}
