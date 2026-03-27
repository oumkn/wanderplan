'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api'
import { DestinationCard } from '@/components/discover/destination-card'
import { DestinationSkeleton } from '@/components/discover/destination-skeleton'
import { toast } from 'sonner'
import type { VisaType } from '@wanderplan/shared'

interface Destination {
  id: string
  countryName: string
  country_name: string
  flagEmoji: string
  flag_emoji: string
  visaType: VisaType
  visa_type: VisaType
  bestMonths: string[]
  best_months: string[]
  vibeTags: string[]
  vibe_tags: string[]
  costRangeLow: number | null
  cost_range_low: number | null
  costRangeHigh: number | null
  cost_range_high: number | null
  costCurrency: string
  cost_currency: string
}

function normalise(d: Destination) {
  return {
    id: d.id,
    countryName: d.countryName ?? d.country_name,
    flagEmoji: d.flagEmoji ?? d.flag_emoji,
    visaType: (d.visaType ?? d.visa_type) as VisaType,
    bestMonths: d.bestMonths ?? d.best_months ?? [],
    vibeTags: d.vibeTags ?? d.vibe_tags ?? [],
    costRangeLow: d.costRangeLow ?? d.cost_range_low,
    costRangeHigh: d.costRangeHigh ?? d.cost_range_high,
    costCurrency: d.costCurrency ?? d.cost_currency ?? 'USD',
  }
}

export default function DiscoverPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const [destinations, setDestinations] = useState<ReturnType<typeof normalise>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiPost<{ destinations: Destination[] }>(`/api/v1/trips/${tripId}/discover`)
      .then((res) => setDestinations(res.destinations.map(normalise)))
      .catch((err) => setError(err.message ?? 'Failed to find destinations'))
      .finally(() => setLoading(false))
  }, [tripId])

  async function handleSelect(destinationId: string) {
    try {
      await apiPost(`/api/v1/trips/${tripId}/select-destination`, { destinationId })
      router.push(`/itinerary/${tripId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to select destination')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Finding your perfect destinations…' : 'Choose your destination'}
          </h1>
          <p className="mt-2 text-gray-500">
            {loading
              ? 'Our AI is checking visa requirements, weather, and prices for you.'
              : 'Ranked by visa accessibility, seasonal fit, and your travel style.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-700 font-medium">Something went wrong</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button
              onClick={() => {
                setError('')
                setLoading(true)
                apiPost<{ destinations: Destination[] }>(`/api/v1/trips/${tripId}/discover`)
                  .then((res) => setDestinations(res.destinations.map(normalise)))
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false))
              }}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [...Array(6)].map((_, i) => <DestinationSkeleton key={i} />)
            : destinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} onSelect={handleSelect} />
              ))}
        </div>
      </div>
    </div>
  )
}
