'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'
import { MapSidebar } from './sidebar'

// Dynamically import the map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
  </div>
)})

export const DAY_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#14b8a6',
]

const SLOT_ORDER = ['morning', 'afternoon', 'evening']

export interface RawActivity {
  id: string
  slot: string
  title: string
  description: string | null
  cost_estimate: number | null
  sort_order: number
  latitude: number | null
  longitude: number | null
}

export interface RawDay {
  id: string
  day_number: number
  date: string
  activities: RawActivity[]
}

export interface MappedActivity {
  id: string
  slot: string
  title: string
  cost_estimate: number | null
  latitude: number
  longitude: number
  markerNumber: number
}

export interface DayWithMappedActivities {
  id: string
  day_number: number
  date: string
  color: string
  activities: MappedActivity[]
}

export function processDay(day: RawDay, dayIndex: number): DayWithMappedActivities {
  const color = DAY_COLORS[dayIndex % DAY_COLORS.length]
  const sorted = [...day.activities].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  )
  const activities: MappedActivity[] = sorted
    .filter((a): a is RawActivity & { latitude: number; longitude: number } =>
      a.latitude !== null && a.longitude !== null
    )
    .map((a, idx) => ({
      id: a.id,
      slot: a.slot,
      title: a.title,
      cost_estimate: a.cost_estimate,
      latitude: a.latitude,
      longitude: a.longitude,
      markerNumber: idx + 1,
    }))

  return { id: day.id, day_number: day.day_number, date: day.date, color, activities }
}

export function MapView({ tripId }: { tripId: string }) {
  const [days, setDays] = useState<DayWithMappedActivities[]>([])
  const [loading, setLoading] = useState(true)
  const [geocoding, setGeocoding] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null)

  const loadItinerary = useCallback(async () => {
    try {
      const data = await apiGet<{ days: RawDay[] }>(`/api/v1/trips/${tripId}/itinerary`)
      const rawDays: RawDay[] = data.days ?? []

      const needsGeocode = rawDays.some((d) =>
        d.activities.some((a) => a.latitude === null)
      )

      if (needsGeocode) {
        setGeocoding(true)
        try {
          await apiPost(`/api/v1/trips/${tripId}/itinerary/geocode`)
        } catch {
          // Continue with what we have
        }
        setGeocoding(false)
        const updated = await apiGet<{ days: RawDay[] }>(`/api/v1/trips/${tripId}/itinerary`)
        setDays(updated.days.map((d, i) => processDay(d, i)))
      } else {
        setDays(rawDays.map((d, i) => processDay(d, i)))
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    loadItinerary()
  }, [loadItinerary])

  const allActivities = days.flatMap((d) => d.activities)

  function handleSidebarClick(lat: number, lng: number, activityId: string) {
    setSelectedActivityId(activityId)
    flyToRef.current?.(lat, lng)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top nav */}
      <div className="h-14 bg-white border-b border-gray-100 shadow-sm flex items-center px-4 gap-4 flex-shrink-0 z-10">
        <Link
          href={`/itinerary/${tripId}`}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Itinerary
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-semibold text-gray-900">Trip Map</span>
        {geocoding && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Fetching activity locations…
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {!loading && (
          <MapSidebar
            days={days}
            selectedActivityId={selectedActivityId}
            onActivityClick={handleSidebarClick}
          />
        )}

        <div className="flex-1 relative h-[50vh] md:h-auto">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm text-gray-500">Loading map…</p>
              </div>
            </div>
          ) : allActivities.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">No locations available</p>
                <p className="text-sm text-gray-500 mt-1">Generate a new itinerary to see it on the map.</p>
              </div>
            </div>
          ) : (
            <LeafletMap
              days={days}
              selectedActivityId={selectedActivityId}
              onSelectActivity={setSelectedActivityId}
              onFlyToReady={(fn) => { flyToRef.current = fn }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
